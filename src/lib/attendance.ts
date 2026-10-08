import { formatEventDate, getUpcomingEvents, isPastEvent, type EventItem } from "./events";

// The existing enquiry endpoint stores an event label, not a registration ID.
// Canonical IDs are local selection values; historical registration mappings stay intact.
export function getAttendanceOptions(source?: unknown, now = new Date()) {
  return [
    ...getUpcomingEvents(undefined, source, now).map(event => ({
      id: String(event.id),
      label: `${event.title} (${formatEventDate(event.date)})`,
      displayLabel: `${event.title} — ${formatEventDate(event.date)}`,
    })),
    { id: "all-events", label: "All future Media Collective events", displayLabel: "Future gatherings — no particular event" },
  ];
}

export function getAttendanceSelection(event?: EventItem, now = new Date()) {
  return event && !isPastEvent(event, now) ? String(event.id) : undefined;
}

export function getAttendanceStages(hasSelectedEvent: boolean) {
  return hasSelectedEvent ? [1, 4] : [1, 2, 4];
}
