import content from "@/content/industryEvents.json";
import { filterEventsByExperience, getEventYear, type EventExperienceFilter, type EventItem } from "./events";

export interface IndustryEvent {
  id: string;
  name: string;
  organiser: string;
  startDate?: string;
  endDate?: string;
  city?: string;
  country?: string;
  sourceUrl: string;
  status: "confirmed" | "planned";
  category: "trade-show" | "industry-event";
}

export function isIndustryDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function getIndustryEventIssues(source: unknown = content): string[] {
  if (!Array.isArray(source)) return ["Industry events must be an array."];
  const issues: string[] = [];
  const ids = new Set<string>();
  source.forEach((value, index) => {
    const prefix = `Industry event ${index + 1}`;
    if (!value || typeof value !== "object" || Array.isArray(value)) { issues.push(`${prefix}: invalid record.`); return; }
    const row = value as Record<string, unknown>;
    if (typeof row.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.id)) issues.push(`${prefix}: invalid ID.`);
    else if (ids.has(row.id)) issues.push(`${prefix}: duplicate ID ${row.id}.`);
    else ids.add(row.id);
    for (const field of ["name", "organiser", "sourceUrl"]) {
      if (typeof row[field] !== "string" || !row[field].trim()) issues.push(`${prefix}: missing ${field}.`);
    }
    try {
      const url = new URL(String(row.sourceUrl));
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
    } catch { issues.push(`${prefix}: invalid source URL.`); }
    if (row.status !== "confirmed" && row.status !== "planned") issues.push(`${prefix}: invalid status.`);
    if (row.category !== "trade-show" && row.category !== "industry-event") issues.push(`${prefix}: invalid category.`);
    for (const field of ["startDate", "endDate"]) {
      if (row[field] !== undefined && !isIndustryDate(row[field])) issues.push(`${prefix}: invalid ${field}.`);
    }
    if (row.status === "confirmed" && row.startDate === undefined) issues.push(`${prefix}: confirmed event needs a start date.`);
    if (row.endDate !== undefined && row.startDate === undefined) issues.push(`${prefix}: end date needs a start date.`);
    if (isIndustryDate(row.startDate) && isIndustryDate(row.endDate) && row.endDate < row.startDate) issues.push(`${prefix}: end date precedes start date.`);
    for (const field of ["city", "country"]) {
      if (row[field] !== undefined && typeof row[field] !== "string") issues.push(`${prefix}: invalid ${field}.`);
    }
  });
  return issues;
}

export function getIndustryEvents(source: unknown = content): IndustryEvent[] {
  const issues = getIndustryEventIssues(source);
  if (issues.length) throw new Error(issues.join("\n"));
  // Whitelist the external model. Absent fields remain absent.
  return (source as IndustryEvent[]).map(row => ({
    id: row.id, name: row.name, organiser: row.organiser, sourceUrl: row.sourceUrl,
    status: row.status, category: row.category,
    ...(row.startDate !== undefined ? { startDate: row.startDate } : {}),
    ...(row.endDate !== undefined ? { endDate: row.endDate } : {}),
    ...(row.city !== undefined ? { city: row.city } : {}),
    ...(row.country !== undefined ? { country: row.country } : {}),
  })).sort((a, b) => (a.startDate ?? "9999-99-99").localeCompare(b.startDate ?? "9999-99-99") || a.id.localeCompare(b.id));
}

// Reviewed associations only; never infer context from names, dates or geography.
export const EVENT_INDUSTRY_CONTEXT: Readonly<Partial<Record<number, { industryEventId: string; label: string }>>> = Object.freeze({
  1: { industryEventId: "nab-show-2026", label: "Post-show context" },
  2: { industryEventId: "mpts-2026", label: "Around MPTS" },
  3: { industryEventId: "ibc-2026", label: "During IBC" },
  5: { industryEventId: "mpts-2027", label: "Around MPTS" },
  6: { industryEventId: "ibc-2027", label: "During IBC" },
  7: { industryEventId: "ibc-2027", label: "During IBC" },
});

export function getEventIndustryContext(eventId: number, events = getIndustryEvents()) {
  const association = EVENT_INDUSTRY_CONTEXT[eventId];
  if (!association) return undefined;
  const event = events.find(record => record.id === association.industryEventId);
  return event ? { label: association.label, event } : undefined;
}

