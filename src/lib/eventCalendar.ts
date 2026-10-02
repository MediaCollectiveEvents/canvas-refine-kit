import type { EventItem } from "./events";

export interface EventCalendarActions {
  googleUrl: string;
  outlookUrl: string;
  ics: string;
  filename: string;
}

export function getCalendarUid(id: number): string {
  return `event-${id}@mediacollective.events`;
}

// Require an explicit offset and verify the local clock against the supplied zone.
// This also rejects rollover dates (such as 30 February) and offset/zone conflicts.
function scheduledInstant(value: string | undefined, timeZone: string): Date | undefined {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(Z|[+-]\d{2}:\d{2})$/);
  if (!match) return undefined;
  const date = new Date(value!);
  if (!Number.isFinite(date.getTime())) return undefined;
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
    }).formatToParts(date);
    const local = Object.fromEntries(parts.map(part => [part.type, part.value]));
    if ([local.year, local.month, local.day, local.hour, local.minute, local.second]
      .join("") !== match.slice(1, 7).map(value => value ?? "00").join("")) return undefined;
    return date;
  } catch {
    return undefined;
  }
}

function utcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;").replace(/,/g, "\\,");
}

// RFC 5545: fold at 75 UTF-8 octets, without splitting a Unicode character.
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  let result = "";
  let length = 0;
  for (const character of line) {
    const bytes = encoder.encode(character).length;
    if (length + bytes > 75) {
      result += "\r\n ";
      length = 1;
    }
    result += character;
    length += bytes;
  }
  return result;
}

export function getEventCalendar(event: EventItem, generatedAt = new Date()): EventCalendarActions | undefined {
  if (!event.timeZone || !Number.isSafeInteger(event.id) || event.id < 1) return undefined;
  const start = scheduledInstant(event.startsAt, event.timeZone);
  const end = scheduledInstant(event.endsAt, event.timeZone);
  if (!start || !end || end <= start) return undefined;

  const location = [event.venue, event.location].filter(Boolean).join(", ");
  const description = event.description || event.summary || "";
  const google = new URL("https://calendar.google.com/calendar/render");
  google.search = new URLSearchParams({
    action: "TEMPLATE", text: event.title,
    dates: `${utcStamp(start)}/${utcStamp(end)}`, ctz: event.timeZone,
    details: description, location,
  }).toString();
  const outlook = new URL("https://outlook.live.com/calendar/0/deeplink/compose");
  outlook.search = new URLSearchParams({
    path: "/calendar/action/compose", rru: "addevent", subject: event.title,
    startdt: start.toISOString(), enddt: end.toISOString(), allday: "false",
    body: description, location,
  }).toString();
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//The Media Collective//Events//EN",
    "CALSCALE:GREGORIAN", "BEGIN:VEVENT", `UID:${getCalendarUid(event.id)}`,
    `DTSTAMP:${utcStamp(generatedAt)}`, `DTSTART:${utcStamp(start)}`, `DTEND:${utcStamp(end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    ...(description ? [`DESCRIPTION:${escapeText(description)}`] : []),
    ...(location ? [`LOCATION:${escapeText(location)}`] : []),
    "END:VEVENT", "END:VCALENDAR",
  ];
  return {
    googleUrl: google.toString(), outlookUrl: outlook.toString(),
    ics: lines.map(foldLine).join("\r\n") + "\r\n", filename: `media-collective-event-${event.id}.ics`,
  };
}
