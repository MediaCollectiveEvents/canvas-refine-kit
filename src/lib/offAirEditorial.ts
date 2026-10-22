import { getUpcomingEvents, type EventItem } from "./events";

// Presentation profiles for the existing OFF AIR hosts. The event schema has no
// biography/focus fields; association names, logos and links remain CMS-managed.
export const offAirHostProfiles: Record<string, { paragraphs: string[]; focus: string }> = {
  "The Media Collective": {
    paragraphs: ["A curated network for leaders and innovators across media, entertainment and technology.", "Through events, executive gatherings and networking experiences, The Media Collective creates opportunities for fresh thinking, valuable introductions and industry collaboration."],
    focus: "Media • Technology • Networking • Executive Events • Community",
  },
  Faultline: {
    paragraphs: ["Faultline provides independent news, analysis and insight into the global video, streaming and connected TV markets.", "Helping industry leaders understand emerging technologies, market trends and competitive dynamics."],
    focus: "Streaming • Connected TV • Research • Market Intelligence • Analysis",
  },
  decodeTV: {
    paragraphs: ["decodeTV delivers expert analysis, interviews and commentary covering broadcast, streaming and media technology.", "Through reporting, podcasts and industry discussions, decodeTV provides insight into the developments shaping the modern video ecosystem."],
    focus: "Broadcast • Streaming • Commentary • Video Technology • Thought Leadership",
  },
};

export const isOffAir = (event: EventItem) => event.id === 4;

// Resolve the requested existing editions from the canonical data, never new URLs.
export function getOffAirUpcomingEvents() {
  const upcoming = getUpcomingEvents();
  return ["mpts-networking-reception-2027", "greenline", "ibc-networking-breakfast-2027"]
    .flatMap(key => upcoming.find(event => event.imageKey === key) ?? []);
}
