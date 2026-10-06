import assert from "node:assert/strict";
import test from "node:test";
import { createElement, type ComponentType, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "../src/pages/Home";
import About from "../src/pages/About";
import Events from "../src/pages/Events";
import EventDetails from "../src/pages/EventDetails";
import { Route, Routes } from "react-router-dom";
import EventsListing from "../src/components/sections/EventsListing";
import { getPastEvents, getUpcomingEvents } from "../src/lib/events";
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
    if (route === "/events") {
      // CMS deliberately keeps historical content visible for editors.
      for (const event of getUpcomingEvents()) {
        assert.ok(live.includes(event.title));
        assert.ok(preview.includes(event.title));
      }
      assert.match(live, /View past events/);
      assert.match(preview, /Hide past events/);
      for (const event of getPastEvents()) {
        assert.ok(!live.includes(`href="/events/${event.id}"`));
        assert.ok(preview.includes(`href="/events/${event.id}"`));
      }
    } else assert.equal(preview, live);
  });
  test(`${route} CMS preview reads draft hero values`, () => {
    const draft = { ...data, hero: { ...data.hero, title: "Draft title under review" } };
    assert.match(render(createElement(Preview, { entry: entry(draft) })), /Draft title under review/);
  });
}

test("unused legacy events configuration is clearly identified", () => {
  assert.match(render(createElement(LegacyEventsPagePreview)), /legacy configuration is not used by the live Events page/);
});


const listingContent = {
  hero: { title: "Event listing" },
  events: [
    { id: 90, title: "Later upcoming", date: "2099-02-01", type: "upcoming" },
    { id: 91, title: "Older past", date: "2000-01-01", type: "past" },
    { id: 92, title: "Earlier upcoming", date: "2099-01-01", type: "upcoming" },
    { id: 93, title: "Recent past", date: "2001-01-01", type: "past" },
  ],
};
const renderListing = (showPastEventsInitially = false) => render(createElement(PreviewProviders, {
  route: "/events", children: createElement(EventsListing, { content: listingContent, showPastEventsInitially }),
}));

test("public listing initially excludes past records and sorts upcoming events earliest first", () => {
  const markup = renderListing();
  assert.ok(markup.indexOf("Earlier upcoming") < markup.indexOf("Later upcoming"));
  assert.ok(!markup.includes("Older past"));
  assert.ok(!markup.includes("Recent past"));
  assert.match(markup, /aria-expanded="false"/);
  assert.match(markup, /View past events/);
  assert.ok(!markup.includes('id="past-events"'));
});

test("expanded listing retains upcoming order and sorts past events most recent first", () => {
  const markup = renderListing(true);
  assert.ok(markup.indexOf("Earlier upcoming") < markup.indexOf("Later upcoming"));
  assert.ok(markup.indexOf("Later upcoming") < markup.indexOf("Recent past"));
  assert.ok(markup.indexOf("Recent past") < markup.indexOf("Older past"));
  assert.match(markup, /aria-expanded="true"/);
  assert.match(markup, /Hide past events/);
  assert.match(markup, /id="past-events"/);
});


test("direct past-event routes still render their event details", () => {
  const event = getPastEvents()[0];
  const markup = render(<PreviewProviders route={`/events/${event.id}`}>
    <Routes><Route path="/events/:id" element={<EventDetails />} /></Routes>
  </PreviewProviders>);
  assert.ok(markup.includes(event.title));
  assert.match(markup, /Past event/);
  assert.match(markup, /About this gathering/);
});
