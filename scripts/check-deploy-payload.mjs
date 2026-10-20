import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { getCanonicalRoutes, ERROR_SHELL_FILE } from "../src/lib/canonicalRoutes.mjs";
import { generateSitemap } from "./generate-sitemap.mjs";
import { generateApacheRouting } from "./generate-apache-routing.mjs";
import { deployTarget, routingForTarget } from "./prepare-staging-payload.mjs";

export function checkDeployPayload(root = process.cwd(), payload = "dist", target = deployTarget()) {
  target = deployTarget(target);
  const read = file => readFileSync(resolve(root, file), "utf8");
  const content = JSON.parse(read("src/content/events.json"));
  const routes = getCanonicalRoutes(content);
  const manifest = JSON.parse(read(`${payload}/seo-pages/manifest.json`));
  assert.deepEqual(manifest, { routes, error: { file: ERROR_SHELL_FILE } }, "Generated route inventory is stale");
  assert.equal(read(`${payload}/.htaccess`), routingForTarget(generateApacheRouting(content), target), `Missing/stale ${target} root .htaccess`);
  assert.equal(read(`${payload}/sitemap.xml`), generateSitemap(content), "Sitemap is stale");
  assert.match(read(`${payload}/robots.txt`), /https:\/\/mediacollective\.events\/sitemap\.xml/);
  const expected = [...routes.map(route => route.file.split("/").pop()), "404.html"].sort();
  assert.deepEqual(readdirSync(resolve(root, payload, "seo-pages")).filter(file => file.endsWith(".html")).sort(), expected, "Missing or obsolete generated shells");
  for (const route of routes) {
    const html = read(`${payload}/${route.file}`);
    assert.ok(html.includes(`href="${route.url}"`), `Incorrect canonical in ${route.file}`);
    assert.doesNotMatch(html, /content="noindex/);
    assert.match(html, /<div id="root"><\/div>/);
  }
  const error = read(`${payload}/${ERROR_SHELL_FILE}`);
  assert.match(error, /noindex, follow/);
  assert.doesNotMatch(error, /rel="canonical"|property="og:url"/);
  assert.ok(read(`${payload}/admin/index.html`).length, "CMS admin missing");
  assert.ok(read(`${payload}/admin/cms.bundle.js`).length, "CMS bundle missing");
  console.log(`Deploy payload validated (${target}): ${routes.length} canonical shells, error shell, root .htaccess, sitemap and CMS.`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  checkDeployPayload();
}
