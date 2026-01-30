// src/lib/events.ts
export type EventAttributes = {
  title: string;
  slug: string;
  date: string; // ISO string from frontmatter
  location?: string;
  type?: "internal" | "third-party";
  externalUrl?: string;
  keywords?: string[];
  summary?: string;
};

type EventModule = {
  attributes: EventAttributes;
};

const eventFiles = import.meta.glob<EventModule>("@/content/events/*.md", {
  eager: true,
});

export function getAllEvents(): EventAttributes[] {
  const events = Object.values(eventFiles).map((mod) => mod.attributes);

  // sort by date ascending
  return events.sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    return da - db;
  });
}

export function getUpcomingEvents(limit?: number): EventAttributes[] {
  const now = Date.now();
  const all = getAllEvents().filter((event) => {
    const d = new Date(event.date).getTime();
    return !Number.isNaN(d) && d >= now;
  });

  if (typeof limit === "number") {
    return all.slice(0, limit);
  }

  return all;
}
