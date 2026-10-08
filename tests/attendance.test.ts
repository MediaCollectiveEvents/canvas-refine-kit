import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import vm from "node:vm";
import { getAttendanceOptions, getAttendanceSelection, getAttendanceStages } from "../src/lib/attendance";
import { getEventById } from "../src/lib/events";
import { filterPlannerEntriesByTime, type PlannerEntry } from "../src/lib/industryEvents";

const now = new Date("2026-10-07T12:00:00Z");

test("attendance choices use canonical upcoming events in chronological order", () => {
  const options = getAttendanceOptions(undefined, now);
  assert.deepEqual(options.map(option => option.id), ["4", "5", "8", "6", "7", "all-events"]);
  assert.match(options.find(option => option.id === "6")!.label, /IBC Networking Breakfast 2027 \(11 September 2027\)/);
  assert.ok(options.every(option => !/2026-05|2026-09/.test(option.label)));
  assert.deepEqual(getAttendanceOptions(undefined, new Date("2028-01-01")), [{ id: "all-events", label: "All future Media Collective events", displayLabel: "Future gatherings — no particular event" }]);
});

test("specific attendance requests retain the event and skip selection and engagement", () => {
  assert.equal(getAttendanceSelection(getEventById(6), now), "6");
  assert.equal(getAttendanceSelection(getEventById(3), now), undefined);
  assert.equal(getAttendanceSelection(undefined, now), undefined);
  assert.deepEqual(getAttendanceStages(true), [1, 4]);
  assert.deepEqual(getAttendanceStages(false), [1, 2, 4]);
});

test("the existing handler accepts the canonical event label and Attend without new fields", () => {
  const rows: unknown[][] = [];
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(new URL("../docs/apps-script/EventRegistrations.gs", import.meta.url), "utf8"), context);
  const event = getAttendanceOptions(undefined, now).find(option => option.id === "6")!;
  context.appendEnquiry({ appendRow: (row: unknown[]) => rows.push(row) }, { fullName: "Guest", companyName: "Studio", emailAddress: "guest@example.com", event: event.label, howEngage: "Attend", consent: "Y" });
  assert.equal(rows[0][3], "IBC Networking Breakfast 2027 (11 September 2027)");
  assert.equal(rows[0][4], "Attend");
  assert.equal(rows[0].length, 7);
});

test("calendar upcoming view retains ongoing industry shows and undated entries", () => {
  const entries: PlannerEntry[] = [
    { kind: "media-collective", event: getEventById(3)! },
    { kind: "media-collective", event: getEventById(4)! },
    { kind: "external", event: { id: "show", name: "Show", organiser: "Organiser", startDate: "2026-10-06", endDate: "2026-10-08", sourceUrl: "https://example.com", status: "confirmed", category: "trade-show" } },
    { kind: "external", event: { id: "undated", name: "Undated show", organiser: "Organiser", sourceUrl: "https://example.com", status: "tbc", category: "trade-show" } },
  ];
  assert.deepEqual(filterPlannerEntriesByTime(entries, true, now).map(entry => entry.event.id), [4, "show", "undated"]);
  assert.deepEqual(filterPlannerEntriesByTime(entries, false, now), entries);
  assert.deepEqual(filterPlannerEntriesByTime(entries, true, new Date("2026-10-09")).map(entry => entry.event.id), [4, "undated"]);
});
