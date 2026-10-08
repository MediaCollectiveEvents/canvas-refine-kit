import assert from "node:assert/strict";
import test from "node:test";
import {
  getAllEvents, getEventById, getEventIssues, getPastEvents, getRegistrationId,
  getRegistrationOptions, getUpcomingEvents, normalizeEvents, filterEventsByExperience, getRelatedEvents, getAttendanceRegistrationId, getEventCountdownDays,
} from "../src/lib/events";

const now = new Date("2026-10-02T12:00:00Z");

test("countdown compares London calendar days, including midnight and DST boundaries", () => {
  assert.equal(getEventCountdownDays("2026-11-24", new Date("2026-10-08T12:00:00Z")), 47);
  assert.equal(getEventCountdownDays("2026-11-24", new Date("2026-11-23T23:59:00Z")), 1);
  assert.equal(getEventCountdownDays("2026-11-24", new Date("2026-11-24T00:00:00Z")), 0);
  assert.equal(getEventCountdownDays("2026-11-24", new Date("2026-11-25T12:00:00Z")), 0);
  assert.equal(getEventCountdownDays("2027-05-12", new Date("2027-05-11T23:30:00Z")), 0);
  assert.equal(getEventCountdownDays("2027-03-29", new Date("2027-03-28T00:30:00Z")), 1);
  assert.equal(getEventCountdownDays("2026-10-26", new Date("2026-10-25T00:30:00Z")), 1);
  assert.equal(getEventCountdownDays("invalid", now), undefined);
  assert.equal(getEventCountdownDays("2027-02-30", now), undefined);
});

test("next-event countdown advances only after the event's London calendar date", () => {
  const source = { events: [{ id: 10, date: "2027-05-12" }, { id: 11, date: "2027-05-14" }] };
  const today = new Date("2027-05-12T20:00:00Z");
  assert.equal(getUpcomingEvents(1, source, today)[0].id, 10);
  const tomorrow = new Date("2027-05-12T23:00:00Z");
  const next = getUpcomingEvents(1, source, tomorrow)[0];
  assert.equal(next.id, 11);
  assert.equal(getEventCountdownDays(next.date, tomorrow), 1);
});

test("attendance CTAs exclude past and unmapped events without removing historical mappings", () => {
  for (const id of [1, 2, 3, 4]) assert.equal(getAttendanceRegistrationId(getEventById(id)!, undefined, now), undefined);
  assert.equal(getAttendanceRegistrationId(getEventById(1)!, undefined, new Date("2026-04-01T12:00:00Z")), "nab-review");
  assert.equal(getAttendanceRegistrationId(getEventById(3)!, undefined, new Date("2026-04-01T12:00:00Z")), undefined);
  assert.equal(getRegistrationId(1), "nab-review");
  assert.equal(getRegistrationId(2), "mpts-drinks");
  assert.equal(getRegistrationId(3), "networking-breakfast");
  assert.equal(getRegistrationId(4), undefined);
});

test("related events rank approved overlap, then date distance, and exclude the current event", () => {
  const expected = [[2, 3], [1, 3], [2, 1], [1, 3]];
  for (const id of [1, 2, 3, 4]) {
    const current = getEventById(id)!;
    assert.deepEqual(getRelatedEvents(current).map(event => event.id), expected[id - 1]);
    assert.deepEqual(getRelatedEvents(current, { events: [...getAllEvents()].reverse() }).map(event => event.id), expected[id - 1]);
  }
});

test("related events require approved categories and use numeric ID for equal date-distance ties", () => {
  const current = getEventById(1)!;
  assert.deepEqual(getRelatedEvents({ ...current, experienceCategories: undefined }), []);
  const candidates = [3, 2].map(id => ({ ...current, id }));
  assert.deepEqual(getRelatedEvents(current, { events: candidates }).map(event => event.id), [2, 3]);
  assert.deepEqual(getRelatedEvents(current, { events: [{ ...current, id: 5, experienceCategories: ["unsupported"] }] }), []);
});

test("aggregate IDs survive reordering and resolve numeric detail routes", () => {
  const events = getAllEvents();
  const reordered = { events: [...events].reverse() };
  for (const id of [1, 2, 3, 4]) {
    assert.equal(getEventById(String(id), reordered)?.id, id);
  }
  assert.equal(getEventById("nab-review-2026"), undefined);
  assert.equal(getEventById("networking-breakfast"), undefined);
});

test("date and explicit status agree across homepage and listing selectors", () => {
  const source = { events: [
    { id: 10, date: "2026-10-01", type: "upcoming" },
    { id: 11, date: "2026-10-03", type: "past" },
    { id: 12, date: "2026-10-02", type: "upcoming" },
    { id: 13, date: "2026-10-04", type: "upcoming" },
  ] };
  assert.deepEqual(getUpcomingEvents(undefined, source, now).map(event => event.id), [12, 13]);
  assert.deepEqual(getPastEvents(source, now).map(event => event.id), [11, 10]);
});

