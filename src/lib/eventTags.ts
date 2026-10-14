import { normalizeEventFormatTags, normalizeEventConferenceTags, type EventItem } from "./events";

/** Separate editable concepts; never infer alignment or themes from titles. */
export function getEventTags(event: EventItem): string[] {
  return [...normalizeEventFormatTags(event.formatTags), ...normalizeEventConferenceTags(event.conferenceAlignment)];
}
