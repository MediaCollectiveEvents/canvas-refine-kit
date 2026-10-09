import assert from "node:assert/strict";
import test from "node:test";
import { heroBackground, losslessHeroSource } from "../src/lib/heroImages";

test("only approved artwork with a lossless variant is substituted", () => {
  assert.equal(losslessHeroSource("/uploads/website-hero-mobile.png"), "/uploads/website-hero-mobile.webp");
  assert.equal(losslessHeroSource("/uploads/editor-upload.png"), undefined);
  assert.equal(heroBackground("/uploads/editor-upload.png"), 'url("/uploads/editor-upload.png")');
});

test("hero artwork preserves its PNG fallback during server rendering", () => {
  assert.equal(heroBackground("/uploads/home-hero-v14.png"), 'url("/uploads/home-hero-v14.png")');
});
