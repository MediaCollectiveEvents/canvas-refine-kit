import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import Seo from "../src/components/shared/Seo";
import { createSeoHead, renderSeoHead, type SeoProps } from "../src/lib/seoHead";
import { getPageSeo, homeSeo, communitySeo, errorSeo } from "../src/lib/pageSeo";
import { getCanonicalRoutes, ERROR_SHELL_FILE } from "../src/lib/canonicalRoutes.mjs";
import { getAllEvents } from "../src/lib/events";
import { injectHead } from "../scripts/generate-static-heads.mjs";
import homepage from "../src/content/homepage.json";
import community from "../src/content/community.json";
import events from "../src/content/events.json";

function decode(value: string) {
  return value.replace(/&quot;/g, '"').replace(/&#(?:x27|39);|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function parseHead(html: string) {
  const attributes = (tag: string) => Object.fromEntries([...tag.matchAll(/\b(name|property|content|rel|href)="([^"]*)"/g)].map(match => [match[1], decode(match[2])]));
  return {
    title: decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? ""),
    meta: [...html.matchAll(/<meta\b[^>]*>/g)].map(match => attributes(match[0])).sort((a, b) => (a.name || a.property).localeCompare(b.name || b.property)),
    canonical: [...html.matchAll(/<link\b[^>]*>/g)].map(match => attributes(match[0])).filter(link => link.rel === "canonical"),
    jsonLd: [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1])),
  };
}

function clientHead(props: SeoProps, path: string) {
  const context: any = {};
  renderToStaticMarkup(createElement(HelmetProvider, { context }, createElement(MemoryRouter, { initialEntries: [path] }, createElement(Seo, props))));
  return ["title", "meta", "link", "script"].map(key => context.helmet[key].toString()).join("");
}

test("one canonical inventory covers the sitemap, static heads and future route-to-file mapping", () => {
  const routes = getCanonicalRoutes(events);
  assert.equal(routes.length, 14);
  assert.equal(new Set(routes.map(route => route.file)).size, 14);
  assert.deepEqual(routes.slice(6).map(route => route.path), getAllEvents().map(event => event.id).sort((a, b) => a - b).map(id => `/events/${id}`));
  const sitemapUrls = [...readFileSync("public/sitemap.xml", "utf8").matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(routes.map(route => route.url), sitemapUrls);
  assert.ok(routes.every(route => /^seo-pages\/[a-z0-9-]+\.html$/.test(route.file)));
  assert.ok(routes.every(route => route.file !== ERROR_SHELL_FILE));
});

test("all 14 raw heads match Helmet metadata, with owned tags and parseable JSON-LD", () => {
  for (const route of getCanonicalRoutes(events)) {
    const props = getPageSeo(route.path);
    const html = renderSeoHead(createSeoHead(props, route.path));
    assert.deepEqual(parseHead(html), parseHead(clientHead(props, route.path)), route.path);
    assert.match(html, /<title data-rh="true">/);
    assert.doesNotMatch(html, /noindex/);
    const parsed = parseHead(html);
    assert.equal(parsed.canonical[0].href, route.url);
    const graph = parsed.jsonLd[0]["@graph"];
    assert.equal(graph[0]["@type"], "Organization");
    if (/^\/events\//.test(route.path)) assert.equal(graph[1]["@type"], "Event");
    else assert.equal(graph.length, 1);
    if (route.path === "/events/8") assert.equal(graph[1].organizer.name, "Greenline");
  }
});

test("error head is shared, initially noindex and has no canonical, og:url or JSON-LD", () => {
  const html = renderSeoHead(createSeoHead(errorSeo(), "/"));
  assert.deepEqual(parseHead(html), parseHead(clientHead(errorSeo(), "/missing")));
  assert.match(html, /name="robots" content="noindex, follow"/);
  assert.doesNotMatch(html, /rel="canonical"|property="og:url"|application\/ld\+json/);
});

test("head-only injection preserves empty client root, body scripts and one Cloudflare beacon", () => {
  const template = '<html><head><title>Default</title><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div><script data-cf-beacon=\'{}\' src="https://static.cloudflareinsights.com/beacon.min.js"></script></body></html>';
  const result = injectHead(template, renderSeoHead(createSeoHead(getPageSeo("/events/4"), "/events/4")));
  assert.equal(result.slice(result.indexOf("<body>")), template.slice(template.indexOf("<body>")));
  assert.equal((result.match(/<title\b/g) || []).length, 1);
  assert.equal((result.match(/data-cf-beacon=/g) || []).length, 1);
  assert.match(result, /<script type="module" src="\/assets\/app.js"><\/script>/);
  assert.throws(() => injectHead(template.replace('<div id="root"></div>', '<div id="root">content</div>'), "head"));
  assert.throws(() => injectHead(result, "head"));
});

test("draft metadata overrides and safe escaping survive shared metadata extraction", () => {
  assert.equal(homeSeo({ ...homepage, seo: { ...homepage.seo, title: "Draft home", description: "Draft description" } }).title, "Draft home");
  assert.equal(communitySeo({ ...community, hero: { ...community.hero, description: "Draft community" } }).description, "Draft community");
  const html = renderSeoHead(createSeoHead({ title: '</title><script>bad()</script>', description: '" & <script>bad()</script>', structuredData: { name: '</script><script>bad()</script>' } }, "/"));
  assert.doesNotMatch(html, /<script>bad\(\)<\/script>/);
  assert.equal(parseHead(html).jsonLd[0]["@graph"][1].name, '</script><script>bad()</script>');
});
