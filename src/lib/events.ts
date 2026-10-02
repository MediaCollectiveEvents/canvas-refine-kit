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

export type EventExperienceCategory = "networking-social" | "conference-aligned" | "knowledge-discussion";

export const EVENT_EXPERIENCE_LABELS: Readonly<Record<EventExperienceCategory, string>> = {
  "networking-social": "Networking & social",
  "conference-aligned": "Conference-aligned",
  "knowledge-discussion": "Knowledge & discussion",
};

export type EventExperienceFilter = "all" | EventExperienceCategory;

export const EVENT_EXPERIENCE_FILTERS: readonly { value: EventExperienceFilter; label: string }[] = [
  { value: "all", label: "All events" },
  ...Object.entries(EVENT_EXPERIENCE_LABELS).map(([value, label]) => ({ value: value as EventExperienceCategory, label })),
];

// Filtering retains the caller's date/status ordering and never infers categories.
export function filterEventsByExperience(events: EventItem[], category: EventExperienceFilter): EventItem[] {
  return events.filter(event => category === "all" || event.experienceCategories?.includes(category));
}

const experienceCategories = new Set<EventExperienceCategory>([
  "networking-social", "conference-aligned", "knowledge-discussion",
]);

export interface EventItem {
  id: number;
  experienceCategories?: EventExperienceCategory[];
  startsAt?: string;
  endsAt?: string;
  timeZone?: string;
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
    experienceCategories: Array.isArray(row.experienceCategories)
      ? [...new Set(row.experienceCategories.filter((value): value is EventExperienceCategory =>
        typeof value === "string" && experienceCategories.has(value as EventExperienceCategory)))]
      : undefined,
    startsAt: typeof row.startsAt === "string" ? row.startsAt : undefined,
    endsAt: typeof row.endsAt === "string" ? row.endsAt : undefined,
    timeZone: typeof row.timeZone === "string" ? row.timeZone : undefined,
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

// Discovery by approved category overlap only, never an endorsement or inferred relationship.
export function getRelatedEvents(current: EventItem, source: unknown = aggregateContent): EventItem[] {
  const categories = new Set(current.experienceCategories?.filter(category => experienceCategories.has(category)));
  const currentDate = Date.parse(current.date);
  return getAllEvents(source).filter(event => event.id !== current.id).map(event => {
    const shared = new Set(event.experienceCategories?.filter(category => categories.has(category))).size;
    const date = Date.parse(event.date);
    const distance = Number.isFinite(currentDate) && Number.isFinite(date) ? Math.abs(date - currentDate) : Infinity;
    return { event, shared, distance };
  }).filter(candidate => candidate.shared > 0).sort((a, b) =>
    b.shared - a.shared || (a.distance === b.distance ? 0 : a.distance - b.distance) || a.event.id - b.event.id
  ).slice(0, 2).map(candidate => candidate.event);
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

export interface EventPlannerMonth {
  month: number;
  events: EventItem[];
  announcedCount: number;
}

export function getEventYear(event: EventItem): number | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date)) return undefined;
  const date = new Date(`${event.date}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== event.date) return undefined;
  return Number(event.date.slice(0, 4));
}

export function getEventMonths(year: number, category: EventExperienceFilter = "all", source: unknown = aggregateContent): EventPlannerMonth[] {
  const events = getAllEvents(source).filter(event => getEventYear(event) === year);
  return Array.from({ length: 12 }, (_, index) => {
    const announced = events.filter(event => Number(event.date.slice(5, 7)) === index + 1);
    return { month: index + 1, events: filterEventsByExperience(announced, category), announcedCount: announced.length };
  });
}

export function getPlannerEmptyMessage(month: EventPlannerMonth): string | undefined {
  if (month.events.length) return undefined;
  return month.announcedCount ? "No matching events this month" : "No events announced";
}
