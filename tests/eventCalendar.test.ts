import assert from "node:assert/strict";
import test from "node:test";
import { getEventById } from "../src/lib/events";
import { getCalendarUid, getEventCalendar } from "../src/lib/eventCalendar";

const generatedAt = new Date("2026-10-02T12:00:00Z");
const unfold = (ics: string) => ics.replace(/\r\n /g, "");

test("London Google URL retains BST local time through UTC instants and zone", () => {
  const event = getEventById(1)!;
  const calendar = getEventCalendar(event, generatedAt)!;
  const url = new URL(calendar.googleUrl);
  assert.equal(url.origin + url.pathname, "https://calendar.google.com/calendar/render");
  assert.equal(url.searchParams.get("action"), "TEMPLATE");
  assert.equal(url.searchParams.get("dates"), "20260506T083000Z/20260506T110000Z");
  assert.equal(url.searchParams.get("ctz"), "Europe/London");
  assert.equal(url.searchParams.get("text"), event.title);
  assert.equal(url.searchParams.get("details"), event.description);
  assert.equal(url.searchParams.get("location"), "The Broadcaster, White City, London");
});

test("Amsterdam CEST timing is correct for Google, Outlook and ICS", () => {
  const calendar = getEventCalendar(getEventById(3)!, generatedAt)!;
  assert.equal(new URL(calendar.googleUrl).searchParams.get("dates"), "20260912T060000Z/20260912T080000Z");
  assert.equal(new URL(calendar.googleUrl).searchParams.get("ctz"), "Europe/Amsterdam");
  const outlook = new URL(calendar.outlookUrl);
  assert.equal(outlook.searchParams.get("startdt"), "2026-09-12T06:00:00.000Z");
  assert.equal(outlook.searchParams.get("enddt"), "2026-09-12T08:00:00.000Z");
  assert.equal(outlook.searchParams.get("allday"), "false");
  assert.match(calendar.ics, /DTSTART:20260912T060000Z\r\nDTEND:20260912T080000Z/);
});

test("OFF AIR generates an importable ICS with stable identity and canonical content", () => {
  const event = getEventById(4)!;
  const calendar = getEventCalendar(event, generatedAt)!;
  const ics = unfold(calendar.ics);
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n"));
  assert.ok(ics.endsWith("END:VEVENT\r\nEND:VCALENDAR\r\n"));
  assert.match(ics, /UID:event-4@mediacollective.events\r\n/);
  assert.match(ics, /DTSTAMP:20261002T120000Z\r\n/);
  assert.match(ics, /DTSTART:20261124T150000Z\r\nDTEND:20261124T180000Z\r\n/);
  assert.match(ics, /SUMMARY:OFF AIR: The Unfiltered Future of Media\r\n/);
  assert.equal(calendar.filename, "media-collective-event-4.ics");
  assert.equal(getCalendarUid(4), getCalendarUid(getEventById(4)!.id));
  assert.equal(getCalendarUid(1), "event-1@mediacollective.events");
  assert.match(getEventCalendar({ ...event, title: "Edited title" })!.ics, /UID:event-4@mediacollective.events/);
});

test("ICS escapes location and text, folds UTF-8 lines without splitting characters", () => {
  const event = { ...getEventById(4)!, venue: "Room; A\\B", location: "London, UK\nFirst floor", description: "é😀".repeat(80) };
  const calendar = getEventCalendar(event, generatedAt)!;
  assert.ok(unfold(calendar.ics).includes("LOCATION:Room\\; A\\\\B\\, London\\, UK\\nFirst floor\r\n"));
  assert.equal(new URL(calendar.googleUrl).searchParams.get("location"), "Room; A\\B, London, UK\nFirst floor");
  assert.ok(unfold(calendar.ics).includes(`DESCRIPTION:${event.description}\r\n`));
  for (const line of calendar.ics.split("\r\n")) assert.ok(Buffer.byteLength(line, "utf8") <= 75);
});

test("missing, invalid, conflicting or reversed schedules suppress all actions", () => {
  const event = getEventById(4)!;
  for (const patch of [
    { startsAt: undefined }, { endsAt: undefined }, { timeZone: undefined },
    { startsAt: "2026-11-24T15:00:00" }, { endsAt: "not a date" },
    { timeZone: "Invalid/Zone" }, { startsAt: "2026-02-30T15:00:00+00:00" },
    { startsAt: "2026-11-24T15:00:00+01:00" },
    { endsAt: event.startsAt }, { endsAt: "2026-11-24T14:00:00+00:00" },
  ]) assert.equal(getEventCalendar({ ...event, ...patch }), undefined);
});

test("summary fallback and missing location use existing fields only", () => {
  const event = { ...getEventById(4)!, description: "", venue: "", location: "" };
  const calendar = getEventCalendar(event)!;
  assert.equal(new URL(calendar.googleUrl).searchParams.get("details"), event.summary);
  assert.equal(unfold(calendar.ics).includes("LOCATION:"), false);
});
