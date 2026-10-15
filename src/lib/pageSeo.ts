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
export const eventsSeo = (content = getEventContent()): SeoProps => ({
  title: `${content.hero.title} — The Media Collective`, description: content.hero.description,
});
export const communitySeo = (content = community): SeoProps => ({
  title: "Community — The Media Collective", description: content.hero.description,
});
export const partnersSeo = (content = partners): SeoProps => ({
  title: "Event Partnerships — The Media Collective", description: content.hero.description,
});
export const faqSeo = (content = faqPage): SeoProps => ({
  title: `${content.hero.title} — The Media Collective`, description: content.hero.description,
});
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
