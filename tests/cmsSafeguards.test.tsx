import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import yaml from "js-yaml";
import { AUDIENCE_SNAPSHOT_ID, getAudienceSnapshotIssues, parseAudienceSnapshot } from "../src/lib/audienceSnapshot";
import { COMMUNITY_CONTEXT_LINKS, FAQ_CONTEXT_LINKS, getContextualMatches } from "../src/lib/contextualLinks";
import { getAllEvents, getCapacityIssues, getEventCapacity, getEventEditIssues, getEventIssues } from "../src/lib/events";
import { eventData } from "../src/lib/structuredData";
import ContextualText from "../src/components/shared/ContextualText";
import FAQSection from "../src/components/sections/FAQSection";
import OurEventsSection from "../src/components/sections/OurEventsSection";
import CommunityPreview from "../src/cms/previews/CommunityPreview";
import StableEventIdControl from "../src/cms/controls/StableEventIdControl";
import { getCmsContentIssues, registerContentValidation } from "../src/cms/contentValidation";
import community from "../src/content/community.json";
import events from "../src/content/events.json";
import faqs from "../src/content/faq.json";

const snapshot = community.sections.find(section => section.id === AUDIENCE_SNAPSHOT_ID)!;

test("snapshot preserves current figures, order and labels and tolerates ordinary whitespace", () => {
  const expected = [{ value: "75", label: "C-suite guests" }, { value: "321", label: "senior leaders*" }, { value: "661", label: "guests across 6 events" }];
  assert.deepEqual(parseAudienceSnapshot(snapshot.heading), { stats: expected, issues: [] });
  assert.deepEqual(parseAudienceSnapshot(" 75  —  C-suite guests\r\n\r\n321—senior leaders*\r\n661 — guests across 6 events ").stats, expected);
  assert.deepEqual(getAudienceSnapshotIssues(community), []);
});

test("invalid snapshot formatting never produces partial figures or an undefined label", () => {
  for (const heading of [undefined, "75 — Guests", "75 - Guests\n321 — Leaders\n661 — People", "75 — \n321 — Leaders\n661 — People", "9007199254740992 — Guests\n321 — Leaders\n661 — People", "7.5 — Guests\n321 — Leaders\n661 — People", "75 — Guests\n321 — guests\n661 — People", "75 — Guests — extra\n321 — Leaders\n661 — People"]) {
    const result = parseAudienceSnapshot(heading);
    assert.ok(result.issues.length, String(heading));
    assert.deepEqual(result.stats, []);
  }
  const changedId = structuredClone(community);
  changedId.sections.find(section => section.id === AUDIENCE_SNAPSHOT_ID)!.id = "renamed-snapshot";
  assert.match(getAudienceSnapshotIssues(changedId).join(" "), /community-audience-snapshot/);
});

test("invalid snapshot drafts show a useful preview warning and last saved figures", () => {
  const draft = structuredClone(community);
  draft.sections.find(section => section.id === AUDIENCE_SNAPSHOT_ID)!.heading = "321 - senior leaders";
  const html = renderToStaticMarkup(<CommunityPreview entry={{ getIn: () => ({ toJS: () => draft }) }} />);
  assert.match(html, /role="alert"/);
  assert.match(html, /last saved figures/);
  assert.match(html, />75</);
  assert.match(html, />321</);
  assert.match(html, />661</);
  assert.doesNotMatch(html, /undefined/);
});

