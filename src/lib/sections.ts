// src/lib/sections.ts

// Import JSON for each shared section.
// Make sure these filenames exist in src/content/sections/.
import aboutIntro from "../content/sections/aboutIntro.json";
import aboutOverview from "../content/sections/aboutOverview.json";
import eventFormats from "../content/sections/eventFormats.json";
import events from "../content/sections/events.json";
import faqSection from "../content/sections/faqSection.json";
import forBrands from "../content/sections/forBrands.json";
import joinCommunity from "../content/sections/joinCommunity.json";
import joinUs from "../content/sections/joinUs.json";
import missionValues from "../content/sections/missionValues.json";
import newHere from "../content/sections/newHere.json";
import ourStory from "../content/sections/ourStory.json";
import partners from "../content/sections/partners.json";
import testimonials from "../content/sections/testimonials.json";
import valuePillars from "../content/sections/valuePillars.json";
import whoAttends from "../content/sections/whoAttends.json";

export const sectionDataBySlug = {
  aboutIntro,
  aboutOverview,
  eventFormats,
  events,
  faqSection,
  forBrands,
  joinCommunity,
  joinUs,
  missionValues,
  newHere,
  ourStory,
  partners,
  testimonials,
  valuePillars,
  whoAttends,
} as const;

export type SectionSlug = keyof typeof sectionDataBySlug;
export type AnySection = (typeof sectionDataBySlug)[SectionSlug];

/**
 * Safely load sections from an array of slugs.
 * Unknown slugs are skipped but logged to the console.
 */
export function loadSections(slugs: string[] | undefined | null): AnySection[] {
  if (!slugs || !Array.isArray(slugs)) return [];

  return slugs
    .map((slug) => {
      const key = slug as SectionSlug;
      const section = sectionDataBySlug[key];
      if (!section) {
        console.warn(`[sections] Unknown section slug: "${slug}"`);
      }
      return section ?? null;
    })
    .filter((s): s is AnySection => s !== null);
}
