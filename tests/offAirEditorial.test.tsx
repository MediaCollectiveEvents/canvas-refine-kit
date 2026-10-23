import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import EventPageTemplate from "../src/components/shared/EventPageTemplate";
import { getAllEvents, getEventById } from "../src/lib/events";
import { getOffAirUpcomingEvents } from "../src/lib/offAirEditorial";

const event = getEventById(4)!;
const render = (value = event) => renderToStaticMarkup(createElement(EventPageTemplate, { event: value, onRequest() {} }));

test("OFF AIR has the requested editorial hierarchy, programme and host profiles", () => {
  const html = render();
  let previous = -1;
  for (const title of ["About OFF AIR", "Who Attends", "The Programme", "Why Attend", "The Conversation Continues", "Meet the Hosts", "Event Details"]) {
    const position = html.indexOf(`>${title}</h2>`);
    assert.ok(position > previous, title);
    previous = position;
  }
  for (const title of ["THE DEBRIEF", "THE SURVIVAL GUIDE", "UNFILTERED: ASK THE ANALYSTS", "FAULTLINE FUTURES", "DECODETV IMPACT AWARDS", "The Media Collective", "Faultline", "decodeTV"]) {
    assert.match(html, new RegExp(`>${title}</h3>`));
  }
  assert.match(html, /lg:grid-cols-3/);
  assert.match(html, /sm:grid-cols-2/);
  assert.match(html, /Capacity: 120 attendees/);
  assert.match(html, /Attendance by invitation/);
  assert.match(html, /href="https:\/\/rethinkresearch.biz"/);
  assert.match(html, /href="https:\/\/decodetv.com"/);
  assert.equal((html.match(/>Request an Invitation<\/button>/g) || []).length, 2);
  assert.match(html, />Request an Invitation<\/h2>/);
  assert.match(html, /Interested in attending OFF AIR\?/);
  assert.doesNotMatch(html, /In Association With|What To Expect|Want to join us/);
});

test("OFF AIR content fields remain editable and host association records remain authoritative", () => {
  const html = render({ ...event, description: "Draft introduction", programme: [{ description: "DRAFT SESSION\n\nDraft session copy" }], partners: [{name: "Future host", url: "https://example.com"}] });
  assert.match(html, /Draft introduction/);
  assert.match(html, />DRAFT SESSION<\/h3>/);
  assert.match(html, /Draft session copy/);
  assert.match(html, />Future host<\/h3>/);
  assert.doesNotMatch(html, />Faultline<\/h3>/);
});

test("OFF AIR recommendations resolve the three existing canonical upcoming editions", () => {
  const events = getOffAirUpcomingEvents();
  assert.deepEqual(events.map(item => item.id), [5, 8, 6]);
  for (const item of events) assert.ok(getAllEvents().some(existing => existing.id === item.id && existing.title === item.title));
});

test("other events keep the shared listing layout and past/closed OFF AIR keeps safe registration behaviour", () => {
  assert.match(render(getEventById(5)!), />About This Event<\/h2>/);
  assert.doesNotMatch(render(getEventById(5)!), /Meet the Hosts/);
  assert.match(render({ ...event, date: "2000-01-01" }), />Register interest<\/button>/);
  assert.doesNotMatch(render({ ...event, statusLabel: "Registration Closed" }), /<button/);
});
