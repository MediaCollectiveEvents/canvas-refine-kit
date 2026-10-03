import { directoryRows, getStableDirectoryIssues, validateEditorialReferences } from "./editorialRelationships";
import directory from "@/content/sponsors.json";
import type { Article, SponsorLogo } from "./contentMetadata";

const validId = (id: unknown): id is string => typeof id === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);

export function getOrganisations(source: unknown = directory): SponsorLogo[] {
  const rows = source && typeof source === "object" && "logos" in source ? source.logos : [];
  if (!Array.isArray(rows)) return [];
  return rows.flatMap(row => {
    if (!row || typeof row !== "object" || typeof row.src !== "string" || !row.src) return [];
    const result: SponsorLogo = { src: row.src };
    for (const key of ["name", "alt", "description", "contribution"] as const) {
      if (typeof row[key] === "string") result[key] = row[key];
    }
    if (validId(row.id)) result.id = row.id;
    if (typeof row.website === "string") {
      try { const url = new URL(row.website); if (["https:", "http:"].includes(url.protocol)) result.website = row.website; } catch { /* Unsafe/invalid websites remain unlinked. */ }
    }
    if (Array.isArray(row.partnershipTypes)) result.partnershipTypes = row.partnershipTypes.filter((value: unknown): value is string => typeof value === "string");
    if (Array.isArray(row.relatedEventIds)) result.relatedEventIds = row.relatedEventIds.filter((value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value > 0);
    return [result];
  });
}

export function getOrganisationById(id: string, organisations = getOrganisations()): SponsorLogo | undefined {
  if (!validId(id)) return undefined;
  const matches = organisations.filter(organisation => organisation.id === id);
  return matches.length === 1 ? matches[0] : undefined;
}

export function getRelatedOrganisations(article: Article, organisations = getOrganisations()): SponsorLogo[] {
  return [...new Set(article.relatedPartnerIds ?? [])].flatMap(id => getOrganisationById(id, organisations) ?? []);
}

export function getRelatedArticles(id: string, articles: Article[], organisations = getOrganisations()): Article[] {
  return getOrganisationById(id, organisations) ? articles.filter(article => article.relatedPartnerIds?.includes(id)) : [];
}

export function getOrganisationIssues(organisations?: SponsorLogo[]): string[] {
  const source = organisations ? { logos: organisations } : directory;
  return [...getStableDirectoryIssues(source, "logos", true), ...directoryRows(source, "logos").flatMap((row, index) =>
    validateEditorialReferences("event", row.relatedEventIds).map(issue => `logos[${index}]: ${issue}`))];
}
