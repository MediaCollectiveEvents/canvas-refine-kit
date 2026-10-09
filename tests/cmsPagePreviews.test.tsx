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
import { formatEventDate, isPastEvent, getAllEvents, getPastEvents, getUpcomingEvents } from "../src/lib/events";
import Blog from "../src/pages/Blog";
import Partners from "../src/pages/Partners";
import FAQ from "../src/pages/FAQ";
import HomepagePreview from "../src/cms/previews/HomepagePreview";
import { AboutPreview, PartnersPreview, FaqPreview } from "../src/cms/previews/EditorialPagePreview";
import EventsPreview, { LegacyEventsPagePreview } from "../src/cms/previews/EventsPreview";
import BlogPagePreview from "../src/cms/previews/BlogPagePreview";
import { PreviewProviders } from "../src/cms/previews/PreviewLayout";
import EventsSection from "../src/components/sections/EventsSection";
import EventDiscoverySection from "../src/components/sections/EventDiscoverySection";
import type { EventDiscoverySection as DiscoveryContent } from "../src/lib/homepage";
import Footer from "../src/components/layout/Footer";
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


test("homepage introduces the Collective, flagship events and attendee testimonials", () => {
  const markup = render(createElement(PreviewProviders, { route: "/", children: createElement(Home) }));
  assert.match(markup, /Meet peers • Keep informed • Stay connected/);
  assert.match(markup, /Flagship events/);
  assert.match(markup, /About the Collective/);
  assert.ok(!markup.includes("By interest"));
  assert.match(markup, /WHAT PEOPLE SAY/);
  assert.match(markup.replace(/<[^>]*>/g, ""), /In their words/);
  assert.ok(!markup.includes("WELCOME"));
  assert.ok(!markup.includes("Browse by interest"));
  assert.ok(markup.includes("Full calendar"));
  assert.ok(!markup.includes("See what’s coming up"));
  assert.ok(!markup.includes("Explore upcoming events or register your interest for future gatherings."));
});

test("homepage event index shows all canonical upcoming events in order without selection controls", () => {
  const section = homepage.sections.find(section => section.type === "eventDiscovery") as DiscoveryContent;
  const markup = render(createElement(PreviewProviders, { route: "/", children: createElement(EventDiscoverySection, { section }) }));
  const expected = getUpcomingEvents(5);
  const destinations = [...markup.matchAll(/href="\/events\/(\d+)"/g)].map(match => Number(match[1]));
  assert.deepEqual(destinations, expected.map(event => event.id));
  assert.equal(markup.split("<article ").length - 1, expected.length);
  assert.ok(!markup.includes("Learn more"));
  assert.equal(markup.split('aria-labelledby="homepage-event-').length - 1, expected.length);
  assert.match(markup, /focus-visible:outline-2/);
  assert.match(markup, /grid-rows-\[subgrid\]/);
  for (const event of expected) {
    assert.ok(markup.includes(event.title));
    const location = event.imageKey === "greenline" ? "London to Amsterdam" : event.location.split(",").slice(-1)[0].trim();
    assert.ok(markup.includes(location));
  }
  for (const image of ["Handandflower.png", "Eurostar.png", "RAI.png", "Livepiano.png"]) {
    assert.ok(markup.includes(`/uploads/Venue tiles/${image}`));
  }
  assert.ok(markup.includes("/uploads/Venue tiles/broadcaster.png"));
  assert.match(markup, /href="\/events"[^>]*>View all events/);
  assert.match(markup, /href="\/events\/calendar"[^>]*>Full calendar/);
  assert.ok(!markup.includes("aria-pressed"));
  assert.ok(!markup.includes("<button"));
});

test("homepage upcoming presentation shows only the next chronological event", () => {
  const markup = render(<PreviewProviders route="/"><EventsSection /></PreviewProviders>);
  const [next, ...later] = getUpcomingEvents();
  assert.ok(next);
  assert.ok(markup.includes(next.title));
  assert.equal(markup.split(`href="/events/${next.id}"`).length - 1, 1);
  assert.equal(markup.split("<article ").length - 1, 1);
  for (const event of later) {
    assert.ok(!markup.includes(event.title));
    assert.ok(!markup.includes(`href="/events/${event.id}"`));
  }
  assert.ok(!markup.includes("What to expect"));
});

test("Events listing retains OFF AIR, contextual metadata and chronological year groups", () => {
  const markup = render(createElement(EventsListing));
  assert.ok(markup.includes("OFF AIR: The Unfiltered Future of Media"));
  assert.ok(markup.includes('href="/events/4"'));
  assert.ok(!markup.includes("Illustrative artwork"));
  for (const event of getUpcomingEvents()) {
    assert.ok(markup.includes(formatEventDate(event.date)));
    assert.ok(markup.includes(event.location));
  }
  const years = [...new Set(getUpcomingEvents().map(event => event.date.slice(0, 4)))];
  assert.ok(years.every((year, index) => index === 0 || markup.indexOf(`>${year}</h3>`) > markup.indexOf(`>${years[index - 1]}</h3>`)));
});


