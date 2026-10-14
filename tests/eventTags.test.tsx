import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { MemoryRouter } from "react-router-dom";
import { renderToStaticMarkup } from "react-dom/server";
import { getAllEvents, getEventById, normalizeEvents, normalizeEventFormatTags, normalizeEventConferenceTags, normalizeEventThemeTags } from "../src/lib/events";
import { getEventTags } from "../src/lib/eventTags";
import EventTags from "../src/components/shared/EventTags";
import EventsListing from "../src/components/sections/EventsListing";

test("approved event tags keep explicit formats and reviewed conference alignment separate", () => {
  const expected: Record<number, string[]> = {
    4: ["networking", "industry-forum", "discussion"],
    5: ["networking", "reception", "MPTS"],
    8: ["networking", "social", "journey", "IBC"],
    6: ["networking", "breakfast", "IBC"],
    7: ["networking", "social", "drinks", "IBC"],
  };
  for (const [id, tags] of Object.entries(expected)) assert.deepEqual(getEventTags(getEventById(Number(id))!), tags);
  for (const event of getAllEvents()) assert.equal(getEventTags(event)[0], "networking");
  assert.deepEqual(getEventTags({ ...getEventById(4)!, id: 999, title: "IBC breakfast", conferenceAlignment: [] }), ["networking", "industry-forum", "discussion"]);
});

test("format tags reject unsupported values and duplicates without changing categories", () => {
  assert.deepEqual(normalizeEventFormatTags(["social", "social", "roundtable", "IBC", 12]), ["networking", "social"]);
  assert.deepEqual(normalizeEventFormatTags("breakfast"), ["networking"]);
  const original = getEventById(5)!;
  const normalized = normalizeEvents([{ ...original, formatTags: ["reception", "unknown", "reception"] }])[0];
  assert.deepEqual(normalized.formatTags, ["networking", "reception"]);
  assert.deepEqual(normalized.experienceCategories, original.experienceCategories);
  assert.deepEqual(normalizeEvents([{ id: 999 }])[0].formatTags, ["networking"]);
  assert.deepEqual(normalizeEventConferenceTags(["IBC", "IBC", "ibc", "unknown"]), ["IBC"]);
  assert.deepEqual(normalizeEventThemeTags(["Streaming", "Streaming", "roundtable", "AI"]), ["Streaming", "AI"]);
});

test("event tags are informational metadata in shared and listing renderers", () => {
  const event = getEventById(6)!;
  const labels = renderToStaticMarkup(createElement(EventTags, { event }));
  assert.match(labels, /aria-label="Event tags"/);
  assert.match(labels, /networking/);
  assert.match(labels, /breakfast/);
  assert.match(labels, /IBC/);
  assert.doesNotMatch(labels, /<button|<a /);
  const listing = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: ["/events"] }, createElement(EventsListing, { content: { events: [event] } })));
  assert.match(listing, /aria-label="Event tags"/);
  assert.match(listing, /breakfast/);
});

test("only explicit programme themes are displayed, separately from event formats", () => {
  const event = getEventById(4)!;
  for (const current of getAllEvents()) assert.deepEqual(current.themeTags, []);
  const html = renderToStaticMarkup(createElement(EventTags, { event: { ...event, themeTags: ["Streaming", "Broadcast", "Content"] } }));
  assert.match(html, /aria-label="Event themes"/);
  assert.match(html, /Streaming/);
  assert.doesNotMatch(html, /Live sports|Infrastructure|Production|Monetisation/);
  const noTopics = renderToStaticMarkup(createElement(EventTags, { event: { ...event, themeTags: [], title: "AI and Live sports" } }));
  assert.doesNotMatch(noTopics, /aria-label="Event themes"/);
});
