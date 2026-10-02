// Compatibility exports: all event content now comes from the aggregate adapter.
export { getAllEvents, getEventById, getUpcomingEvents, getPastEvents } from "@/lib/events";
export type { EventItem } from "@/lib/events";
