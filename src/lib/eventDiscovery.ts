import { getUpcomingEvents, type EventItem } from "./events";
import { getEventIndustryContext } from "./industryEvents";

export const DISCOVERY_INTEREST_IDS = ["networking-social", "forums", "breakfasts", "receptions", "socials", "discussions", "special-interest", "industry-shows"] as const;
export type DiscoveryInterest = typeof DISCOVERY_INTEREST_IDS[number];
export const DISCOVERY_SHOW_IDS = ["nab-show-2026", "mpts-2026", "ibc-2026", "other"] as const;
export type DiscoveryShow = typeof DISCOVERY_SHOW_IDS[number];

// Specific formats currently have no canonical mapping. Do not broaden them into
// networking/discussion matches that would imply an unsupported event format.
export function recommendEvents(interests: readonly DiscoveryInterest[], shows: readonly DiscoveryShow[], source?: unknown, now = new Date()): { event: EventItem; reasons: string[] }[] {
  if (!interests.length) return [];
  return getUpcomingEvents(undefined, source, now).filter(event => /^\d{4}-\d{2}-\d{2}$/.test(event.date) && Number.isFinite(Date.parse(event.date))).map(event => {
    const reasons: string[] = [];
    let score = 0;
    if (interests.includes("networking-social") && event.experienceCategories?.includes("networking-social")) {
      reasons.push("Networking & social");
      score += 1;
    }
    if (interests.includes("discussions") && event.experienceCategories?.includes("knowledge-discussion")) {
      reasons.push("Knowledge & discussion");
      score += 1;
    }
    if (interests.includes("industry-shows") && event.experienceCategories?.includes("conference-aligned")) {
      const context = getEventIndustryContext(event.id);
      if (shows.length ? context && shows.includes(context.event.id as DiscoveryShow) : true) {
        reasons.push(context?.label ?? "Conference-aligned");
        score += shows.length ? 2 : 1;
      }
    }
    return { event, reasons, score };
  }).filter(result => result.score > 0).sort((a, b) => b.score - a.score || a.event.date.localeCompare(b.event.date) || a.event.id - b.event.id).slice(0, 3).map(({ event, reasons }) => ({ event, reasons }));
}
