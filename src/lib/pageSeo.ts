import homepage from "@/content/homepage.json";
import community from "@/content/community.json";
import partners from "@/content/partners.json";
import faqPage from "@/content/faqPage.json";
import { getEventContent, getEventById, type EventItem } from "./events";
import { getEventImage } from "./eventImages";
import { eventData } from "./structuredData";
import type { SeoProps } from "./seoHead";
export { createSeoHead, renderSeoHead } from "./seoHead";

export const homeSeo = (content = homepage): SeoProps => ({
  title: content.seo.title, description: content.seo.description, ogImage: content.seo.ogImage,
});
// Keep approved search summaries separate from visible hero copy. Draft hero
// overrides still appear in CMS previews without changing the public metadata.
function heroSeo(content: { hero: { title: string; description: string } }, canonical: typeof content, title: string, description: string): SeoProps {
  return {
    title: content.hero.title === canonical.hero.title ? title : `${content.hero.title} — The Media Collective`,
    description: content.hero.description === canonical.hero.description ? description : content.hero.description,
  };
}
export const eventsSeo = (content = getEventContent()): SeoProps => heroSeo(content, getEventContent(),
  "Upcoming Media & Broadcast Events — The Media Collective",
  "Browse upcoming discussions, breakfasts, receptions and social events, plus independent partner events. Find dates, locations and attendance details.");
export const communitySeo = (content = community): SeoProps => heroSeo(content, community,
  "Media & Technology Community — The Media Collective",
  "See who attends Media Collective events, from broadcasters and studios to streaming and technology businesses, and how invitations work.");
export const partnersSeo = (content = partners): SeoProps => heroSeo(content, partners,
  "Event Partnerships — The Media Collective",
  "Explore ways to support Media Collective events, build your presence and contribute to discussion-led programmes where the format allows.");
export const faqSeo = (content = faqPage): SeoProps => heroSeo(content, faqPage,
  "Event FAQs — The Media Collective",
  "Answers about invitations, attendance, event costs, partnerships and how guest contact details are used at The Media Collective.");
export const privacySeo = (): SeoProps => ({
  title: "Privacy Policy — The Media Collective",
  description: "How The Media Collective collects, uses and protects personal data, and how to contact us about your privacy.",
});
export const errorSeo = (event = false): SeoProps => ({
  title: `${event ? "Event" : "Page"} Not Found — The Media Collective`, noindex: true,
});
export const eventSeo = (event: EventItem): SeoProps => ({
  title: event.seoTitle || `${event.title} — The Media Collective`,
  description: event.seoDescription || event.summary || event.description,
  ogImage: event.socialImage || getEventImage(event), url: `/events/${event.id}`, structuredData: eventData(event),
});

export function getPageSeo(path: string): SeoProps {
  switch (path) {
    case "/": return homeSeo();
    case "/events": return eventsSeo();
    case "/community": return communitySeo();
    case "/partners": return partnersSeo();
    case "/faq": return faqSeo();
    case "/privacy-policy": return privacySeo();
    default: {
      const match = path.match(/^\/events\/([^/]+)$/);
      const event = match ? getEventById(match[1]) : undefined;
      return event ? eventSeo(event) : errorSeo(!!match);
    }
  }
}
