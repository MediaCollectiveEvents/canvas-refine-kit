import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { getCanonicalRoutes } from "../src/lib/canonicalRoutes.mjs";

export function generateSitemap(source = JSON.parse(readFileSync(new URL("../src/content/events.json", import.meta.url), "utf8"))) {
  const routes = getCanonicalRoutes(source);
  return '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + routes.map(route => `  <url><loc>${route.url}</loc></url>`).join("\n")
    + '\n</urlset>\n';
}

// Run after changing event records: node scripts/generate-sitemap.mjs
// The SEO test checks that the committed sitemap stays in sync.
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  writeFileSync(new URL("../public/sitemap.xml", import.meta.url), generateSitemap());
}
