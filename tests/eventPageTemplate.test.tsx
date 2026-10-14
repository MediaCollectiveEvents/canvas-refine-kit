import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import EventPageTemplate from "../src/components/shared/EventPageTemplate";
import { getAllEvents, normalizeEvents } from "../src/lib/events";

const render = (event: ReturnType<typeof getAllEvents>[number]) => renderToStaticMarkup(createElement(EventPageTemplate, { event, onRequest: () => {} }));

test("confirmed practical information and editorial capacity appear before the first attendance action", () => {
  for (const event of getAllEvents().filter(event => event.capacity_number !== undefined)) {
    const html = render(event);
    const beforeAction = html.slice(0, html.indexOf('<button') >= 0 ? html.indexOf('<button') : html.indexOf('</header>'));
    assert.match(beforeAction, new RegExp(`Capacity: ${event.capacity_number} ${event.capacity_label!.toLowerCase()}`));
    assert.ok(beforeAction.includes(event.time || 'Time to be confirmed'));
    assert.ok(beforeAction.includes(event.venue));
    assert.match(beforeAction, event.partnerEvent ? /Paid tickets/ : /Free to attend/);
  }
});

test("capacity prefers the existing capacity field and does not invent absent values", () => {
  const event = normalizeEvents([{ id: 99, title: 'Future gathering', date: '2099-01-01', capacity: 50, capacity_number: 60 }])[0];
  assert.match(render(event), /Capacity: 50/);
  assert.doesNotMatch(render(event), /Capacity: 60/);
  assert.doesNotMatch(render({ ...event, capacity: undefined, capacity_number: undefined }), /Capacity:/);
});

test("all migrated events share the section hierarchy and retain artwork without countdowns", () => {
  for (const event of getAllEvents()) {
    const html = render(event);
    const titles = ['About This Event', 'Who Attends', 'Why Attend', 'What To Expect', 'Event Details'];
    let previous = -1;
    for (const title of titles) { const position = html.indexOf('>'+title+'</h2>'); assert.ok(position > previous, title); previous = position; }
    assert.match(html, /object-contain/);
    assert.doesNotMatch(html, /days to go|Days Remaining|countdown/i);
    if (!event.partnerEvent) assert.match(html, /Free to attend\. Places are limited and invitations are carefully curated\./);
  }
});

test("a future CMS-only event supports programme, partners, artwork, copy and registration overrides", () => {
  const event = normalizeEvents([{ id: 99, title: 'Future gathering', date: '2099-01-01', image: '/uploads/custom.png',
    description: 'One paragraph.\n\nAnother paragraph.', whoAttends: 'Media professionals.', whyAttend: ['Exchange perspectives'], whatToExpect: ['Conversation'],
    programme: [{ time: '09:00', description: 'Arrival' }, { description: '' }],
    partners: [{ name: 'Confirmed partner', logo: '/uploads/partner.png', url: 'https://example.com' }],
    attendanceStatement: 'Custom attendance.', ctaHeading: 'Join us', ctaCopy: 'Custom copy.', registrationLink: 'https://example.com/invite'
  }])[0];
  const html = render(event);
  assert.match(html, /src="\/uploads\/custom.png"/);
  assert.match(html, /<p>One paragraph\.<\/p><p>Another paragraph\.<\/p>/);
  assert.match(html, />Programme<\/h2>/);
  assert.match(html, />In Association With<\/h2>/);
  assert.match(html, /Arrival/);
  assert.match(html, /href="https:\/\/example.com\/invite"/);
  assert.equal(event.ctaHeading, "Join us");
  assert.match(html, />Want to join us\?<\/h2>/);
  assert.match(html, /Custom attendance/);
  assert.equal(event.programme?.length, 1);
});

test("empty optional sections stay hidden; unsafe URLs and malformed CMS arrays are discarded", () => {
  const event = normalizeEvents([{ id: 99, title: 'Future gathering', date: '2099-01-01',
    programme: [{ time: '09:00' }], partners: [{ logo: '/uploads/logo.png' }], whyAttend: [null, 5, ''],
    registrationLink: 'javascript:alert(1)', image: '//untrusted.example/image.png'
  }])[0];
  const html = render(event);
  assert.doesNotMatch(html, />Programme<\/h2>|>In Association With<\/h2>|javascript:|untrusted/);
  assert.match(html, /Time to be confirmed/);
  assert.equal(event.registrationLink, '');
});

test("past events and closed registration never invite visitors to a finished or closed event", () => {
  const past = normalizeEvents([{ id: 99, date: '2000-01-01', registrationLink: 'https://example.com/register' }])[0];
  assert.match(render(past), /Register interest/);
  assert.doesNotMatch(render(past), /href="https:\/\/example.com\/register"/);
  const closed = normalizeEvents([{ id: 99, date: '2099-01-01', statusLabel: 'Registration Closed' }])[0];
  assert.match(render(closed), /Registration closed/);
  assert.doesNotMatch(render(closed), /<button/);
});


test("partner travel pages never use free attendance or the Media Collective invitation action", () => {
  const partner = getAllEvents().find(event => event.id === 8)!;
  const html = render(partner);
  assert.match(html, /Partner Event/);
  assert.match(html, /Paid tickets/);
  assert.match(html, />Departure<\/dt>/);
  assert.match(html, /St Pancras International, London/);
  assert.match(html, />Journey Time<\/dt>/);
  assert.doesNotMatch(html, /Free to attend|invitation|Request an Invitation|invitation-only/i);
  assert.match(html, /Organiser: Greenline/);
  assert.match(html, /Tickets are managed by Greenline/);
  assert.doesNotMatch(html, /<button|Register Interest|Organiser registration link to be confirmed/);
  assert.equal(partner.registrationLink, '');
  const linked = render({ ...partner, registrationLink: 'https://example.com/organiser-interest' });
  assert.match(linked, /href="https:\/\/example.com\/organiser-interest"/);
  assert.match(linked, />Register Interest<\/a>/);
  assert.doesNotMatch(linked, /Organiser registration link to be confirmed/);
});
