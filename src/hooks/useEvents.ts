// src/hooks/useEvents.ts
// Loads events from BOTH Markdown (*.md with YAML front‑matter) and JSON (*.json)
// and provides helpers to list all events and fetch a single event by slug.

import matter from "gray-matter";
import { marked } from "marked";

export type EventItem = {
  id: string; // derived from filename (slug)
  title?: string;
  date?: string; // ISO date string
  location?: string;
  venue?: string;
  coverImage?: string;
  imageKey?: string; // optional alternative image key
  excerpt?: string;
  contentHtml?: string; // rendered Markdown body (if .md source)
  [key: string]: any;
};

// IMPORTANT: use relative path from src/hooks → ../content/events
const jsonModules = import.meta.glob("../content/events/*.json", {
  eager: true,
});
const mdModules = import.meta.glob("../content/events/*.md", {
  eager: true,
  as: "raw",
});

function fileSlug(path: string) {
  const filename = path.split("/").pop()!;
  return filename.replace(/\.(json|md)$/, "");
}

export function getAllEvents(): EventItem[] {
  const events: EventItem[] = [];

  // JSON files
  for (const [path, mod] of Object.entries(jsonModules)) {
    const id = fileSlug(path);
    // @ts-ignore - Vite eager JSON may be under .default
    const data = (mod as any).default ?? mod;
    events.push({ id, ...data });
  }

  // Markdown files
  for (const [path, raw] of Object.entries(mdModules)) {
    const id = fileSlug(path);
    const file = raw as unknown as string;
    const parsed = matter(file);
    const front = parsed.data as Record<string, any>;
    const body = parsed.content ?? "";
    const contentHtml = body ? (marked.parse(body) as string) : undefined;
    events.push({ id, ...front, contentHtml });
  }

  // newest first when dates exist (ISO string compare is fine)
  events.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  return events;
}

export function getEventById(eventId: string): EventItem | undefined {
  // Try JSON
  const jsonKey = Object.keys(jsonModules).find((k) =>
    k.endsWith(`${eventId}.json`),
  );
  if (jsonKey) {
    const mod = (jsonModules as any)[jsonKey];
    const data = (mod?.default ?? mod) as Record<string, any>;
    return { id: eventId, ...data } as EventItem;
  }

  // Try Markdown
  const mdKey = Object.keys(mdModules).find((k) => k.endsWith(`${eventId}.md`));
  if (mdKey) {
    const raw = (mdModules as any)[mdKey] as string;
    const parsed = matter(raw);
    const front = parsed.data as Record<string, any>;
    const body = parsed.content ?? "";
    const contentHtml = body ? (marked.parse(body) as string) : undefined;
    return { id: eventId, ...front, contentHtml } as EventItem;
  }

  return undefined;
}
