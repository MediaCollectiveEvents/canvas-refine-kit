import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import PageHero from "../src/components/shared/PageHero";

for (const presentation of ["business", "editorial"] as const) {
  test(`${presentation} hero is CTA-free by default even with existing CTA content`, () => {
    const html = renderToStaticMarkup(<PageHero presentation={presentation} title="Our story" eyebrow="Our community"
      description="Supporting copy" image="/uploads/hero.png"
      primaryCtaText="Hero action" primaryCtaHref="/events"
      secondaryCtaText="Second hero action" secondaryCtaHref="/partners" />);
    assert.ok(html.includes("Our story"));
    assert.ok(html.includes("Supporting copy"));
    assert.ok(html.includes("/uploads/hero.png"));
    assert.ok(!html.includes("Hero action"));
    assert.ok(!html.includes("Second hero action"));
    assert.ok(!html.includes("<button"));
    assert.ok(!html.includes("<a "));
  });
}
