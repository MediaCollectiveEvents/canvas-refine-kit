import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import EventPageTemplate from "../src/components/shared/EventPageTemplate";
import { getEventById } from "../src/lib/events";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import EventDetails from "../src/pages/EventDetails";
import EventsPreview from "../src/cms/previews/EventsPreview";
import content from "../src/content/events.json";
import { eventSeo, createSeoHead, renderSeoHead } from "../src/lib/pageSeo";

const event = getEventById(7)!;
const render = (value = event) => renderToStaticMarkup(createElement(EventPageTemplate, { event: value, onRequest() {} }));

test("Decompression uses the confirmed existing 2027 edition and invitation actions", () => {
  const html = render();
  assert.equal(event.date, "2027-09-12");
  assert.match(html, />IBC 2027<\/p>/);
  assert.match(html, /Sunday,? 12 September 2027/);
  assert.match(html, /18:30–21:30/);
  assert.match(html, /Live Amsterdam Piano Bar/);
  assert.match(html, /Thorbeckeplein 16/);
  assert.match(html, /1017 CS Amsterdam/);
  assert.match(html, /Netherlands/);
  assert.match(html, /By invitation and advance registration only\./);
  assert.match(html, /Places are limited and registration is required in advance\./);
  assert.match(html, />IBC DECOMPRESSION PARTY<\/p>/);
  assert.match(html, />Join us for the final evening of IBC\.<\/h2>/);
  assert.equal((html.match(/>Request an Invitation<\/button>/g) || []).length, 2);
});

test("Decompression shares OFF AIR editorial programme treatment without host or partner content", () => {
  const html = render({ ...event, partners: [{ name: "Must not appear", logo: "/unconfirmed.png" }] });
  let previous = -1;
  for (const title of ["About the Decompression Party", "Who Attends", "The Evening", "Why Attend", "A Different Side of IBC", "Event Details"]) {
    const position = html.indexOf(`>${title}</h2>`);
    assert.ok(position > previous, title);
    previous = position;
  }
  for (const title of ["ARRIVE &amp; DECOMPRESS", "LIVE JAZZ", "DRINKS &amp; CANAPÉS", "THE TERRACE", "GREAT COMPANY"]) assert.ok(html.includes(`>${title}</h3>`));
  assert.match(html, /md:grid-cols-\[minmax\(0,1fr\)_minmax\(0,2fr\)\]/);
  assert.doesNotMatch(html, /Meet the Hosts|In Association With|Must not appear|unconfirmed.png|Faultline|decodeTV/);
});

test("Decompression renders draft content and keeps safe past/closed registration behaviour", () => {
  const html = render({ ...event, programme: [{ description: "DRAFT EVENING\n\nDraft description" }], details: "Draft social copy", whoAttends: "Draft audience" });
  assert.match(html, />DRAFT EVENING<\/h3>/);
  assert.match(html, /Draft description|Draft social copy|Draft audience/);
  assert.match(render({ ...event, date: "2000-01-01" }), />Register interest<\/button>/);
  assert.doesNotMatch(render({ ...event, statusLabel: "Registration Closed" }), /<button/);
  assert.doesNotThrow(() => render({ ...event, date: "" }));
});

test("Decompression completes the nine-section page with eligible canonical event links", () => {
  const html = renderToStaticMarkup(createElement(HelmetProvider, null, createElement(MemoryRouter, { initialEntries: ["/events/7"] }, createElement(Routes, null, createElement(Route, { path: "/events/:id", element: createElement(EventDetails) })))));
  let previous = html.indexOf("<h1");
  for (const title of ["About the Decompression Party", "Who Attends", "The Evening", "Why Attend", "A Different Side of IBC", "Event Details", "Other Upcoming Events", "Join us for the final evening of IBC."]) {
    const position = html.indexOf(`>${title}</h2>`);
    assert.ok(position > previous, title);
    previous = position;
  }
  const related = html.match(/<section aria-label="Other Upcoming Events"[^>]*>(.*?)<\/section>/)?.[0] || "";
  assert.match(related, /border-t border-white\/10/);
  const links = [...related.matchAll(/href="\/events\/(\d+)"/g)].map(match => Number(match[1]));
  assert.ok(links.length > 0);
  for (const id of links) {
    const target = getEventById(id)!;
    assert.ok(target && target.id !== 7);
    assert.ok(new Date(target.date).getTime() >= new Date().setUTCHours(0, 0, 0, 0));
  }
  assert.equal(event.programme?.length, 5);
  assert.doesNotMatch(html, /About This Event|What To Expect|Meet the Hosts|In Association With|>During IBC<\/h2>/);
});

test("Decompression retains parseable SEO metadata and existing repository facts", () => {
  const seo = eventSeo(event);
  const html = renderSeoHead(createSeoHead(seo, "/events/7"));
  const json = JSON.parse(html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/)?.[1] || "null");
  const data = json["@graph"].find((node: any) => node["@type"] === "Event");
  assert.equal(data.url, "https://mediacollective.events/events/7");
  assert.equal(data.startDate, "2027-09-12");
  assert.equal(data.maximumAttendeeCapacity, 200);
  assert.equal(data.location.name, "Live Amsterdam Piano Bar · Amsterdam");
  assert.equal(event.image, "/uploads/Venue tiles/Livepiano.png");
  assert.equal(event.imageKey, "ibc-decompression-party-2027");
  assert.ok(html.includes('rel="canonical" href="https://mediacollective.events/events/7"'));
  assert.ok(html.includes('property="og:title"'));
  assert.equal(seo.description, event.seoDescription);
});

test("Decap events preview renders Decompression draft content through the existing collection", () => {
  const draft = { ...content, events: content.events.map(item => item.id === 7 ? { ...item, description: "Draft Decompression introduction" } : item) };
  const html = renderToStaticMarkup(createElement(EventsPreview, { entry: { getIn: () => ({ toJS: () => draft }) } }));
  assert.match(html, /Draft Decompression introduction/);
  assert.match(html, /href="\/events\/7"/);
  assert.doesNotMatch(html, /role="alert"/);
});
