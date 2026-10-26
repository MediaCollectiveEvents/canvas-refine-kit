import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EventDetails from "../src/pages/EventDetails";
import EventPageTemplate from "../src/components/shared/EventPageTemplate";
import { getEventById } from "../src/lib/events";

const event = getEventById(5)!;
const render = (value = event) => renderToStaticMarkup(<EventPageTemplate event={value} onRequest={() => {}} />);

test("MPTS renders the editorial sections in order through to the shared closing CTA", () => {
  const html = renderToStaticMarkup(<HelmetProvider><MemoryRouter initialEntries={["/events/5"]}><Routes><Route path="/events/:id" element={<EventDetails />} /></Routes></MemoryRouter></HelmetProvider>);
  let previous = html.indexOf("<h1");
  for (const title of ["After the Show", "Who Attends", "The Evening", "Why Attend", "From Show Floor to First Floor", "Event Details", "Other Upcoming Events", "Join us after Day One of MPTS."]) {
    const position = html.indexOf(`>${title}</h2>`);
    assert.ok(position > previous, title);
    previous = position;
  }
  assert.doesNotMatch(html, /About This Event|What To Expect|Meet the Hosts|In Association With/);
  assert.match(html, /md:grid-cols-\[minmax\(0,1fr\)_minmax\(0,2fr\)\]/);
  assert.equal((html.match(/>Request an Invitation<\/button>/g) || []).length, 2);
});

test("MPTS retains its existing identity, image, date and confirmed hospitality without inventing a 2027 time", () => {
  assert.equal(event.id, 5);
  assert.equal(event.imageKey, "mpts-networking-reception-2027");
  assert.equal(event.image, "/uploads/Venue tiles/Handandflower.png");
  assert.equal(event.date, "2027-05-12");
  assert.equal(event.time, "");
  assert.equal(event.startsAt, undefined);
  assert.equal(event.endsAt, undefined);
  const html = render();
  for (const copy of ["Day One of MPTS", "complimentary Prosecco", "canapés and refreshments", "private first-floor bar", "one-minute walk", "Time to be confirmed"]) assert.ok(html.includes(copy), copy);
  assert.deepEqual(event.partners, []);
  assert.doesNotMatch(render({ ...event, partners: [{ name: "Unconfirmed sponsor", logo: "/unconfirmed.png" }] }), /Unconfirmed sponsor|unconfirmed.png/);
});

test("MPTS editorial content remains editable through existing CMS fields", () => {
  const html = render({ ...event, description: "Draft introduction", whoAttends: "Draft audience", programme: [{ description: "DRAFT RECEPTION\n\nDraft hospitality" }], details: "Draft venue copy", ctaCopy: "Draft invitation" });
  for (const copy of ["Draft introduction", "Draft audience", "DRAFT RECEPTION", "Draft hospitality", "Draft venue copy", "Draft invitation"]) assert.ok(html.includes(copy), copy);
});
