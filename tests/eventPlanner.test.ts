import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { matchRoutes } from "react-router-dom";
import { getAllEvents, getEventMonths, getPlannerEmptyMessage, normalizeEvents } from "../src/lib/events";
import { downloadCalendarFile, getEventCalendar, getYearCalendarSnapshot } from "../src/lib/eventCalendar";

const now = new Date("2026-10-02T12:00:00Z");

test("2026 planner retains twelve months and chronologically groups the four canonical events", () => {
  const months = getEventMonths(2026);
  assert.deepEqual(months.map(month => month.month), Array.from({ length: 12 }, (_, index) => index + 1));
  assert.deepEqual(months.filter(month => month.events.length).map(month => [month.month, month.events.map(event => event.id)]), [[5, [1, 2]], [9, [3]], [11, [4]]]);
  assert.equal(months.reduce((count, month) => count + month.events.length, 0), 4);
});

for (const [category, expected] of [
  ["all", [1, 2, 3, 4]], ["networking-social", [1, 2, 3, 4]],
  ["conference-aligned", [1, 2, 3]], ["knowledge-discussion", [1, 4]],
] as const) {
  test(`planner ${category} filtering retains months and stable event order`, () => {
    const months = getEventMonths(2026, category, { events: getAllEvents().reverse() });
    assert.equal(months.length, 12);
    assert.deepEqual(months.flatMap(month => month.events.map(event => event.id)), expected);
  });
}

test("empty months distinguish unannounced months from filtered-out events", () => {
  const months = getEventMonths(2026, "conference-aligned");
  assert.equal(getPlannerEmptyMessage(months[0]), "No events announced");
  assert.equal(getPlannerEmptyMessage(months[10]), "No matching events this month");
  assert.equal(getPlannerEmptyMessage(months[4]), undefined);
});

test("grouping never infers a year from invalid dates or admits other years", () => {
  const source = { events: [
    { id: 10, date: "2026-02-30" }, { id: 11, date: "2027-01-01" },
    { id: 12, date: "2026-12-31" }, { id: 13, date: "2026-13-01" },
  ] };
  assert.deepEqual(getEventMonths(2026, "all", source).flatMap(month => month.events.map(event => event.id)), [12]);
});

test("whole-year snapshot contains a single calendar and all four ordered events", () => {
  const events = getAllEvents().filter(event => event.date.startsWith("2026-"));
  const snapshot = getYearCalendarSnapshot([...events].reverse(), 2026, now);
  assert.equal(snapshot.includedCount, 4);
  assert.equal(snapshot.omittedCount, 0);
  assert.equal(snapshot.filename, "media-collective-2026-events.ics");
  assert.equal(snapshot.ics.match(/BEGIN:VCALENDAR/g)?.length, 1);
  assert.equal(snapshot.ics.match(/END:VCALENDAR/g)?.length, 1);
  assert.equal(snapshot.ics.match(/BEGIN:VEVENT/g)?.length, 4);
  assert.deepEqual([...snapshot.ics.matchAll(/UID:event-(\d+)@mediacollective.events/g)].map(match => Number(match[1])), [1, 2, 3, 4]);
  for (const event of events) {
    const individual = getEventCalendar(event, now)!.ics.match(/BEGIN:VEVENT\r\n[\s\S]*?END:VEVENT/)![0];
    assert.ok(snapshot.ics.includes(individual), `Event ${event.id} keeps individual calendar semantics`);
  }
  assert.equal(getEventMonths(2026, "knowledge-discussion").flatMap(month => month.events).length, 2);
  assert.equal(snapshot.includedCount, 4);
});

test("invalid calendar schedules are omitted and counted within the selected year only", () => {
  const events = normalizeEvents({ events: [
    ...getAllEvents(), { id: 90, date: "2026-12-01", title: "No schedule" },
    { id: 91, date: "2027-01-01", title: "Other year" },
  ] });
  const snapshot = getYearCalendarSnapshot(events, 2026, now);
  assert.equal(snapshot.includedCount, 4);
  assert.equal(snapshot.omittedCount, 1);
  assert.equal(snapshot.ics.includes("UID:event-90@"), false);
  assert.equal(snapshot.ics.includes("UID:event-91@"), false);
  assert.equal(getYearCalendarSnapshot([], 2026, now).includedCount, 0);
});

test("App declares the planner before numeric event details and both routes coexist", () => {
  const app = readFileSync("src/App.tsx", "utf8");
  const paths = [...app.matchAll(/<Route path="([^"]+)"/g)].map(match => match[1]);
  assert.ok(paths.indexOf("/events/calendar") > -1);
  assert.ok(paths.indexOf("/events/calendar") < paths.indexOf("/events/:id"));
  const routes = paths.map(path => ({ path }));
  assert.equal(matchRoutes(routes, "/events/calendar")?.at(-1)?.route.path, "/events/calendar");
  for (const id of [1, 2, 3, 4]) {
    const match = matchRoutes(routes, `/events/${id}`)?.at(-1);
    assert.equal(match?.route.path, "/events/:id");
    assert.equal(match?.params.id, String(id));
  }
});


test("snapshot download creates the calendar Blob, clicks its filename and releases the URL", async context => {
  const snapshot = getYearCalendarSnapshot(getAllEvents(), 2026, now);
  const blobs: Blob[] = [];
  const links: { href: string; download: string; clicked: boolean; removed: boolean }[] = [];
  let cleanup: (() => void) | undefined;
  let revoked = "";
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  context.mock.method(URL, "createObjectURL", (blob: Blob) => { blobs.push(blob); return "blob:calendar-test"; });
  context.mock.method(URL, "revokeObjectURL", (url: string) => { revoked = url; });
  context.mock.method(globalThis, "setTimeout", (callback: () => void) => { cleanup = callback; return 1; });
  Object.defineProperty(globalThis, "document", { configurable: true, value: {
    createElement: () => {
      const link = { href: "", download: "", clicked: false, removed: false,
        click() { this.clicked = true; }, remove() { this.removed = true; } };
      links.push(link);
      return link;
    },
    body: { appendChild: () => {} },
  } });
  try {
    downloadCalendarFile(snapshot.ics, snapshot.filename);
    assert.equal(blobs[0].type, "text/calendar;charset=utf-8");
    assert.equal(await blobs[0].text(), snapshot.ics);
    assert.equal(links[0].download, "media-collective-2026-events.ics");
    assert.equal(links[0].href, "blob:calendar-test");
    assert.equal(links[0].clicked, true);
    assert.equal(links[0].removed, true);
    cleanup!();
    assert.equal(revoked, "blob:calendar-test");
  } finally {
    if (previousDocument) Object.defineProperty(globalThis, "document", previousDocument);
    else Reflect.deleteProperty(globalThis, "document");
  }
});


test("2027 planner orders announcements by date rather than source-array order", () => {
  const source = { events: getAllEvents().reverse() };
  const months = getEventMonths(2027, "all", source);
  assert.deepEqual(months.flatMap(month => month.events.map(event => [event.title, event.date])), [
    ["MPTS Reception", "2027-05-12"],
    ["IBC Breakfast", "2027-09-11"],
    ["IBC Decompression Party", "2027-09-12"],
  ]);
});
