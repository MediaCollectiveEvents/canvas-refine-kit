import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, statSync } from "node:fs";
import { responsiveEventImage, eventImageSizes, headerLogoImage } from "../src/lib/imageDelivery";

test("only approved event images get responsive delivery; original sources remain available", () => {
  for (const source of ["/uploads/Venue tiles/RAI.png", "/uploads/Venue tiles/Handandflower.png", "/uploads/Venue tiles/Eurostar.png", "/uploads/off-air.png", "/uploads/soho-house-white-city.png"]) {
    assert.ok(existsSync(`public${source}`));
    const image = responsiveEventImage(source, eventImageSizes.discovery);
    assert.equal(image.sizes, eventImageSizes.discovery);
    assert.ok(image.srcSet);
    for (const candidate of image.srcSet.split(", ")) {
      const [url] = candidate.split(" ");
      assert.ok(existsSync(`public${url}`), url);
      assert.ok(statSync(`public${url}`).size < statSync(`public${source}`).size, url);
    }
  }
  const piano = responsiveEventImage("/uploads/Venue tiles/Livepiano.png", eventImageSizes.detail);
  assert.equal(piano.src, "/uploads/Venue tiles/Livepiano.webp");
  assert.ok(statSync(`public${piano.src}`).size < statSync("public/uploads/Venue tiles/Livepiano.png").size);
  for (const source of ["/uploads/custom.png", "/uploads/website-hero-mobile.png"]) {
    assert.deepEqual(responsiveEventImage(source, eventImageSizes.detail), { src: source });
  }
});

test("header logo shares candidates and sizes across both responsive header instances", () => {
  assert.equal(headerLogoImage.sizes, "(min-width: 1024px) 180px, 128px");
  for (const candidate of headerLogoImage.srcSet.split(", ")) {
    const [url] = candidate.split(" ");
    assert.ok(existsSync(`public${url}`));
    assert.ok(statSync(`public${url}`).size < statSync("src/assets/logo.png").size);
  }
});
