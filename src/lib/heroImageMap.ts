// src/lib/heroImageMap.ts

// Use existing hero assets from src/assets
import heroPeople from "@/assets/hero-people.jpg";
import heroBackground from "@/assets/hero-background.png";
import heroPlaceholder from "@/assets/hero-placeholder.jpg";

// You can swap these mappings later as you add more specific hero artwork.
// For now we reuse what exists so Vite stops erroring.

export const heroImageMap: Record<string, string> = {
  // Homepage
  homeHero: heroPeople,

  // About page
  aboutHero: heroPlaceholder,

  // Events page
  eventsHero: heroBackground,

  // Blog page
  blogHero: heroBackground,

  // FAQ page
  faqHero: heroPlaceholder,

  // Partners page
  partnersHero: heroPlaceholder,

  // Sponsors page
  sponsorsHero: heroPlaceholder,

  // Generic fallback
  defaultHero: heroPlaceholder,
};