test("missing and duplicate IDs never acquire position-based identities", () => {
  const source = { events: [{ title: "Missing" }, { id: 3 }, { id: 3 }, { id: 4 }] };
  assert.deepEqual(normalizeEvents(source).map(event => event.id), [4]);
  assert.equal(getEventIssues(source).length, 2);
  assert.equal(getEventById(3, source), undefined);
});

test("an unmapped event resolves by its ID without borrowing an IBC registration", () => {
  const source = { events: [...getAllEvents(), { id: 99, title: "IBC BREAKFAST", date: "2027-01-01" }] };
  assert.equal(getEventById("99", source)?.id, 99);
  assert.equal(getRegistrationId(99, source), undefined);
  assert.equal(getRegistrationOptions(source).length, 4);
});

test("registration preserves confirmed IDs and past-event eligibility with canonical labels", () => {
  assert.equal(getRegistrationId(1), "nab-review");
  assert.equal(getRegistrationId(2), "mpts-drinks");
  assert.equal(getRegistrationId(3), "networking-breakfast");
  const options = getRegistrationOptions();
  assert.equal(options.length, 4);
  assert.match(options.find(option => option.id === "mpts-drinks")!.label, /13 May 2026/);
  assert.deepEqual(options.at(-1), { id: "all-events", label: "All Events", displayLabel: "All future Media Collective events" });
});

test("draft CMS data supplies content without mutating canonical records", () => {
  const original = getEventById(1)!.title;
  const source = { events: [{ ...getEventById(1), title: "Draft title" }] };
  assert.equal(getEventById(1, source)?.title, "Draft title");
  assert.equal(getEventById(1)?.title, original);
});

test("optional experience categories are explicit, validated and deduplicated", () => {
  const events = normalizeEvents({ events: [
    { id: 10, title: "Networking conference", type: "upcoming" },
    { id: 11, experienceCategories: ["networking-social", "knowledge-discussion", "networking-social", "unknown", 12] },
  ] });
  assert.equal(events[0].experienceCategories, undefined);
  assert.equal(events[0].type, "upcoming");
  assert.deepEqual(events[1].experienceCategories, ["networking-social", "knowledge-discussion"]);
});

test("calendar metadata is optional and retained without inferring timestamps", () => {
  const events = normalizeEvents({ events: [
    { id: 10, date: "2026-05-06", time: "09:30–12:00", venue: "London" },
    { id: 11, startsAt: "2027-01-02T09:00:00+00:00", endsAt: "2027-01-02T10:00:00+00:00", timeZone: "Europe/London" },
  ] });
  assert.equal(events[0].startsAt, undefined);
  assert.equal(events[0].endsAt, undefined);
  assert.equal(events[0].timeZone, undefined);
  assert.equal(events[0].date, "2026-05-06");
  assert.equal(events[1].startsAt, "2027-01-02T09:00:00+00:00");
  assert.equal(events[1].endsAt, "2027-01-02T10:00:00+00:00");
  assert.equal(events[1].timeZone, "Europe/London");
});


test("OFF AIR is upcoming, routable and remains explicitly unmapped for registration", () => {
  assert.equal(getAllEvents().length, 8);
  assert.deepEqual(getUpcomingEvents(undefined, undefined, now).map(event => event.id), [4, 5, 8, 6, 7]);
  assert.deepEqual(getPastEvents(undefined, now).map(event => event.id), [3, 2, 1]);
  const event = getEventById("4")!;
  assert.equal(event.title, "OFF AIR: The Unfiltered Future of Media");
  assert.deepEqual(event.experienceCategories, ["networking-social", "knowledge-discussion"]);
  assert.equal(event.startsAt, "2026-11-24T15:00:00+00:00");
  assert.equal(event.endsAt, "2026-11-24T18:00:00+00:00");
  assert.equal(event.timeZone, "Europe/London");
  assert.match(event.details!, /provisional programme/);
  assert.equal(getRegistrationId(4), undefined);
  assert.equal(getRegistrationOptions().some(option => option.label.includes("OFF AIR")), false);
});

test("approved calendar offsets and IBC display label remain consistent", () => {
  assert.equal(getEventById(1)?.startsAt, "2026-05-06T09:30:00+01:00");
  assert.equal(getEventById(2)?.endsAt, "2026-05-13T21:00:00+01:00");
  const ibc = getEventById(3)!;
  assert.equal(ibc.startsAt, "2026-09-12T08:00:00+02:00");
  assert.equal(ibc.endsAt, "2026-09-12T10:00:00+02:00");
  assert.equal(ibc.timeZone, "Europe/Amsterdam");
  assert.equal(ibc.time, "08:00–10:00 CEST");
});

for (const [category, expected] of [
  ["all", [1, 2, 3, 4, 5, 8, 6, 7]],
  ["networking-social", [1, 2, 3, 4, 5, 8, 6, 7]],
  ["conference-aligned", [1, 2, 3, 5, 8, 6]],
  ["knowledge-discussion", [1, 4]],
] as const) {
  test(`experience filter ${category} preserves canonical membership and order`, () => {
    assert.deepEqual(filterEventsByExperience(getAllEvents(), category).map(event => event.id), expected);
  });
}

