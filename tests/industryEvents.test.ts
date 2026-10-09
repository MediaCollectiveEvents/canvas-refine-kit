import assert from "node:assert/strict";
import test from "node:test";
import { getEventIndustryContext, getIndustryAccessLabel, getMajorIndustryEvents, getUpcomingCalendarEntries } from "../src/lib/industryEvents";
import { showsPlannerExperiences, getPlannerLocations, getIndustryEventIssues, getIndustryEvents, getIndustryMonths, getIndustryPlannerMonths, getIndustryPlannerYears, getPlannerEntryLink, getUndatedIndustryEvents } from "../src/lib/industryEvents";
import { getAllEvents, getEventById } from "../src/lib/events";
import { getYearCalendarSnapshot } from "../src/lib/eventCalendar";

const external = getIndustryEvents();
const media = getAllEvents();
const sample = external[0];

test("industry context uses only reviewed IDs and official dataset URLs", () => {
  for (const [id, externalId, label] of [[1, "nab-show-2026", "Post-show context"], [2, "mpts-2026", "Around MPTS"], [3, "ibc-2026", "During IBC"], [5, "mpts-2027", "Around MPTS"], [6, "ibc-2027", "During IBC"]] as const) {
    const context = getEventIndustryContext(id)!;
    assert.equal(context.label, label);
    assert.equal(context.event.id, externalId);
    assert.equal(context.event.sourceUrl, external.find(event => event.id === externalId)!.sourceUrl);
  }
  assert.equal(getEventIndustryContext(4), undefined);
  assert.equal(getEventIndustryContext(999), undefined);
  assert.equal(getEventIndustryContext(1, []), undefined);
  assert.equal(getEventIndustryContext(1)!.event.city, "Las Vegas");
});

test("verified external dataset validates and preserves all 20 records and ranges", () => {
  assert.deepEqual(getIndustryEventIssues(), []);
  assert.equal(external.length, 20);
  assert.deepEqual(external.filter(event => event.id.startsWith("nab")).map(event => [event.startDate, event.endDate]), [["2026-04-18", "2026-04-22"], ["2027-04-03", "2027-04-07"]]);
  assert.equal(external.some(event => event.id.includes("plugfest")), false);
});

test("validation rejects duplicate/invalid IDs, invalid dates, ordering and unsafe links", () => {
  for (const row of [
    {...sample, id: "bad id"}, {...sample, startDate: "2026-02-30"},
    {...sample, startDate: "2026-1-13"}, {...sample, endDate: "2025-12-31"},
    {...sample, sourceUrl: "javascript:alert(1)"}, {...sample, startDate: undefined},
  ]) assert.throws(() => getIndustryEvents([row]));
  assert.throws(() => getIndustryEvents([sample, sample]));
});

test("missing optional geography/end dates stay absent; undated planned records remain separate", () => {
  const nab = external.find(event => event.id === "nab-show-2026")!;
  assert.equal(Object.hasOwn(nab, "country"), false);
  const online = external.find(event => event.id === "dpp-innovation-showcase-june-2026")!;
  assert.equal(Object.hasOwn(online, "city"), false);
  assert.equal(Object.hasOwn(online, "country"), false);
  const dinner = external.find(event => event.id === "dpp-backlight-executive-dinner-2026")!;
  assert.equal(Object.hasOwn(dinner, "endDate"), false);
  const planned = getIndustryEvents([{...sample, id: "planned-event", status: "planned", startDate: undefined, endDate: undefined}]);
  assert.equal(getUndatedIndustryEvents(planned).length, 1);
  assert.equal(getIndustryMonths(2026, planned).flatMap(month => month.events).length, 0);
});

test("external ordering and year/month grouping remain stable", () => {
  assert.deepEqual(getIndustryEvents([...external].reverse()), external);
  assert.deepEqual(getIndustryPlannerYears(media, external), [2026, 2027]);
  assert.equal(getIndustryMonths(2026).flatMap(month => month.events).length, 16);
  assert.deepEqual(getIndustryMonths(2027).filter(month => month.events.length).map(month => month.month), [2, 4, 5, 9]);
});

for (const [filter, expected] of [["all", 4], ["networking-social", 4], ["conference-aligned", 3], ["knowledge-discussion", 2]] as const) {
  test(`presentation merge: ${filter} filters only Media Collective events`, () => {
    const months = getIndustryPlannerMonths(2026, filter, media);
    const entries = months.flatMap(month => month.entries);
    assert.equal(months.length, 12);
    assert.equal(entries.filter(entry => entry.kind === "media-collective").length, expected);
    assert.equal(entries.filter(entry => entry.kind === "external").length, 16);
    assert.deepEqual(getIndustryPlannerMonths(2026, filter, [...media].reverse(), [...external].reverse()), months);
  });
}

