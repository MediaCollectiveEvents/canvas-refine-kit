import assert from "node:assert/strict";
import test from "node:test";
import {
  getAllEvents, getEventById, getEventIssues, getPastEvents, getRegistrationId,
  getRegistrationOptions, getUpcomingEvents, normalizeEvents,
} from "../src/lib/events";

const now = new Date("2026-10-02T12:00:00Z");

test("aggregate IDs survive reordering and resolve numeric detail routes", () => {
  const events = getAllEvents();
  const reordered = { events: [...events].reverse() };
  for (const id of [1, 2, 3]) {
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
  const source = { events: [...getAllEvents(), { id: 4, title: "IBC BREAKFAST", date: "2027-01-01" }] };
  assert.equal(getEventById("4", source)?.id, 4);
  assert.equal(getRegistrationId(4, source), undefined);
  assert.equal(getRegistrationOptions(source).length, 4);
});

test("registration preserves confirmed IDs and past-event eligibility with canonical labels", () => {
  assert.equal(getRegistrationId(1), "nab-review");
  assert.equal(getRegistrationId(2), "mpts-drinks");
  assert.equal(getRegistrationId(3), "networking-breakfast");
  const options = getRegistrationOptions();
  assert.equal(options.length, 4);
  assert.match(options.find(option => option.id === "mpts-drinks")!.label, /13 May 2026/);
  assert.deepEqual(options.at(-1), { id: "all-events", label: "All Events" });
});

test("draft CMS data supplies content without mutating canonical records", () => {
  const original = getEventById(1)!.title;
  const source = { events: [{ ...getEventById(1), title: "Draft title" }] };
  assert.equal(getEventById(1, source)?.title, "Draft title");
  assert.equal(getEventById(1)?.title, original);
});
