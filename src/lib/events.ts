import aggregateContent from "@/content/events.json";

export interface EventIdentity {
  readonly routeAliases: readonly string[];
  readonly registrationId: string;
}

// Only the existing caller/form mappings are confirmed. Named routes remain unassigned.
export const EVENT_IDENTITIES: Readonly<Partial<Record<number, EventIdentity>>> = Object.freeze({
  1: { routeAliases: [], registrationId: "nab-review" },
  2: { routeAliases: [], registrationId: "mpts-drinks" },
  3: { routeAliases: [], registrationId: "networking-breakfast" },
});

export interface EventItem {
  id: number;
  title: string;
  date: string;
  location: string;
  venue: string;
  type: string;
  imageKey?: string;
  time?: string;
  summary?: string;
  description?: string;
  details?: string;
  format?: string;
  conferenceAligned?: boolean;
  inviteOnly?: boolean;
  complimentary?: boolean;
}

interface EventHero {
  title: string;
  eyebrow?: string;
  description?: string;
  image?: string;
  cta?: { label: string; url: string };
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function rows(source: unknown): unknown[] {
  const events = Array.isArray(source) ? source : record(source).events;
  return Array.isArray(events) ? events : [];
}

function validId(id: unknown): id is number {
  return typeof id === "number" && Number.isSafeInteger(id) && id > 0;
}

export function getEventIssues(source: unknown = aggregateContent): string[] {
  const counts = new Map<number, number>();
  const issues: string[] = [];
  rows(source).forEach((value, index) => {
    const { id } = record(value);
    if (!validId(id)) issues.push(`Event ${index + 1} needs a unique positive integer ID.`);
    else counts.set(id, (counts.get(id) ?? 0) + 1);
  });
  counts.forEach((count, id) => {
    if (count > 1) issues.push(`Event ID ${id} is duplicated; its records cannot be resolved safely.`);
  });
  return issues;
}

export function normalizeEvents(source: unknown = aggregateContent): EventItem[] {
  const records = rows(source).map(record);
  const counts = new Map<number, number>();
  records.forEach(({ id }) => {
    if (validId(id)) counts.set(id, (counts.get(id) ?? 0) + 1);
  });
  return records.filter(row => validId(row.id) && counts.get(row.id) === 1).map(row => ({
    id: row.id as number,
    title: text(row.title), date: text(row.date), location: text(row.location),
    venue: text(row.venue), type: text(row.type), imageKey: text(row.imageKey),
    time: text(row.time), summary: text(row.summary), description: text(row.description),
    details: text(row.details), format: text(row.format),
    conferenceAligned: row.conferenceAligned === true,
    inviteOnly: row.inviteOnly === true, complimentary: row.complimentary === true,
  }));
}

export function getEventContent(source: unknown = aggregateContent) {
  const root = record(source);
  const hero = record(root.hero);
  const cta = record(hero.cta);
  const intro = record(root.intro);
  return {
    hero: {
      title: text(hero.title), eyebrow: text(hero.eyebrow), description: text(hero.description),
      image: text(hero.image),
      cta: { label: text(cta.label), url: text(cta.url) },
    } satisfies EventHero,
    intro: { title: text(intro.title), body: text(intro.body) },
    events: normalizeEvents(source),
  };
}

export function isPastEvent(event: EventItem, now = new Date()): boolean {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
  return event.type === "past" ||
    (!!event.date && /^\d{4}-\d{2}-\d{2}/.test(event.date) && event.date.slice(0, 10) < today);
}

export function sortEvents(events: EventItem[], order: "asc" | "desc" = "asc"): EventItem[] {
  return [...events].sort((a, b) => {
    const aDate = Date.parse(a.date);
    const bDate = Date.parse(b.date);
    if (!Number.isFinite(aDate)) return Number.isFinite(bDate) ? 1 : a.id - b.id;
    if (!Number.isFinite(bDate)) return -1;
    return (order === "asc" ? aDate - bDate : bDate - aDate) || a.id - b.id;
  });
}

export function getAllEvents(source: unknown = aggregateContent): EventItem[] {
  return sortEvents(normalizeEvents(source));
}

export function getUpcomingEvents(limit?: number, source: unknown = aggregateContent, now = new Date()): EventItem[] {
  const events = getAllEvents(source).filter(event => !isPastEvent(event, now));
  return typeof limit === "number" ? events.slice(0, limit) : events;
}

export function getPastEvents(source: unknown = aggregateContent, now = new Date()): EventItem[] {
  return sortEvents(normalizeEvents(source).filter(event => isPastEvent(event, now)), "desc");
}

export function getEventById(identifier: string | number | undefined, source: unknown = aggregateContent): EventItem | undefined {
  if (identifier === undefined) return undefined;
  const events = normalizeEvents(source);
  return events.find(event => String(event.id) === String(identifier)) ??
    events.find(event => EVENT_IDENTITIES[event.id]?.routeAliases.includes(String(identifier)));
}

export function getRegistrationId(id: number, source: unknown = aggregateContent): string | undefined {
  return getEventById(id, source) ? EVENT_IDENTITIES[id]?.registrationId : undefined;
}

export function formatEventDate(date: string): string {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}

// Existing behaviour allows past events. Only explicitly mapped events are selectable.
export function getRegistrationOptions(source: unknown = aggregateContent): { id: string; label: string }[] {
  const options = getAllEvents(source).flatMap(event => {
    const id = getRegistrationId(event.id, source);
    if (!id) return [];
    return [{ id, label: `${event.title}${event.location ? ` - ${event.location}` : ""}${event.date ? ` (${formatEventDate(event.date)})` : ""}` }];
  });
  return [...options, { id: "all-events", label: "All Events" }];
}
