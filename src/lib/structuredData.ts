import type { EventItem } from "./events";
import { getEventImage } from "./eventImages";
import { SITE_ORIGIN } from "./canonicalRoutes.mjs";
export { SITE_ORIGIN } from "./canonicalRoutes.mjs";

export function organisationData() {
  return {
    "@type": "Organization",
    "@id": `${SITE_ORIGIN}/#organisation`,
    name: "The Media Collective",
    url: `${SITE_ORIGIN}/`,
    sameAs: ["https://www.linkedin.com/company/the-media-collective-events/"],
  };
}

function confirmedDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) return undefined;
  const date = Date.parse(value);
  if (!Number.isFinite(date) || new Date(Date.parse(value.slice(0, 10))).toISOString().slice(0, 10) !== value.slice(0, 10)) return undefined;
  return value;
}

export function eventData(event: EventItem): Record<string, unknown> {
  const image = getEventImage(event);
  // The confirmed partner organiser is currently recorded in the access copy.
  // Never substitute Media Collective for an unnamed independent organiser.
  const partnerOrganiser = event.attendanceStatement?.match(/Organiser:\s*([^\.\n]+)/i)?.[1].trim();
  const place = event.departure || [event.venue, event.location].filter(Boolean).join(" · ");
  return {
    "@type": "Event",
    "@id": `${SITE_ORIGIN}/events/${event.id}#event`,
    url: `${SITE_ORIGIN}/events/${event.id}`,
    name: event.title,
    description: event.seoDescription || event.summary || event.description || undefined,
    startDate: confirmedDate(event.startsAt) || confirmedDate(event.date),
    endDate: confirmedDate(event.endsAt),
    image: image ? new URL(image, SITE_ORIGIN).href : undefined,
    location: place ? { "@type": "Place", name: place } : undefined,
    organizer: event.partnerEvent
      ? partnerOrganiser ? { "@type": "Organization", name: partnerOrganiser } : undefined
      : { "@id": `${SITE_ORIGIN}/#organisation` },
    maximumAttendeeCapacity: event.capacity ?? event.capacity_number,
  };
}

// Keep CMS-authored text from terminating a JSON-LD script element.
export function serializeStructuredData(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