test("external entries retain official links and never gain internal routes; ICS is Media Collective only", () => {
  const entries = getIndustryPlannerMonths(2026, "all", media).flatMap(month => month.entries);
  for (const entry of entries) {
    assert.equal(getPlannerEntryLink(entry), entry.kind === "external" ? entry.event.sourceUrl : `/events/${entry.event.id}`);
    if (entry.kind === "external") assert.ok(getPlannerEntryLink(entry).startsWith("https://"));
  }
  const snapshot = getYearCalendarSnapshot(entries.flatMap(entry => entry.kind === "media-collective" ? [entry.event] : []), 2026);
  assert.equal(snapshot.includedCount, 4);
  for (const event of external) {
    assert.equal(snapshot.ics.includes(`UID:${event.id}`), false);
    assert.equal(getEventById(event.id), undefined);
  }
  assert.equal(snapshot.ics.match(/BEGIN:VEVENT/g)?.length, 4);
  assert.equal(getYearCalendarSnapshot(media, 2027).includedCount, 0);
});


test("location filtering uses approved Media Collective IDs and verified external cities", () => {
  const london = getIndustryPlannerMonths(2026, "all", media, external, "London").flatMap(month => month.entries);
  assert.deepEqual(london.filter(entry => entry.kind === "media-collective").map(entry => entry.event.id), [1, 2, 4]);
  const amsterdam = getIndustryPlannerMonths(2026, "all", media, external, "Amsterdam").flatMap(month => month.entries);
  assert.deepEqual(amsterdam.filter(entry => entry.kind === "media-collective").map(entry => entry.event.id), [3]);
  assert.deepEqual(amsterdam.filter(entry => entry.kind === "external").map(entry => entry.event.id).sort(), ["dpp-espresso-summit-2026", "dpp-networking-drinks-ibc-2026", "ibc-2026"]);
});

test("unknown cities remain in All locations only, including unmapped canonical IDs", () => {
  const unmapped = {...media[0], id: 99, title: "London", venue: "London"};
  const all = getIndustryPlannerMonths(2026, "all", [...media, unmapped], external).flatMap(month => month.entries);
  assert.ok(all.some(entry => entry.event.id === 99));
  assert.ok(all.some(entry => entry.event.id === "dtg-futuretech-2026"));
  const london = getIndustryPlannerMonths(2026, "all", [...media, unmapped], external, "London").flatMap(month => month.entries);
  assert.ok(!london.some(entry => entry.event.id === 99 || entry.event.id === "dtg-futuretech-2026"));
});

test("experience and city combine while external visibility is independent of experience", () => {
  const entries = getIndustryPlannerMonths(2026, "knowledge-discussion", media, external, "London").flatMap(month => month.entries);
  assert.deepEqual(entries.filter(entry => entry.kind === "media-collective").map(entry => entry.event.id), [1, 4]);
  assert.equal(entries.filter(entry => entry.kind === "external").length, 5);
  const social = getIndustryPlannerMonths(2026, "networking-social", media, external, "London").flatMap(month => month.entries);
  assert.deepEqual(social.filter(entry => entry.kind === "media-collective").map(entry => entry.event.id), [1, 2, 4]);
});

test("location options are sorted, unique and derived from the selected year's records", () => {
  assert.deepEqual(getPlannerLocations(2026, media), ["Amsterdam", "Las Vegas", "London", "Los Angeles", "New York", "Paris"]);
  assert.deepEqual(getPlannerLocations(2027, media), ["Amsterdam", "Barcelona", "Las Vegas", "London"]);
});

for (const [source, year, city, experience, expected] of [
  ["media-collective", 2026, "all", "all", 4],
  ["external", 2026, "all", "knowledge-discussion", 16],
  ["external", 2027, "all", "networking-social", 4],
  ["media-collective", 2027, "all", "all", 4],
  ["media-collective", 2026, "London", "knowledge-discussion", 2],
  ["external", 2026, "Amsterdam", "knowledge-discussion", 3],
  ["all", 2026, "London", "knowledge-discussion", 7],
] as const) {
  test(`source ${source} combines with ${year}, ${city}, ${experience}`, () => {
    const entries = getIndustryPlannerMonths(year, experience, media, external, city, source).flatMap(month => month.entries);
    assert.equal(entries.length, expected);
    if (source !== "all") assert.ok(entries.every(entry => entry.kind === source));
  });
}

test("Industry calendar hides experience controls; other sources retain them", () => {
  assert.equal(showsPlannerExperiences("external"), false);
  assert.equal(showsPlannerExperiences("all"), true);
  assert.equal(showsPlannerExperiences("media-collective"), true);
});

test("2027 planner includes all four announcements using only confirmed show and location mappings", () => {
  const months = getIndustryPlannerMonths(2027, "all", [...media].reverse(), [...external].reverse(), "all", "media-collective");
  assert.deepEqual(months, getIndustryPlannerMonths(2027, "all", media, external, "all", "media-collective"));
  assert.deepEqual(months.filter(month => month.entries.length).map(month =>
    [month.month, month.entries.map(entry => entry.event.id)]), [[5, [5]], [9, [8, 6, 7]]]);
  assert.equal(getEventIndustryContext(5)?.event.startDate, getEventById(5)?.date);
  assert.equal(getEventIndustryContext(7)?.event.id, "ibc-2027");
  assert.equal(getEventIndustryContext(8)?.event.id, "ibc-2027");
  assert.deepEqual(getIndustryPlannerMonths(2027, "all", media, external, "Amsterdam", "media-collective")
    .flatMap(month => month.entries).map(entry => entry.event.id), [6, 7]);
  assert.equal(getIndustryPlannerMonths(2027, "conference-aligned", media, external, "all", "media-collective")
    .flatMap(month => month.entries).length, 3);
  const snapshot = getYearCalendarSnapshot(media, 2027);
  assert.equal(snapshot.includedCount, 0);
  assert.equal(snapshot.omittedCount, 4);
});


