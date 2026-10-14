import { getEventCalendar } from "./eventCalendar";
import type { EventItem } from "./events";

export function getEventTimeZoneLabel(event: EventItem): string | undefined {
  if (!event.startsAt || !event.timeZone || !getEventCalendar(event)) return undefined;
  return new Intl.DateTimeFormat("en-GB", { timeZone: event.timeZone, timeZoneName: "short" })
    .formatToParts(new Date(event.startsAt)).find(part => part.type === "timeZoneName")?.value;
}
