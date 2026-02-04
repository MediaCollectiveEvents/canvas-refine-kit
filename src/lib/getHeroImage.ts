// src/lib/getHeroImage.ts
import defaultHero from "@/assets/home-hero.png";

/**
 * Returns a page-specific hero image if the file exists,
 * otherwise falls back to the default homepage hero.
 *
 * Usage:
 *   const heroImage = getHeroImage("about-hero.png");
 *   <PageHero image={heroImage} ... />
 */
export function getHeroImage(fileName?: string): string {
  if (!fileName) {
    return defaultHero;
  }

  try {
    // This builds a URL relative to /src, Vite will serve from /src/assets
    return new URL(`../assets/${fileName}`, import.meta.url).href;
  } catch {
    // If the asset doesn't exist, use the default hero image
    return defaultHero;
  }
}
