import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { DEFAULT_SOCIAL_IMAGE, createSeoHead, resolveSocialImage } from "../src/lib/seoHead";
import { getPageSeo, homeSeo, eventSeo } from "../src/lib/pageSeo";
import { getCanonicalRoutes } from "../src/lib/canonicalRoutes.mjs";
import { getAllEvents, getEventById } from "../src/lib/events";
import homepage from "../src/content/homepage.json";
import events from "../src/content/events.json";

const meta = (head: ReturnType<typeof createSeoHead>, name: string) => head.meta.filter(tag => (tag.property || tag.name) === name);

test("all canonical routes have one complete, consistent set of social tags", () => {
  for (const route of getCanonicalRoutes(events)) {
    const head = createSeoHead(getPageSeo(route.path), route.path);
    for (const name of ["og:title", "og:description", "og:url", "og:type", "og:image", "twitter:card", "twitter:title", "twitter:description", "twitter:image"]) {
      assert.equal(meta(head, name).length, 1, `${route.path}: ${name}`);
      assert.ok(meta(head, name)[0].content, `${route.path}: empty ${name}`);
    }
    assert.equal(meta(head, "og:title")[0].content, meta(head, "twitter:title")[0].content);
    assert.equal(meta(head, "og:description")[0].content, meta(head, "twitter:description")[0].content);
    assert.equal(meta(head, "og:image")[0].content, meta(head, "twitter:image")[0].content);
    assert.equal(meta(head, "og:url")[0].content, route.url);
    assert.equal(meta(head, "twitter:card")[0].content, "summary_large_image");
    assert.match(meta(head, "og:image")[0].content, /^https:\/\/www\.mediacollective\.events\//);
    assert.doesNotMatch(meta(head, "og:image")[0].content, /chatgpt-image-mar-23/);
  }
});

test("standard pages use the explicit branded default, independent of homepage artwork", () => {
  for (const path of ["/", "/community", "/events", "/partners", "/faq", "/privacy-policy"]) {
    assert.equal(meta(createSeoHead(getPageSeo(path), path), "og:image")[0].content, DEFAULT_SOCIAL_IMAGE);
  }
  const card = readFileSync("public/uploads/media-collective-social-default.png");
  assert.deepEqual([...card.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], "Default must be a PNG");
  assert.equal(card.readUInt32BE(16), 1200, "Approved social-card width");
  assert.equal(card.readUInt32BE(20), 630, "Approved social-card height");
  const draftHome = homeSeo({ ...homepage, seo: { ...homepage.seo, ogImage: "/uploads/off-air.png" } });
  assert.equal(resolveSocialImage(draftHome.ogImage), "https://www.mediacollective.events/uploads/off-air.png");
  assert.equal(meta(createSeoHead(getPageSeo("/community"), "/community"), "og:image")[0].content, DEFAULT_SOCIAL_IMAGE);
});

test("existing explicit and event-artwork overrides remain supported without changing structured data", () => {
  const event = getEventById(4)!;
  const override = eventSeo({ ...event, socialImage: "/uploads/soho-house-white-city.png" });
  assert.equal(resolveSocialImage(override.ogImage), "https://www.mediacollective.events/uploads/soho-house-white-city.png");
  assert.deepEqual(override.structuredData, eventSeo(event).structuredData);
  for (const item of getAllEvents()) assert.ok(eventSeo(item).ogImage, `Existing event ${item.id} image is retained`);
});

test("empty, unsafe and malformed image overrides fall back to the explicit brand asset", () => {
  for (const value of [undefined, "", "  ", "javascript:alert(1)", "data:image/png;base64,abcd", "https://[broken", "https://user:password@example.com/image.png"]) {
    assert.equal(resolveSocialImage(value), DEFAULT_SOCIAL_IMAGE);
  }
  assert.equal(resolveSocialImage("/uploads/off-air.png"), "https://www.mediacollective.events/uploads/off-air.png");
  assert.equal(resolveSocialImage("https://example.com/approved-event.png"), "https://example.com/approved-event.png");
});
