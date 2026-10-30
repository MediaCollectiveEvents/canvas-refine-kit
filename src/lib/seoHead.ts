import { organisationData, serializeStructuredData, SITE_ORIGIN } from "./structuredData";

// Explicit branded fallback, independent of page/hero content. This is the
// supplied 1200×630 social card is preserved unchanged.
export const DEFAULT_SOCIAL_IMAGE = `${SITE_ORIGIN}/uploads/media-collective-social-default.png`;

export function resolveSocialImage(image?: string): string {
  try {
    const url = new URL(image?.trim() || DEFAULT_SOCIAL_IMAGE, SITE_ORIGIN);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password
      ? url.href : DEFAULT_SOCIAL_IMAGE;
  } catch {
    return DEFAULT_SOCIAL_IMAGE;
  }
}

export interface SeoProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  url?: string;
  type?: "website" | "article";
  noindex?: boolean;
  structuredData?: Record<string, unknown>;
}

export function createSeoHead(props: SeoProps, pathname: string) {
  const { title, description, keywords, noindex = false, type = "website" } = props;
  const canonical = new URL(props.url ?? pathname, SITE_ORIGIN).href;
  const socialImage = resolveSocialImage(props.ogImage);
  const meta: { name?: string; property?: string; content: string }[] = [];
  if (description) meta.push({ name: "description", content: description });
  if (keywords) meta.push({ name: "keywords", content: keywords });
  if (noindex) meta.push({ name: "robots", content: "noindex, follow" });
  if (title) meta.push({ property: "og:title", content: title });
  if (description) meta.push({ property: "og:description", content: description });
  if (socialImage) meta.push({ property: "og:image", content: socialImage });
  meta.push({ property: "og:type", content: type });
  if (!noindex) meta.push({ property: "og:url", content: canonical });
  meta.push({ name: "twitter:card", content: "summary_large_image" });
  if (title) meta.push({ name: "twitter:title", content: title });
  if (description) meta.push({ name: "twitter:description", content: description });
  if (socialImage) meta.push({ name: "twitter:image", content: socialImage });
  return {
    title, meta, canonical: noindex ? undefined : canonical,
    jsonLd: noindex ? undefined : serializeStructuredData({
      "@context": "https://schema.org",
      "@graph": [organisationData(), ...(props.structuredData ? [props.structuredData] : [])],
    }),
  };
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// Helmet uses data-rh ownership to replace these tags on client navigation.
// Only the head is serialized; no React components or page body are prerendered.
export function renderSeoHead(head: ReturnType<typeof createSeoHead>) {
  return [
    ...(head.title ? [`<title data-rh="true">${escapeHtml(head.title)}</title>`] : []),
    ...head.meta.map(meta => `<meta data-rh="true" ${meta.name ? `name="${escapeHtml(meta.name)}"` : `property="${escapeHtml(meta.property!)}"`} content="${escapeHtml(meta.content)}"/>`),
    ...(head.canonical ? [`<link data-rh="true" rel="canonical" href="${escapeHtml(head.canonical)}"/>`] : []),
    ...(head.jsonLd ? [`<script data-rh="true" type="application/ld+json">${head.jsonLd}</script>`] : []),
  ].join("\n");
}