test("contextual links survive question rewrites, reordered FAQs, case and whitespace edits", () => {
  const edited = [
    { question: "What about tickets?", answer: "Independent tickets include the green-line. See the relevant EVENTS page." },
    { question: "What about my data?", answer: "Read our privacy-policy." },
    { question: "Could we contribute?", answer: "We can discuss a Partnership proposal." },
    { question: "May I come?", answer: "You can apply for an invitation." },
  ];
  const html = renderToStaticMarkup(<FAQSection presentation="editorial" faqs={edited.reverse()} />);
  for (const href of ["/events/8", "/events", "/privacy-policy", "/partners"]) assert.ok(html.includes(`href="${href}"`), href);
  assert.ok(html.includes(">privacy-policy</a>"));
  assert.ok(html.includes(">the green-line</a>"));
  const request = getContextualMatches("Request an invitation from the event page.", FAQ_CONTEXT_LINKS);
  assert.equal(request.filter(match => match.href === "/events").length, 1);
  assert.equal(request[0].text, "event page");
  const privacy = faqs.find(item => item.question.includes("contact information"))!;
  assert.ok(!getContextualMatches(privacy.answer, FAQ_CONTEXT_LINKS).some(match => match.href === "/partners"), "incidental references to all partners are not partnership actions");
});

test("partner community links survive ordinary wording edits without rewriting text or HTML", () => {
  const text = "Meet people from the Community.";
  const html = renderToStaticMarkup(<ContextualText text={text} links={COMMUNITY_CONTEXT_LINKS} />);
  assert.match(html, /href="\/community"/);
  assert.ok(html.includes(">the Community</a>"));
  assert.equal(html.replace(/<[^>]*>/g, ""), text);
  const unsafe = renderToStaticMarkup(<ContextualText text={'<script>alert(1)</script> Privacy Policy'} links={FAQ_CONTEXT_LINKS} />);
  assert.doesNotMatch(unsafe, /<script>/);
});

test("Green Line organiser JSON-LD survives access-copy edits without inferring sponsors", () => {
  const green = getAllEvents().find(event => event.id === 8)!;
  for (const attendanceStatement of [undefined, "Paid tickets.", "Organiser: changed free text."]) {
    assert.deepEqual(eventData({ ...green, attendanceStatement }).organizer, { "@type": "Organization", name: "Greenline" });
  }
  assert.equal(eventData({ ...green, id: 99, attendanceStatement: "Paid tickets.", partners: [{ name: "A sponsor" }] }).organizer, undefined);
  assert.deepEqual(eventData({ ...green, id: 99, attendanceStatement: "Organiser: Another confirmed organiser." }).organizer, { "@type": "Organization", name: "Another confirmed organiser" });
});

test("existing event IDs are read-only in the editor; new records can receive a numeric ID", () => {
  for (const value of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    let changed = false;
    const control = new StableEventIdControl({ value, onChange: () => { changed = true; } });
    const input = control.render().props.children[0];
    assert.equal(input.props.readOnly, true);
    input.props.onChange({ target: { value: "99" } });
    assert.equal(changed, false);
    assert.match(renderToStaticMarkup(<StableEventIdControl value={value} onChange={() => {}} />), /readonly=""/);
  }
  let assigned: unknown;
  const control = new StableEventIdControl({ onChange: value => { assigned = value; } });
  const input = control.render().props.children[0];
  assert.equal(input.props.readOnly, false);
  input.props.onChange({ target: { value: "9" } });
  assert.equal(assigned, 9);
});

test("event save validation blocks renumbering, removal and duplicates while allowing ordering and new IDs", () => {
  assert.deepEqual(getEventEditIssues(events), []);
  const renumbered = structuredClone(events);
  renumbered.events[0].id = 9;
  assert.match(getEventEditIssues(renumbered).join(" "), /Keep event ID 1/);
  const duplicate = structuredClone(events);
  duplicate.events[1].id = 1;
  assert.match(getEventEditIssues(duplicate).join(" "), /duplicated/);
  assert.match(getEventEditIssues({ events: events.events.slice(1) }).join(" "), /Keep event ID 1/);
  assert.deepEqual(getEventEditIssues({ events: [...events.events].reverse() }), []);
  const expanded = { events: [...events.events, { ...events.events[0], id: 9 }] };
  assert.deepEqual(getEventEditIssues(expanded), []);
  assert.match(getEventEditIssues(events, expanded).join(" "), /Keep event ID 9/);
});

