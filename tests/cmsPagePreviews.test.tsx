import assert from "node:assert/strict";
import test from "node:test";
import { createElement, type ComponentType, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "../src/pages/Home";
import Community from "../src/pages/Community";
import CommunityPreview from "../src/cms/previews/CommunityPreview";
import community from "../src/content/community.json";
import eventsPage from "../src/content/eventsPage.json";
import OurEventsSection from "../src/components/sections/OurEventsSection";
import About from "../src/pages/About";
import Events from "../src/pages/Events";
import EventDetails from "../src/pages/EventDetails";
import { Route, Routes } from "react-router-dom";
import EventsListing from "../src/components/sections/EventsListing";
import { formatEventDate, isPastEvent, getAllEvents, getPastEvents, getUpcomingEvents } from "../src/lib/events";
import Blog from "../src/pages/Blog";
import Partners from "../src/pages/Partners";
import PartnersPageRenderer from "../src/components/sections/PartnersPageRenderer";
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
  { route: "/community", Page: Community, Preview: CommunityPreview, data: community },
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

test("event layout CMS preview renders draft formats and identifies the canonical event source", () => {
  const draft = { ...eventsPage, sections: eventsPage.sections.map(section => section.type === "eventFormats" ? { ...section, hidden: false, heading: "Draft format heading" } : section) };
  const html = render(createElement(LegacyEventsPagePreview, { entry: entry(draft) }));
  assert.match(html, /Draft format heading/);
  assert.match(html, /Edit Events Content &amp; List for the hero and individual events/);
});

test("event format references use canonical capacity and omit unresolved records", () => {
  const html = render(createElement(OurEventsSection, { section: { heading: "Formats", items: [{ eventId: "4", title: "Referenced event" }, { eventId: 999, title: "Missing event" }] } }));
  assert.match(html, /Referenced event/);
  assert.match(html, />100</);
  assert.doesNotMatch(html, /Missing event/);
});

test("Events listings display confirmed editorial capacities with their attendee or seat labels", () => {
  const markup = render(createElement(PreviewProviders, { route: "/events", children: createElement(EventsListing) }));
  for (const event of getUpcomingEvents().filter(event => event.capacity_number !== undefined)) {
    assert.ok(markup.includes(`Capacity: ${event.capacity_number} ${event.capacity_label?.toLowerCase()}`), event.title);
  }
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
  assert.match(markup, /About This Event/);
});


test("homepage introduces the Collective, flagship events and attendee testimonials", () => {
  const markup = render(createElement(PreviewProviders, { route: "/", children: createElement(Home) }));
  assert.match(markup, /INSIGHTS\. CONVERSATIONS\. CONNECTIONS\./);
  assert.match(markup, /Flagship events/);
  assert.match(markup, /About the Collective/);
  assert.ok(!markup.includes("By interest"));
  assert.match(markup, /WHAT PEOPLE SAY/);
  assert.match(markup.replace(/<[^>]*>/g, ""), /In their words/);
  assert.ok(!markup.includes("WELCOME"));
  assert.ok(!markup.includes("Browse by interest"));
  assert.ok(!markup.includes("Full calendar"));
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
  assert.ok(!markup.includes('href="/events/calendar"'));
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
  const markup = render(<PreviewProviders route="/events"><EventsListing /></PreviewProviders>);
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
  assert.ok(markup.includes("People working in broadcasting, studios, streaming and technology attend our events, including:"));
  assert.ok(markup.includes("Attendance is curated, and our events are free to attend."));
  assert.equal(markup.split("Come to our next event").length - 1, 1);
  assert.ok(markup.indexOf("Come to our next event") < markup.indexOf('<footer'));
});

test("shared attendance CTA appears on public pages but not admin routes", () => {
  for (const route of ["/", "/events", "/events/calendar"]) {
    const markup = render(<PreviewProviders route={route}><Footer /></PreviewProviders>);
    assert.equal(markup.split(route === "/" ? "Come to our next event" : route === "/events/calendar" ? "Want to attend a Media Collective event?" : "Want to attend our next event?").length - 1, 1);
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
  for (const event of getAllEvents().filter(event => !event.partnerEvent)) {
    const markup = render(<PreviewProviders route={`/events/${event.id}`}>
      <Routes><Route path="/events/:id" element={<EventDetails />} /></Routes>
    </PreviewProviders>);
    const heading = isPastEvent(event) ? "Interested in a future event?" : "Want to join us?";
    const action = isPastEvent(event) ? "Register interest" : event.ctaLabel || "Request an Invitation";
    assert.ok(markup.includes(`>${heading}</h2>`));
    assert.equal(markup.split(`>${action}</button>`).length - 1, 2);
    assert.ok(!markup.includes("Want to attend our next event?"));
  }
});


test("event listing does not offer empty detail expansions", () => {
  const markup = render(<PreviewProviders route="/events"><EventsListing /></PreviewProviders>);
  assert.ok(!markup.includes("View details"));
  assert.ok(!markup.includes("Explore by experience"));
  for (const event of getUpcomingEvents()) assert.ok(markup.includes(`href="/events/${event.id}"`));
});


test("audience proof keeps the approved four statistics in order with the shared numeral treatment", () => {
  const markup = render(<PreviewProviders route="/"><Home /></PreviewProviders>);
  assert.ok(markup.includes("People working in broadcasting, studios, streaming and technology attend our events, including:"));
  assert.ok(!markup.includes("not a guaranteed audience"));
  const titles = ["TOP 3", "MAJOR 5", "LEADING 8", "300+"];
  const positions = titles.map(title => markup.indexOf(`aria-label="${title}"`));
  assert.ok(positions.every((position, index) => position >= 0 && (index === 0 || position > positions[index - 1])));
  assert.equal((markup.match(/data-audience-numeral/g) || []).length, 4);
  assert.ok(markup.includes(">Request an invitation</button>"));
});

test("partner scope distinguishes benefits and optional programme participation", () => {
  const markup = render(<PreviewProviders route="/partners"><Partners /></PreviewProviders>);
  for (const text of ["Visibility is only the start.", "Bring your perspective to the programme through a keynote, case study, fireside chat or other editorial contribution.", "while Media Collective retains responsibility for the final programme.", "For discussion-led events, there may also be opportunities to contribute to the programme.", "Where the format allows, opportunities to speak, host a session, join a panel or share a case study", "Ways to take part.", "Build your presence, meet the people you want to work with and take an active role before, during and after the event."]) {
    assert.ok(markup.includes(text));
  }
  assert.doesNotMatch(markup, /id="partner-process"|A simple process\.|Identify the right fit/);
  assert.ok(markup.indexOf('id="partner-objectives"') < markup.indexOf('id="partner-conversation"'));
});


test("motion sections retain keyboard pause support without visible pause buttons", () => {
  const home = render(<PreviewProviders route="/"><Home /></PreviewProviders>);
  const partners = render(<PreviewProviders route="/partners"><Partners /></PreviewProviders>);
  assert.doesNotMatch(home, />Pause testimonials<|>Resume testimonials</);
  assert.doesNotMatch(partners, />Pause logo movement<|>Resume logo movement</);
  assert.match(home, /role="region" aria-label="Testimonials" aria-keyshortcuts="Space"/);
  assert.doesNotMatch(partners, /aria-label="Partner logos"/);
  const logoSection = render(<PartnersPageRenderer sections={[{ type: "partnersLogos" }]} onRegister={() => {}} />);
  assert.match(logoSection, /role="region" aria-label="Partner logos" aria-keyshortcuts="Space"/);
  assert.match(home, /aria-label="Show testimonial 2"/);
});

test("upcoming detail pages keep event context beside the attendance action", () => {
  for (const event of getUpcomingEvents()) {
    const markup = render(<PreviewProviders route={`/events/${event.id}`}><Routes><Route path="/events/:id" element={<EventDetails />} /></Routes></PreviewProviders>);
    const main = markup.slice(markup.indexOf("<main"));
    const header = main.slice(0, main.indexOf("</header>"));
    assert.ok(header.includes(event.title));
    assert.ok(header.includes(formatEventDate(event.date)));
    assert.ok(header.includes(event.location));
    assert.ok(header.includes(`Capacity: ${event.capacity ?? event.capacity_number}`));
    if (event.partnerEvent && !event.registrationLink) {
      assert.ok(header.includes("Organiser: Greenline"));
      assert.ok(header.includes("Paid tickets."));
      assert.doesNotMatch(main, /disabled=""|>Register Interest<\/button>/);
    } else {
      const action = event.ctaLabel || "Request an Invitation";
      assert.equal(main.split(`>${action}</button>`).length - 1, 2);
      assert.ok(header.indexOf(formatEventDate(event.date)) < header.indexOf(`>${action}</button>`));
      assert.ok(header.indexOf("Capacity:") < header.indexOf(`>${action}</button>`));
    }
  }
});


test("Community places the verified 2026 seniority snapshot between organisations and FAQ", () => {
  const markup = render(<PreviewProviders route="/community"><Community /></PreviewProviders>);
  const start = markup.indexOf('id="community-audience-snapshot"');
  assert.ok(markup.indexOf('id="community-organisations"') < start);
  assert.ok(start < markup.indexOf('id="community-faq"'));
  const snapshot = markup.slice(start, markup.indexOf('</section>', start));
  for (const text of ["2026 AUDIENCE SNAPSHOT", "321", "senior leaders*", "75", "C-suite guests", "661", "guests across 6 events", "* Founder, Executive, President, Director, Head of Function or equivalent senior leadership titles."]) assert.ok(snapshot.includes(text));
  assert.doesNotMatch(snapshot, /%|620\+/);
});
