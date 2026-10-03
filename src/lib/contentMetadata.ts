import type { TaxonomyMetadata } from "./taxonomy";

// Optional editorial metadata; existing records and rendering remain valid.
export interface SponsorProfileMetadata {
  id?: string;
  description?: string;
  website?: string;
  partnershipTypes?: string[];
  relatedEventIds?: number[];
  contribution?: string;
}

export interface SponsorLogo extends SponsorProfileMetadata {
  src: string;
  name?: string;
  alt?: string;
}

export interface Contributor extends TaxonomyMetadata {
  id: string;
  displayName: string;
  role?: string;
  organisation?: string;
  biography?: string;
  image?: string;
}

export interface ArticleMetadata extends TaxonomyMetadata {
  writerId?: string;
  author?: string;
  organisation?: string;
  relatedEventIds?: number[];
  relatedPartnerIds?: string[];
}

export interface Article extends ArticleMetadata {
  title: string;
  slug: string;
  date: string;
  category: string;
  excerpt: string;
  image?: string;
  imageKey?: string;
  body?: string;
}

export function articleParagraphs(body?: string): string[] {
  return (body ?? "").split(/\r?\n\s*\r?\n/).map(paragraph => paragraph.trim()).filter(Boolean);
}
