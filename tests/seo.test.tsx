import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Seo from "../src/components/shared/Seo";
import NotFound from "../src/pages/NotFound";
import EventDetails from "../src/pages/EventDetails";
import EventsListing from "../src/components/sections/EventsListing";
import { getAllEvents, getEventById, getPastEvents } from "../src/lib/events";
import { eventData, organisationData, serializeStructuredData } from "../src/lib/structuredData";
import { generateSitemap } from "../scripts/generate-sitemap.mjs";

function render(path: string, element: React.ReactNode) {
  const context: any = {};
  const html = renderToStaticMarkup(createElement(HelmetProvider, { context },
    createElement(MemoryRouter, { initialEntries: [path] }, element)));
  return { html, head: Object.values(context.helmet).filter((value: any) => typeof value?.toString === "function").map(String).join("") };
}

test("valid pages retain canonical indexing and parseable organisation JSON-LD", () => {
  for (const path of ["/", "/events", "/community", "/partners", "/faq", "/privacy-policy"]) {
    const { head } = render(path, createElement(Seo, { title: "Test" }));
    assert.match(head, new RegExp(`rel="canonical" href="https://mediacollective.events${path}"`));
    assert.doesNotMatch(head, /noindex/);
    const data = JSON.parse(head.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/s)![1]);
    assert.deepEqual(data["@graph"], [organisationData()]);
  }
});

test("both error states are noindex without canonical URLs or valid-page structured data", () => {
  for (const path of ["/missing-seo-test", "/events/missing-seo-test"]) {
    const { html, head } = render(path, createElement(Routes, null,
      createElement(Route, { path: "/events/:id", element: createElement(EventDetails) }),
      createElement(Route, { path: "*", element: createElement(NotFound) })));
    assert.match(head, /name="robots" content="noindex, follow"/);
    assert.doesNotMatch(head, /rel="canonical"|property="og:url"|application\/ld\+json/);
    assert.match(html, /href="\/events"/);
    assert.match(html, /href="\/"/);
  }
});

test("event JSON-LD preserves confirmed data and independent organiser without invented details", () => {
  for (const event of getAllEvents()) {
    const { head } = render(`/events/${event.id}`, createElement(Seo, { structuredData: eventData(event) }));
    const graph = JSON.parse(head.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/s)![1])["@graph"];
    const data = graph.find((node: any) => node["@type"] === "Event");
    assert.equal(data.name, event.title);
    assert.equal(data.url, `https://mediacollective.events/events/${event.id}`);
    assert.equal(data.startDate, event.startsAt || event.date);
    assert.equal(data.endDate, event.endsAt || undefined);
    assert.equal(data.offers, undefined);
    assert.equal(data.location.address, undefined);
    if (event.partnerEvent) assert.deepEqual(data.organizer, { "@type": "Organization", name: "Greenline" });
    else assert.equal(data.organizer["@id"], organisationData()["@id"]);
  }
  assert.deepEqual(eventData({ ...getEventById(8)!, attendanceStatement: "Paid tickets." }).organizer, { "@type": "Organization", name: "Greenline" });
  assert.equal(eventData({ ...getEventById(8)!, id: 99, attendanceStatement: "Paid tickets." }).organizer, undefined);
  assert.doesNotMatch(serializeStructuredData({ name: "</script><script>alert(1)</script>" }), /</);
});

test("sitemap stays in sync with all resolvable events and excludes aliases, errors and deferred routes", () => {
  const sitemap = readFileSync("public/sitemap.xml", "utf8");
  assert.equal(sitemap, generateSitemap());
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.equal(urls.length, 6 + getAllEvents().length);
  assert.equal(new Set(urls).size, urls.length);
  assert.deepEqual(urls.filter(url => /\/events\/\d+$/.test(url)), getAllEvents().map(e => e.id).sort((a, b) => a - b).map(id => `https://mediacollective.events/events/${id}`));
  assert.doesNotMatch(sitemap, /\/privacy<|\/events\/calendar|\/blog|\/manage|missing/);
  assert.match(readFileSync("public/robots.txt", "utf8"), /^Sitemap: https:\/\/mediacollective.events\/sitemap.xml$/m);
  const filtered = generateSitemap({ events: [{ id: 1 }, { id: 1 }, { id: -1 }, { id: "2" }, { id: 3 }] });
  assert.match(filtered, /\/events\/3</);
  assert.doesNotMatch(filtered, /\/events\/[12]</);
});

test("past-event links are present in the collapsed rendered DOM", () => {
  const { html } = render("/events", createElement(EventsListing));
  assert.match(html, /id="past-events" hidden=""/);
  assert.doesNotMatch(html, /aria-controls="past-events"|View past events|Hide past events/);
  for (const event of getPastEvents()) assert.ok(html.includes(`href="/events/${event.id}"`));
});
