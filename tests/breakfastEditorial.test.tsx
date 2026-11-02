import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EventDetails from "../src/pages/EventDetails";
import EventPageTemplate from "../src/components/shared/EventPageTemplate";
import EventsPreview from "../src/cms/previews/EventsPreview";
import content from "../src/content/events.json";
import { getEventById, getRelatedEvents, getUpcomingEvents } from "../src/lib/events";
import { eventSeo, createSeoHead, renderSeoHead } from "../src/lib/pageSeo";

const event = getEventById(6)!;
const render = (value = event) => renderToStaticMarkup(<EventPageTemplate event={value} onRequest={() => {}} />);

test("Breakfast delivers the nine editorial sections and consistent invitation actions", () => {
  const html = renderToStaticMarkup(<HelmetProvider><MemoryRouter initialEntries={["/events/6"]}><Routes><Route path="/events/:id" element={<EventDetails />} /></Routes></MemoryRouter></HelmetProvider>);
  let previous = html.indexOf("<h1");
  for (const title of ["About the Networking Breakfast", "Who Attends", "The Morning", "Why Attend", "A Better Start to IBC", "Event Details", "Other Upcoming Events", "Start your IBC morning with us."]) {
    const position = html.indexOf(`>${title}</h2>`);
    assert.ok(position > previous, title);
    previous = position;
  }
  assert.doesNotMatch(html, /About This Event|What To Expect|>Programme<\/h2>|>During IBC<\/h2>|Meet the Hosts|In Association With/);
  assert.match(html, /md:grid-cols-\[minmax\(0,1fr\)_minmax\(0,2fr\)\]/);
  assert.equal((html.match(/>Request an Invitation<\/button>/g) || []).length, 2);
  const related = html.match(/<section aria-label="Other Upcoming Events"[^>]*>(.*?)<\/section>/)?.[0] || "";
  const links = [...related.matchAll(/href="\/events\/(\d+)"/g)].map(match => Number(match[1]));
  const expected = getRelatedEvents(event, { events: getUpcomingEvents().filter(item => Number.isFinite(Date.parse(item.date))) }).filter(item => item.id !== 3);
  assert.deepEqual(links, expected.map(item => item.id));
  assert.ok(links.length > 0);
  assert.ok(links.every(id => id !== 6 && getEventById(id)));
  assert.match(related, /border-t border-white\/10/);
  assert.match(html, /href="\/events\/3"/, "Previous edition routing remains available");
});

test("Breakfast preserves repository event facts and never introduces host or sponsor sections", () => {
  assert.equal(event.id, 6);
  assert.equal(event.imageKey, "ibc-networking-breakfast-2027");
  assert.equal(event.image, "/uploads/Venue tiles/RAI.png");
  assert.equal(event.date, "2027-09-11");
  assert.equal(event.time, "08:00–10:00 CET");
  assert.equal(event.capacity_number, 120);
  assert.equal(event.venue, "The Traveller");
  assert.equal(event.location, "a one-minute walk from the main entrance of the RAI Amsterdam");
  assert.deepEqual(event.programme?.map(item => item.time), ["08:00", "08:30", "09:15", "10:00"]);
  assert.equal(event.startsAt, undefined);
  assert.equal(event.endsAt, undefined);
  assert.equal(event.timeZone, undefined);
  assert.doesNotMatch(render({ ...event, partners: [{ name: "Unconfirmed sponsor", logo: "/unconfirmed.png" }] }), /Unconfirmed sponsor|unconfirmed.png|Meet the Hosts|In Association With/);
});

test("Breakfast editorial copy and timed programme remain editable in existing CMS fields", () => {
  const html = render({ ...event, description: "Draft introduction", whoAttends: "Draft audience", programme: [{ time: "08:00", description: "DRAFT MORNING\n\nDraft breakfast copy" }], details: "Draft morning narrative", ctaCopy: "Draft invitation" });
  for (const copy of ["Draft introduction", "Draft audience", "DRAFT MORNING", "Draft breakfast copy", "Draft morning narrative", "Draft invitation", "08:00"]) assert.ok(html.includes(copy), copy);
  assert.match(render({ ...event, date: "2000-01-01" }), />Register interest<\/button>/);
  assert.doesNotMatch(render({ ...event, statusLabel: "Registration Closed" }), /<button/);
});

test("Breakfast SEO and Event JSON-LD retain the existing canonical, description and facts", () => {
  const seo = eventSeo(event);
  assert.equal(seo.description, "An informal IBC breakfast at The Traveller, a one-minute walk from the RAI Amsterdam entrance, on 11 September 2027. Attendance is curated.");
  const html = renderSeoHead(createSeoHead(seo, "/events/6"));
  const data = JSON.parse(html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/)?.[1] || "null")["@graph"].find((node: any) => node["@type"] === "Event");
  assert.equal(data.url, "https://www.mediacollective.events/events/6");
  assert.equal(data.startDate, "2027-09-11");
  assert.equal(data.maximumAttendeeCapacity, 120);
  assert.equal(data.location.name, `${event.venue} · ${event.location}`);
  assert.equal(data.name, event.title);
  assert.ok(html.includes('rel="canonical" href="https://www.mediacollective.events/events/6"'));
});

test("Decap events preview displays a Breakfast draft through the existing collection", () => {
  const draft = { ...content, events: content.events.map(item => item.id === 6 ? { ...item, summary: "Draft breakfast preview" } : item) };
  const html = renderToStaticMarkup(<EventsPreview entry={{ getIn: () => ({ toJS: () => draft }) }} />);
  assert.match(html, /Draft breakfast preview/);
  assert.match(html, /href="\/events\/6"/);
  assert.doesNotMatch(html, /role="alert"/);
});
