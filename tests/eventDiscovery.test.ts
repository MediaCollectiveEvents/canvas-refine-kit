import assert from "node:assert/strict";
import test from "node:test";
import { recommendEvents } from "../src/lib/eventDiscovery";
import { getAllEvents, getAttendanceRegistrationId } from "../src/lib/events";

const now = new Date("2026-10-04T12:00:00Z");
const future = { events: getAllEvents().map(event => ({ ...event, type: "upcoming", date: `2027-01-0${event.id}` })) };

test("no selection, unsupported formats and past show editions return no matches", () => {
  assert.deepEqual(recommendEvents([], [], undefined, now), []);
  for (const interest of ["forums", "breakfasts", "receptions", "socials", "special-interest"] as const) {
    assert.deepEqual(recommendEvents([interest], [], undefined, now), []);
  }
  for (const show of ["nab-show-2026", "mpts-2026", "ibc-2026", "other"] as const) {
    assert.deepEqual(recommendEvents(["industry-shows"], [show], undefined, now), []);
  }
});

test("current discussion match preserves the detail destination without manufacturing registration", () => {
  const results = recommendEvents(["discussions"], [], undefined, now);
  assert.deepEqual(results.map(result => result.event.id), [4]);
  assert.deepEqual(results[0].reasons, ["Knowledge & discussion"]);
  assert.equal(getAttendanceRegistrationId(results[0].event, undefined, now), undefined);
});

test("multiple interests deduplicate matches and rank overlap ahead of date", () => {
  assert.deepEqual(recommendEvents(["discussions", "industry-shows"], [], future, now).map(result => result.event.id), [1, 2, 3]);
});

test("one or multiple show choices use only the reviewed associations", () => {
  assert.deepEqual(recommendEvents(["industry-shows"], ["mpts-2026"], future, now).map(result => result.event.id), [2]);
  const results = recommendEvents(["industry-shows"], ["mpts-2026", "ibc-2026"], future, now);
  assert.deepEqual(results.map(result => result.event.id), [2, 3]);
  assert.deepEqual(results.map(result => result.reasons), [["Around MPTS"], ["During IBC"]]);
  assert.deepEqual(recommendEvents(["industry-shows"], ["other"], future, now), []);
});

test("combined choices rank an exact show context first, then independent discussion matches", () => {
  assert.deepEqual(recommendEvents(["discussions", "industry-shows"], ["mpts-2026"], future, now).map(result => result.event.id), [2, 1, 4]);
});

test("unknown metadata, dates and external calendar records cannot become recommendations", () => {
  const source = { events: [
    { id: 10, date: "2027-01-01", experienceCategories: ["invented"] },
    { id: 11, date: "invalid", experienceCategories: ["knowledge-discussion"] },
    { id: "external", startDate: "2027-01-01", name: "External industry event" },
  ] };
  assert.deepEqual(recommendEvents(["discussions", "industry-shows"], [], source, now), []);
});