test("unclassified events stay in All; empty categories remain empty without inference", () => {
  const events = normalizeEvents({ events: [{ id: 10, title: "Networking conference", date: "2027-01-01" }] });
  assert.deepEqual(filterEventsByExperience(events, "all").map(event => event.id), [10]);
  assert.deepEqual(filterEventsByExperience(events, "networking-social"), []);
  assert.deepEqual(filterEventsByExperience(events, "conference-aligned"), []);
  assert.deepEqual(filterEventsByExperience(events, "knowledge-discussion"), []);
});


const unchangedSubmissionLabels = {
  "nab-review": "Post-NAB Review Breakfast 2026: Signals, Strategy and Operating Reality - White City, London (6 May 2026)",
  "mpts-drinks": "The Media Collective – MPTS 2026 – After Show Drinks Reception - Olympia, London (13 May 2026)",
  "networking-breakfast": "Join us at The Media Collective Networking Breakfast @ IBC 2026 - 2 Europaplein, 1078 GZ Amsterdam (12 September 2026)",
  "all-events": "All Events",
};

test("future-edition display labels preserve exact submitted edition labels", () => {
  const options = getRegistrationOptions();
  const displayLabels = {
    "nab-review": "NAB Review",
    "mpts-drinks": "MPTS Reception",
    "networking-breakfast": "IBC Breakfast",
    "all-events": "All future Media Collective events",
  };
  assert.equal(options.length, 4);
  for (const [id, label] of Object.entries(unchangedSubmissionLabels)) {
    const option = options.find(option => option.id === id)!;
    assert.equal(option.label, label);
    assert.equal(option.displayLabel, displayLabels[id]);
  }
  assert.equal(getRegistrationId(4), undefined);
});

test("multi-select payload retains comma-joined submission labels, not display labels", () => {
  const options = getRegistrationOptions();
  const selectedIds = ["nab-review", "networking-breakfast", "all-events"];
  const submitted = selectedIds.map(id => options.find(option => option.id === id)?.label || id).join(", ");
  assert.equal(submitted, [unchangedSubmissionLabels["nab-review"], unchangedSubmissionLabels["networking-breakfast"], "All Events"].join(", "));
  assert.equal(submitted.includes("All future Media Collective events"), false);
});

test("2027 announcements are upcoming, ordered, routable and leave unknown details unset", () => {
  const events = getUpcomingEvents(undefined, undefined, now).filter(event => event.date.startsWith("2027-"));
  assert.deepEqual(events.map(event => [event.id, event.title, event.date]), [
    [5, "MPTS Networking Reception 2027", "2027-05-12"],
    [8, "The Green Line", "2027-09-09"],
    [6, "IBC Networking Breakfast 2027", "2027-09-11"],
    [7, "IBC Decompression Party 2027", "2027-09-12"],
  ]);
  assert.deepEqual(getEventIssues(), []);
  for (const event of events) {
    assert.equal(getEventById(String(event.id))?.id, event.id);
    assert.equal(event.venue, event.id === 5 ? "Olympia" : event.id === 6 ? "RAI" : event.id === 8 ? "Eurostar" : "Piano Bar");
    assert.equal(event.location, event.id === 5 ? "London" : event.id === 8 ? "St Pancras to Amsterdam Centraal" : "Amsterdam");
    assert.equal(event.time, "");
    if (![7, 8].includes(event.id)) assert.equal(event.description, "");
    assert.equal(event.startsAt, undefined);
    assert.equal(event.endsAt, undefined);
    assert.equal(event.timeZone, undefined);
    assert.equal(getRegistrationId(event.id), undefined);
  }
  assert.deepEqual(events[0].experienceCategories, getEventById(2)?.experienceCategories);
  assert.deepEqual(getEventById(6)?.experienceCategories, getEventById(3)?.experienceCategories);
  assert.deepEqual(getEventById(8)?.experienceCategories, ["networking-social", "conference-aligned"]);
  assert.match(getEventById(8)?.description || "", /Eurostar carriage.*St Pancras.*Amsterdam Centraal.*IBC/);
  assert.deepEqual(getEventById(7)?.experienceCategories, ["networking-social"]);
});


test("public upcoming selectors sort before limiting or filtering, independent of source order", () => {
  const source = { events: getAllEvents().reverse() };
  const originalOrder = source.events.map(event => event.id);
  const upcoming = getUpcomingEvents(undefined, source, now);
  assert.deepEqual(upcoming.map(event => event.date), [
    "2026-11-24", "2027-05-12", "2027-09-09", "2027-09-11", "2027-09-12",
  ]);
  assert.deepEqual(getUpcomingEvents(3, source, now).map(event => event.date),
    upcoming.slice(0, 3).map(event => event.date));
  assert.deepEqual(filterEventsByExperience(upcoming, "conference-aligned").map(event => event.date),
    ["2027-05-12", "2027-09-09", "2027-09-11"]);
  assert.deepEqual(getPastEvents(source, now).map(event => event.date),
    ["2026-09-12", "2026-05-13", "2026-05-06"]);
  assert.deepEqual(source.events.map(event => event.id), originalOrder);
});