export function getIndustryMonths(year: number, events = getIndustryEvents()) {
  return Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    events: events.filter(event => event.startDate?.slice(0, 7) === `${year}-${String(index + 1).padStart(2, "0")}`),
  }));
}

export function getUndatedIndustryEvents(events = getIndustryEvents()): IndustryEvent[] {
  return events.filter(event => event.status === "planned" && !event.startDate);
}

// Presentation union only: external events never become canonical EventItems.
export type PlannerEntry =
  | { kind: "media-collective"; event: EventItem }
  | { kind: "external"; event: IndustryEvent };

// Explicit approved geography; never derive cities from titles or venue text.
export const MEDIA_COLLECTIVE_PLANNER_CITIES: Readonly<Partial<Record<number, string>>> = Object.freeze({
  1: "London", 2: "London", 3: "Amsterdam", 4: "London", 7: "Amsterdam",
});

export type PlannerSource = "all" | "media-collective" | "external";

export const PLANNER_SOURCES: readonly { value: PlannerSource; label: string }[] = [
  { value: "all", label: "All events" },
  { value: "media-collective", label: "Media Collective" },
  { value: "external", label: "Industry calendar" },
];

export function showsPlannerExperiences(source: PlannerSource): boolean {
  return source !== "external";
}

export function filterPlannerEntriesBySource(entries: PlannerEntry[], source: PlannerSource = "all"): PlannerEntry[] {
  return entries.filter(entry => source === "all" || entry.kind === source);
}

export function getPlannerEntryCity(entry: PlannerEntry): string | undefined {
  return entry.kind === "media-collective" ? MEDIA_COLLECTIVE_PLANNER_CITIES[entry.event.id] : entry.event.city;
}

export function filterPlannerEntriesByLocation(entries: PlannerEntry[], city = "all"): PlannerEntry[] {
  return entries.filter(entry => city === "all" || getPlannerEntryCity(entry) === city);
}

export function getPlannerLocations(year: number, mediaEvents: EventItem[], externalEvents = getIndustryEvents()): string[] {
  const entries = getIndustryPlannerMonths(year, "all", mediaEvents, externalEvents).flatMap(month => month.entries);
  return [...new Set(entries.flatMap(entry => getPlannerEntryCity(entry) || []))]
    .sort((a, b) => a.localeCompare(b, "en-GB"));
}

export function getPlannerEntryLink(entry: PlannerEntry): string {
  return entry.kind === "media-collective" ? `/events/${entry.event.id}` : entry.event.sourceUrl;
}

export function getIndustryPlannerMonths(year: number, category: EventExperienceFilter, mediaEvents: EventItem[], externalEvents = getIndustryEvents(), city = "all", source: PlannerSource = "all") {
  const datedMedia = mediaEvents.filter(event => getEventYear(event) === year);
  const industryMonths = getIndustryMonths(year, externalEvents);
  return industryMonths.map(month => {
    const announced = datedMedia.filter(event => Number(event.date.slice(5, 7)) === month.month);
    const entries: PlannerEntry[] = [
      ...filterEventsByExperience(announced, category).map(event => ({ kind: "media-collective" as const, event })),
      ...month.events.map(event => ({ kind: "external" as const, event })),
    ];
    entries.sort((a, b) => {
      const dateA = a.kind === "media-collective" ? a.event.date : a.event.startDate!;
      const dateB = b.kind === "media-collective" ? b.event.date : b.event.startDate!;
      return dateA.localeCompare(dateB) || (a.kind === b.kind ? String(a.event.id).localeCompare(String(b.event.id)) : a.kind === "media-collective" ? -1 : 1);
    });
    return { month: month.month, entries: filterPlannerEntriesBySource(filterPlannerEntriesByLocation(entries, city), source), announcedCount: (source === "external" ? 0 : announced.length) + (source === "media-collective" ? 0 : month.events.length) };
  });
}

export function getIndustryPlannerYears(mediaEvents: EventItem[], externalEvents = getIndustryEvents()): number[] {
  return [...new Set([
    ...mediaEvents.flatMap(event => getEventYear(event) ?? []),
    ...externalEvents.flatMap(event => event.startDate ? Number(event.startDate.slice(0, 4)) : []),
  ])].sort((a, b) => a - b);
}