test("capacity uses explicit capacity first, legacy fallback second, and diagnoses conflicts", () => {
  assert.equal(getEventCapacity({ capacity: 150, capacity_number: 100 }), 150);
  assert.equal(getEventCapacity({ capacity_number: 100 }), 100);
  assert.equal(getEventCapacity({ capacity: null, capacity_number: 100 }), 100);
  assert.equal(getEventCapacity({ capacity: -1 }), undefined);
  assert.deepEqual(getCapacityIssues({ capacity: 100, capacity_number: 100 }), []);
  assert.match(getCapacityIssues({ capacity: 150, capacity_number: 100 }).join(" "), /Conflicting capacity/);
  assert.match(getCapacityIssues({ capacity: "100" }).join(" "), /whole number/);
  assert.deepEqual(getEventIssues(events), []);
  assert.deepEqual(getAllEvents().filter(event => getEventCapacity(event) !== undefined).map(event => [event.id, getEventCapacity(event)]).sort((a, b) => a[0] - b[0]), [[4, 120], [5, 120], [6, 120], [7, 200], [8, 80]]);
  const event = { ...getAllEvents().find(item => item.id === 4)!, capacity: 150, capacity_number: 100 };
  const html = renderToStaticMarkup(<OurEventsSection section={{ items: [{ eventId: 4 }] }} content={{ events: [event] }} />);
  assert.match(html, />150</);
  assert.equal(eventData(event).maximumAttendeeCapacity, 150);
  assert.match(getEventIssues({ events: [event] }).join(" "), /Conflicting capacity/);
});

test("Decap's real preSave event blocks invalid content before persistence and leaves valid data unchanged", async () => {
  const vendor = readFileSync("public/admin/vendor/decap-cms.js", "utf8");
  const require = new Function(vendor.slice(vendor.indexOf("var __webpack_modules__="), vendor.lastIndexOf("var __webpack_exports__={};return")) + "return __webpack_require__;")();
  const cms = require(41891).default;
  const { fromJS } = require(46670);
  registerContentValidation(cms);
  const good = fromJS({ path: "src/content/events.json", data: events });
  const result = await cms.invokeEvent({ name: "preSave", data: { entry: good } });
  assert.equal(result, good.get("data"));
  const bad = structuredClone(events);
  bad.events[0].id = 999;
  let persisted = false;
  await assert.rejects(async () => {
    await cms.invokeEvent({ name: "preSave", data: { entry: fromJS({ path: "src/content/events.json", data: bad }) } });
    persisted = true;
  }, /Nothing was saved.*Keep event ID 1/);
  assert.equal(persisted, false);
  const invalidSnapshot = structuredClone(community);
  invalidSnapshot.sections.find(section => section.id === AUDIENCE_SNAPSHOT_ID)!.heading = "malformed";
  await assert.rejects(cms.invokeEvent({ name: "preSave", data: { entry: fromJS({ path: "src/content/community.json", data: invalidSnapshot }) } }), /Nothing was saved.*Audience snapshot/);
  const conflict = structuredClone(events) as any;
  conflict.events[3].capacity = 500;
  await assert.rejects(cms.invokeEvent({ name: "preSave", data: { entry: fromJS({ path: "src/content/events.json", data: conflict }) } }), /Conflicting capacity/);
  assert.deepEqual(getCmsContentIssues("src/content/faq.json", faqs), []);
});

test("CMS safeguards change editor widgets only, keeping content keys and section ID", () => {
  const config = yaml.load(readFileSync("public/admin/config.yml", "utf8")) as any;
  const eventFields = config.collections.find((c: any) => c.name === "events").files[0].fields.find((f: any) => f.name === "events").fields;
  assert.equal(eventFields.find((f: any) => f.name === "id").widget, "stable-event-id");
  const sections = config.collections.find((c: any) => c.name === "communityPage").files[0].fields.find((f: any) => f.name === "sections");
  assert.equal(sections.fields.find((f: any) => f.name === "heading").widget, "text");
  assert.equal(snapshot.id, "community-audience-snapshot");
  assert.deepEqual(Object.keys(snapshot), ["id", "type", "eyebrow", "heading", "body"]);
  assert.ok(Array.isArray(faqs));
});
