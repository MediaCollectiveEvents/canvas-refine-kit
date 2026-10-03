import { normalizeTaxonomyMetadata } from "./taxonomy";
import blogPosts from "@/content/blogPosts.json";
import type { Article } from "@/lib/contentMetadata";
import { getEventById } from "@/lib/events";

/** Accept date-only or ISO publication timestamps; reject impossible calendar dates. */
export function articleDate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2}))?$/.exec(value);
  if (!match) return undefined;
  const clock = /T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(value);
  if (clock && (Number(clock[1]) > 23 || Number(clock[2]) > 59 || Number(clock[3] ?? 0) > 59)) return undefined;
  const day = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`);
  if (!Number.isFinite(day.getTime()) || day.getUTCFullYear() !== Number(match[1]) || day.getUTCMonth() + 1 !== Number(match[2]) || day.getUTCDate() !== Number(match[3])) return undefined;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : undefined;
}

export function formatArticleDate(value: string): string {
  const date = articleDate(value);
  return date ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date) : "Publication date unavailable";
}

export function normalizeArticles(articles: readonly Article[] = blogPosts.posts): Article[] {
  return articles.map(article => {
    const { areas, topics, ...rest } = article;
    return { ...rest, ...normalizeTaxonomyMetadata({ areas, topics }) };
  });
}

export function sortArticles(articles: readonly Article[]): Article[] {
  return normalizeArticles(articles).sort((a, b) => {
    const first = articleDate(a.date)?.getTime();
    const second = articleDate(b.date)?.getTime();
    if (first !== second) {
      if (first === undefined) return 1;
      if (second === undefined) return -1;
      return second - first;
    }
    return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
  });
}

export function getArticles(): Article[] {
  return sortArticles(blogPosts.posts);
}

export function getArticleBySlug(slug: string | undefined, articles: readonly Article[] = getArticles()): Article | undefined {
  return slug ? normalizeArticles(articles).find(article => article.slug === slug) : undefined;
}

export function getArticleEvents(article: Pick<Article, "relatedEventIds">) {
  const ids = Array.isArray(article.relatedEventIds) ? article.relatedEventIds : [];
  return [...new Set(ids)].flatMap(id => {
    if (!Number.isSafeInteger(id) || id <= 0) return [];
    const event = getEventById(id);
    return event ? [event] : [];
  });
}

export function getArticlesForEvent(eventId: number, articles: readonly Article[] = getArticles()): Article[] {
  if (!Number.isSafeInteger(eventId) || !getEventById(eventId)) return [];
  return sortArticles(articles.filter(article => getArticleEvents(article).some(event => event.id === eventId)));
}
