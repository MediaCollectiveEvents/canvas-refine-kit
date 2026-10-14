import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EventDetails from "../src/pages/EventDetails";
import NotFound from "../src/pages/NotFound";
import { getEventById, getRelatedEvents, getUpcomingEvents, isPastEvent } from "../src/lib/events";

function renderPage(path: string, date = "2026-10-13T12:00:00Z") {
  const OriginalDate = globalThis.Date;
  class FixedDate extends OriginalDate {
    constructor(value?: string | number | Date) { super(value === undefined ? date : value); }
    static now() { return new OriginalDate(date).getTime(); }
  }
  globalThis.Date = FixedDate as DateConstructor;
  try {
    return renderToStaticMarkup(createElement(HelmetProvider, null,
      createElement(MemoryRouter, { initialEntries: [path] },
        createElement(Routes, null,
          createElement(Route, { path: "/events/:id", element: createElement(EventDetails) }),
          createElement(Route, { path: "*", element: createElement(NotFound) })))));
  } finally { globalThis.Date = OriginalDate; }
}

test("OFF AIR filters upcoming candidates before relevance limiting", () => {
  const now = new Date("2026-10-13T12:00:00Z");
  const event = getEventById(4)!;
  assert.deepEqual(getRelatedEvents(event).filter(candidate => !isPastEvent(candidate, now)), []);
  const related = getRelatedEvents(event, { events: getUpcomingEvents(undefined, undefined, now) });
  assert.deepEqual(related.map(candidate => candidate.id), [5, 8]);
  assert.ok(related.every(candidate => candidate.id !== event.id && !isPastEvent(candidate, now)));
  const html = renderPage("/events/4");
  assert.match(html, /aria-label="Related events"/);
  assert.match(html, /href="\/events\/5"/);
  assert.match(html, /href="\/events\/8"/);
  assert.doesNotMatch(html, /href="\/events\/[123]"|Browse all events/);
});

test("Green Line preserves ranking among eligible future events", () => {
  const html = renderPage("/events/8");
  assert.match(html, /href="\/events\/6"/);
  assert.match(html, /href="\/events\/5"/);
  assert.doesNotMatch(html, /href="\/events\/[123]"|Browse all events/);
});

test("browse fallback appears only when no eligible related events remain", () => {
  const html = renderPage("/events/4", "2099-01-01T12:00:00Z");
  assert.match(html, /href="\/events"[^>]*>Browse all events/);
  assert.doesNotMatch(html, /aria-label="Related events"/);
});

for (const path of ["/missing-page", "/events/unresolved-secret-id"]) {
  test(`${path} has branded navigation, recovery links and no attendance CTA`, () => {
    const html = renderPage(path);
    assert.match(html, /Contact Us/i);
    assert.match(html, /site-container/);
    assert.match(html, /href="\/"/);
    assert.match(html, /href="\/events"/);
    assert.match(html, /<footer/);
    assert.doesNotMatch(html, /Want to attend|Request an invitation|unresolved-secret-id/);
  });
}
