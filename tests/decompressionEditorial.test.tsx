import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import EventPageTemplate from "../src/components/shared/EventPageTemplate";
import { getEventById } from "../src/lib/events";

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
