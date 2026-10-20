import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import MobileHeroArtwork from "../src/components/shared/MobileHeroArtwork";
import { mobileHeroDelivery } from "../src/lib/mobileHero.mjs";
import { initialResourceHints } from "../scripts/generate-static-heads.mjs";
import Home from "../src/pages/Home";
import Events from "../src/pages/Events";
import Community from "../src/pages/Community";
import Partners from "../src/pages/Partners";
import FAQ from "../src/pages/FAQ";
import { PreviewProviders } from "../src/cms/previews/PreviewLayout";

const attribute = (tag: string, name: string) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]?.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&");

// Render actual page callers: testing MobileHeroArtwork alone cannot detect
// a PageHero presentation branch overriding its responsive size hint.
for (const [route, Page] of [["/", Home], ["/events", Events], ["/community", Community], ["/partners", Partners]] as const) {
  test(`${route} actual hero matches its initial preload, including size selection`, () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, "window");
    Object.defineProperty(globalThis, "window", { configurable: true, value: {
      location: { origin: "https://mediacollective.events" }, addEventListener() {}, removeEventListener() {},
    } });
    let html: string;
    try { html = renderToStaticMarkup(createElement(PreviewProviders, { route, children: createElement(Page) })); }
    finally {
      if (original) Object.defineProperty(globalThis, "window", original);
      else Reflect.deleteProperty(globalThis, "window");
    }
    const sources = html.match(/<source\b[^>]*type="image\/webp"[^>]*>/g) ?? [];
    const heroes = sources.filter(source => source.includes("website-hero-mobile-v2"));
    assert.equal(heroes.length, 1);
    const hint = initialResourceHints(route);
    assert.equal((hint.match(/rel="preload"/g) ?? []).length, 1);
    for (const [preload, picture] of [["imagesrcset", "srcSet"], ["imagesizes", "sizes"], ["media", "media"]]) {
      assert.equal(attribute(hint, preload), attribute(heroes[0], picture), `${route}: ${preload}`);
    }
    assert.equal(attribute(heroes[0], "sizes"), "80vw");
    assert.equal(attribute(heroes[0], "media"), "(width < 640px)");
  });
}

test("FAQ full-width mobile artwork has no competing preload", () => {
  const html = renderToStaticMarkup(createElement(PreviewProviders, { route: "/faq", children: createElement(FAQ) }));
  const source = html.match(/<source\b[^>]*type="image\/webp"[^>]*>/)?.[0] ?? "";
  assert.equal(attribute(source, "sizes"), "100vw");
  assert.equal(initialResourceHints("/faq"), "");
});

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
  assert.match(html, /width="1080" height="1350"/);
  assert.equal(attr(source, "sizes"), "80vw");
  assert.match(source, /website-hero-mobile-v2-640.webp 640w/);
  for (const path of ["/faq", "/privacy-policy", "/events/4", "/missing"]) assert.equal(initialResourceHints(path), "");
  for (const candidate of mobileHeroDelivery.srcSet.split(", ")) assert.ok(existsSync(`public${candidate.split(" ")[0]}`), candidate);
});

test("full-width hero layouts keep their own size hint without changing candidates", () => {
  const html = renderToStaticMarkup(createElement(MobileHeroArtwork, { sizes: "100vw" }));
  assert.match(html, /sizes="100vw"/);
  assert.ok(html.includes(mobileHeroDelivery.srcSet));
  assert.doesNotMatch(html, /sizes="80vw"/);
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
