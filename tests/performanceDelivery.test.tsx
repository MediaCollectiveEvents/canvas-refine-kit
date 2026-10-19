import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import MobileHeroArtwork from "../src/components/shared/MobileHeroArtwork";
import { mobileHeroDelivery } from "../src/lib/mobileHero.mjs";
import { initialResourceHints } from "../scripts/generate-static-heads.mjs";

test("mobile preload and picture select identical responsive hero candidates", () => {
  const html = renderToStaticMarkup(createElement(MobileHeroArtwork));
  const source = html.match(/<source\b[^>]*type="image\/webp"[^>]*>/)?.[0] ?? "";
  const attr = (tag: string, name: string) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
  for (const path of ["/", "/events", "/community", "/partners"]) {
    const hint = initialResourceHints(path).replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    assert.equal(attr(hint, "imagesrcset"), attr(source, "srcSet"));
    assert.equal(attr(hint, "imagesizes"), attr(source, "sizes"));
    assert.equal(attr(hint, "media"), attr(source, "media"));
    assert.match(hint, /fetchpriority="high"/);
  }
  assert.match(html, /fetchPriority="high"/);
  assert.doesNotMatch(html, /loading="lazy"/);
  assert.match(html, /width="1620" height="2025"/);
  for (const path of ["/faq", "/privacy-policy", "/events/4", "/missing"]) assert.equal(initialResourceHints(path), "");
  for (const candidate of mobileHeroDelivery.srcSet.split(", ")) assert.ok(existsSync(`public${candidate.split(" ")[0]}`), candidate);
});

test("custom artwork does not inherit the default artwork's responsive candidates", () => {
  const html = renderToStaticMarkup(createElement(MobileHeroArtwork, { src: "/uploads/custom.png" }));
  assert.match(html, /srcSet="\/uploads\/custom.png"/);
  assert.doesNotMatch(html, /website-hero-mobile/);
});

test("fonts keep their families and weights but leave the CSS import waterfall", () => {
  const html = readFileSync("index.html", "utf8");
  assert.doesNotMatch(readFileSync("src/index.css", "utf8"), /@import[^;]*fonts.googleapis/);
  const active = html.replace(/<noscript>[\s\S]*?<\/noscript>/, "");
  const sheets = active.match(/<link[^>]*rel="stylesheet"[^>]*>/g) ?? [];
  assert.equal(sheets.length, 2);
  assert.ok(sheets.every(tag => tag.includes('media="print"') && tag.includes("this.media='all'")));
  assert.match(html, /family=Montserrat:wght@300;400;500;600;700&family=Source\+Sans\+3:wght@400;500;600&display=swap/);
  assert.match(html, /family=Satisfy&display=swap/);
  assert.match(html, /<noscript>[\s\S]*rel="stylesheet"[\s\S]*<\/noscript>/);
  assert.match(html, /rel="preconnect" href="https:\/\/fonts.gstatic.com" crossorigin/);
});
