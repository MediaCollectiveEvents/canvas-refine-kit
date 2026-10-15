import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const origin = "https://mediacollective.events";
const pages = ["/", "/events", "/community", "/partners", "/faq", "/privacy-policy"];

export function generateSitemap(source = JSON.parse(readFileSync(new URL("../src/content/events.json", import.meta.url), "utf8"))) {
  // Match the canonical resolver: positive integer IDs must be unique.
  const records = Array.isArray(source.events) ? source.events : [];
  const validId = id => Number.isSafeInteger(id) && id > 0;
  const counts = new Map();
  for (const row of records) if (validId(row?.id)) counts.set(row.id, (counts.get(row.id) || 0) + 1);
  const ids = records.filter(row => validId(row?.id) && counts.get(row.id) === 1).map(row => row.id).sort((a, b) => a - b);
  const urls = [...pages, ...ids.map(id => `/events/${id}`)];
  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.map(path => `  <url><loc>${origin}${path}</loc></url>`).join("\n")
    + '\n</urlset>\n';
}

// Run after changing event records: node scripts/generate-sitemap.mjs
// The SEO test checks that the committed sitemap stays in sync.
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  writeFileSync(new URL("../public/sitemap.xml", import.meta.url), generateSitemap());
}
