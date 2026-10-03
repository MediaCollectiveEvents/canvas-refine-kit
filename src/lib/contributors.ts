import directory from "@/content/contributors.json";
import type { ArticleMetadata, Contributor } from "./contentMetadata";

const validId = (value: unknown): value is string => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

function safeImage(value: string): boolean {
  // CMS images normally use /uploads. Reject protocols and protocol-relative URLs.
  return /^\/(?!\/)[^\s\\]+$/.test(value);
}

export function getContributors(source: unknown = directory): Contributor[] {
  const rows = source && typeof source === "object" && "contributors" in source ? source.contributors : [];
  if (!Array.isArray(rows)) return [];
  return rows.flatMap(row => {
    if (!row || typeof row !== "object" || !validId(row.id) || typeof row.displayName !== "string" || !row.displayName.trim()) return [];
    const contributor: Contributor = { id: row.id, displayName: row.displayName.trim() };
    for (const key of ["role", "organisation", "biography"] as const) {
      if (typeof row[key] === "string" && row[key].trim()) contributor[key] = row[key].trim();
    }
    if (typeof row.image === "string" && safeImage(row.image)) contributor.image = row.image;
    return [contributor];
  });
}

export function getContributorById(id: string | undefined, contributors = getContributors()): Contributor | undefined {
  if (!validId(id)) return undefined;
  const matches = contributors.filter(contributor => contributor.id === id);
  return matches.length === 1 ? matches[0] : undefined;
}

export function getArticleContributor(article: ArticleMetadata, contributors = getContributors()): Contributor | undefined {
  return getContributorById(article.writerId, contributors);
}

export function getArticleAttribution(article: ArticleMetadata, contributors = getContributors()) {
  const contributor = getArticleContributor(article, contributors);
  return contributor
    ? { author: contributor.displayName, organisation: contributor.organisation }
    : { author: article.author, organisation: article.organisation };
}
