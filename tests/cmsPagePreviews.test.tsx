import assert from "node:assert/strict";
import test from "node:test";
import { createElement, type ComponentType, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "../src/pages/Home";
import About from "../src/pages/About";
import Events from "../src/pages/Events";
import Blog from "../src/pages/Blog";
import Partners from "../src/pages/Partners";
import FAQ from "../src/pages/FAQ";
import HomepagePreview from "../src/cms/previews/HomepagePreview";
import { AboutPreview, PartnersPreview, FaqPreview } from "../src/cms/previews/EditorialPagePreview";
import EventsPreview, { LegacyEventsPagePreview } from "../src/cms/previews/EventsPreview";
import BlogPagePreview from "../src/cms/previews/BlogPagePreview";
import { PreviewProviders } from "../src/cms/previews/PreviewLayout";
import type { PreviewEntry } from "../src/cms/previews/previewData";
import homepage from "../src/content/homepage.json";
import about from "../src/content/about.json";
import events from "../src/content/events.json";
import blog from "../src/content/blogPage.json";
import partners from "../src/content/partners.json";
import faq from "../src/content/faqPage.json";

const entry = (data: unknown): PreviewEntry => ({ getIn: () => ({ toJS: () => data }) });
function render(node: ReactElement) {
  // The live featured-event component builds share links from this origin.
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    location: { origin: "https://mediacollective.events" },
    addEventListener() {},
    removeEventListener() {},
  } });
  try { return renderToStaticMarkup(node); }
  finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else Reflect.deleteProperty(globalThis, "window");
  }
}
const cases = [
  { route: "/", Page: Home, Preview: HomepagePreview, data: homepage },
  { route: "/about", Page: About, Preview: AboutPreview, data: about },
  { route: "/events", Page: Events, Preview: EventsPreview, data: events },
  { route: "/blog", Page: Blog, Preview: BlogPagePreview, data: blog },
  { route: "/partners", Page: Partners, Preview: PartnersPreview, data: partners },
  { route: "/faq", Page: FAQ, Preview: FaqPreview, data: faq },
];

for (const { route, Page, Preview, data } of cases) {
  test(`${route} CMS preview matches the live page markup`, () => {
    const live = render(createElement(PreviewProviders, { route, children: createElement(Page as ComponentType) }));
    const preview = render(createElement(Preview, { entry: entry(data) }));
    assert.equal(preview, live);
  });
  test(`${route} CMS preview reads draft hero values`, () => {
    const draft = { ...data, hero: { ...data.hero, title: "Draft title under review" } };
    assert.match(render(createElement(Preview, { entry: entry(draft) })), /Draft title under review/);
  });
}

test("unused legacy events configuration is clearly identified", () => {
  assert.match(render(createElement(LegacyEventsPagePreview)), /legacy configuration is not used by the live Events page/);
});