test("homepage uses the updated attendance description and one shared closing CTA", () => {
  const markup = render(<PreviewProviders route="/"><Home /></PreviewProviders>);
  assert.ok(markup.includes("Our events bring together leaders, innovators and decision-makers from across broadcasting, studios, streaming and media technology."));
  assert.equal(markup.split("Want to attend our next event?").length - 1, 1);
  assert.ok(markup.indexOf("Want to attend our next event?") < markup.indexOf('<footer'));
});

test("shared attendance CTA appears on public pages but not admin routes", () => {
  for (const route of ["/", "/events", "/events/calendar"]) {
    const markup = render(<PreviewProviders route={route}><Footer /></PreviewProviders>);
    assert.equal(markup.split(route === "/events/calendar" ? "Want to attend a Media Collective event?" : "Want to attend our next event?").length - 1, 1);
    assert.ok(markup.includes("Request an invitation"));
  }
  for (const route of ["/admin/", "/manage", "/events/4", "/blog", "/partners", "/faq", "/privacy-policy"]) {
    const markup = render(<PreviewProviders route={route}><Footer /></PreviewProviders>);
    assert.ok(!markup.includes("Want to attend our next event?"));
    assert.ok(markup.includes("<footer"));
  }
  const eventsMarkup = render(<PreviewProviders route="/events"><Events /></PreviewProviders>);
  assert.equal(eventsMarkup.split("Want to attend our next event?").length - 1, 1);
});


test("Media Collective detail pages provide contextual invitation actions without a duplicate global CTA", () => {
  for (const event of getAllEvents()) {
    const markup = render(<PreviewProviders route={`/events/${event.id}`}>
      <Routes><Route path="/events/:id" element={<EventDetails />} /></Routes>
    </PreviewProviders>);
    assert.equal(markup.split(isPastEvent(event) ? "Interested in a future event?" : "Want to attend?").length - 1, 1);
    assert.ok(markup.includes(isPastEvent(event) ? ">Register interest</button>" : ">Request an invitation</button>"));
    assert.ok(!markup.includes("Want to attend our next event?"));
  }
});


test("event listing does not offer empty detail expansions", () => {
  const markup = render(<EventsListing />);
  assert.ok(!markup.includes("View details"));
  assert.ok(!markup.includes("Explore by experience"));
  for (const event of getUpcomingEvents()) assert.ok(markup.includes(`href="/events/${event.id}"`));
});


test("audience proof identifies 2026 and puts Over 300 last with the shared numeral treatment", () => {
  const markup = render(<PreviewProviders route="/"><Home /></PreviewProviders>);
  assert.match(markup, /<strong[^>]*>In 2026<\/strong>, attendees represented:/);
  assert.ok(!markup.includes("not a guaranteed audience"));
  assert.ok(!markup.includes("300+"));
  const titles = ["The Top 3", "The Major 5", "The Leading 8", "Over 300"];
  const positions = titles.map(title => markup.indexOf(`aria-label="${title}"`));
  assert.ok(positions.every((position, index) => position >= 0 && (index === 0 || position > positions[index - 1])));
  assert.equal((markup.match(/data-audience-numeral/g) || []).length, 4);
  assert.ok(markup.includes(">Request an invitation</button>"));
});

test("partner scope explains organising effort, shared commitment and independent curation", () => {
  const markup = render(<PreviewProviders route="/partners"><Partners /></PreviewProviders>);
  for (const text of ["Less work to bring people together", "Shared commitment", "Final guest and programme curation remains with The Media Collective", "particular guests, meetings or speaking roles are not guaranteed"]) {
    assert.ok(markup.includes(text));
  }
});


test("motion sections offer persistent pause controls", () => {
  const home = render(<PreviewProviders route="/"><Home /></PreviewProviders>);
  const partners = render(<PreviewProviders route="/partners"><Partners /></PreviewProviders>);
  assert.match(home, /Pause testimonials/);
  assert.match(partners, /Pause logo movement/);
});

test("upcoming detail pages keep event context beside the attendance action", () => {
  for (const event of getUpcomingEvents()) {
    const markup = render(<PreviewProviders route={`/events/${event.id}`}><Routes><Route path="/events/:id" element={<EventDetails />} /></Routes></PreviewProviders>);
    const attendance = markup.slice(markup.indexOf('aria-labelledby="event-attendance-heading"'));
    assert.ok(attendance.includes(event.title));
    assert.ok(attendance.includes(formatEventDate(event.date)));
    assert.equal((markup.match(/>Request an invitation<\/button>/g) || []).length, 2);
  }
});