test("2027 external calendar preserves confirmed dates without inventing pending editions", () => {
  assert.deepEqual(external.filter(event => event.startDate?.startsWith("2027-")).map(event =>
    [event.id, event.startDate, event.endDate, event.city]), [
    ["ise-2027", "2027-02-02", "2027-02-05", "Barcelona"],
    ["nab-show-2027", "2027-04-03", "2027-04-07", "Las Vegas"],
    ["mpts-2027", "2027-05-12", "2027-05-13", "London"],
    ["ibc-2027", "2027-09-10", "2027-09-13", "Amsterdam"],
  ]);
});


test("access labels use approved organiser rules and verified event IDs, leaving unknowns blank", () => {
  for (const event of external) {
    const expected = event.organiser.startsWith("DPP") ? "Members or paid"
      : event.id === "dtg-summer-drinks-2026" ? "Members only"
      : "Registration required";
    assert.equal(getIndustryAccessLabel(event), expected);
  }
  assert.equal(getIndustryAccessLabel({...sample, id: "unknown-event", organiser: "Unknown"}), undefined);
  assert.equal(getIndustryAccessLabel({...sample, id: "dtg-futuretech-2027", organiser: "DTG"}), undefined);
});


test("London filter includes the reviewed 2027 MPTS reception", () => {
  assert.deepEqual(getIndustryPlannerMonths(2027, "all", media, external, "London", "media-collective").flatMap(month => month.entries).map(entry => entry.event.id), [5]);
});


test("Phase 1 calendar is a dated, confirmed major-event subset without deleting records", () => {
  const before = JSON.stringify(external);
  const major = getMajorIndustryEvents([...external].reverse());
  assert.equal(major.length, 12);
  assert.deepEqual(major.filter(event => event.category === "trade-show"), external.filter(event => event.category === "trade-show"));
  assert.deepEqual(major.filter(event => event.category === "industry-event").map(event => event.id), [
    "dpp-european-broadcaster-summit-2026", "dtg-summit-2026", "dpp-media-supply-festival-2026",
    "dpp-espresso-summit-2026", "dpp-leaders-briefing-2026",
  ]);
  assert.ok(major.every(event => event.startDate && event.status === "confirmed"));
  assert.equal(JSON.stringify(external), before);
  assert.equal(getMajorIndustryEvents([{ ...sample, status: "planned" }, { ...sample, startDate: undefined }]).length, 0);
  assert.ok(major.every((event, index) => index === 0 || event.startDate! >= major[index - 1].startDate!));
});


test("Phase 1 calendar merges canonical Media Collective dates with only curated external events", () => {
  for (const year of [2026, 2027]) {
    const entries = getIndustryPlannerMonths(year, "all", media, getMajorIndustryEvents()).flatMap(month => month.entries);
    assert.deepEqual(entries.filter(entry => entry.kind === "media-collective").map(entry => entry.event.id), media.filter(event => event.date.startsWith(String(year))).map(event => event.id));
    assert.ok(entries.filter(entry => entry.kind === "external").every(entry => getMajorIndustryEvents().some(event => event.id === entry.event.id)));
    const dates = entries.map(entry => entry.kind === "media-collective" ? entry.event.date : entry.event.startDate!);
    assert.deepEqual(dates, [...dates].sort());
  }
});


test("public calendar excludes past start dates dynamically without removing canonical history", () => {
  const before = JSON.stringify({ external, media });
  const entries = [2026, 2027].flatMap(year => getIndustryPlannerMonths(year, "all", media, getMajorIndustryEvents()).flatMap(month => month.entries));
  const visible = getUpcomingCalendarEntries(entries, new Date("2026-10-08T12:00:00Z"));
  assert.deepEqual(visible.filter(entry => entry.kind === "external").map(entry => entry.event.id), ["dpp-leaders-briefing-2026", "ise-2027", "nab-show-2027", "mpts-2027", "ibc-2027"]);
  const datedShow = entries.find(entry => entry.kind === "external" && entry.event.id === "ibc-2027")!;
  assert.equal(getUpcomingCalendarEntries([datedShow], new Date("2027-09-10T12:00:00Z")).length, 1);
  assert.equal(getUpcomingCalendarEntries([datedShow], new Date("2027-09-11T12:00:00Z")).length, 0);
  assert.equal(getUpcomingCalendarEntries(entries, new Date("2028-01-01T12:00:00Z")).length, 0);
  const dates = visible.map(entry => entry.kind === "media-collective" ? entry.event.date : entry.event.startDate!);
  assert.deepEqual(dates, [...dates].sort());
  assert.equal(JSON.stringify({ external, media }), before);
});
