import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { getPageSeo } from "../src/lib/pageSeo";
import ContextualText from "../src/components/shared/ContextualText";
import FAQSection from "../src/components/sections/FAQSection";
import Partners from "../src/pages/Partners";
import EventDetails from "../src/pages/EventDetails";
import faq from "../src/content/faq.json";
import community from "../src/content/community.json";

const metadata: Record<string, { title?: string; description: string }> = {
  "/": { title: "Media & Broadcast Events — The Media Collective", description: "Curated events for people working across broadcasting, streaming and media technology. Explore the programme and request an invitation." },
  "/events": { title: "Upcoming Media & Broadcast Events — The Media Collective", description: "Browse upcoming discussions, breakfasts, receptions and social events, plus independent partner events. Find dates, locations and attendance details." },
  "/community": { title: "Media & Technology Community — The Media Collective", description: "See who attends Media Collective events, from broadcasters and studios to streaming and technology businesses, and how invitations work." },
  "/partners": { title: "Event Partnerships — The Media Collective", description: "Explore ways to support Media Collective events, build your presence and contribute to discussion-led programmes where the format allows." },
  "/faq": { title: "Event FAQs — The Media Collective", description: "Answers about invitations, attendance, event costs, partnerships and how guest contact details are used at The Media Collective." },
  "/events/1": { title: "Post-NAB Review Breakfast 2026 — The Media Collective", description: "A post-NAB breakfast at The Broadcaster, London, on 6 May 2026, with Caretta Research market intelligence and discussion of strategy and operating challenges." },
  "/events/2": { description: "The Media Collective’s MPTS after-show reception at The Hand & Flower, London, on 13 May 2026, with drinks, canapés and refreshments." },
  "/events/4": { description: "An invitation-only forum exploring media technology, business models and strategy at The Broadcaster, London, on 24 November 2026." },
  "/events/5": { description: "A reception for media and technology professionals attending MPTS in London on 12 May 2027. Attendance is curated and places are limited." },
  "/events/6": { description: "An informal IBC breakfast at The Traveller, a one-minute walk from the RAI Amsterdam entrance, on 11 September 2027. Attendance is curated." },
  "/events/7": { description: "An IBC social evening with live jazz, drinks and canapés at Live Amsterdam Piano Bar on 12 September 2027, featuring LDN2BTN and the IBC Allstars." },
};

test("approved content SEO titles and summaries resolve without replacing hero copy", () => {
  for (const [path, expected] of Object.entries(metadata)) {
    const actual = getPageSeo(path);
    assert.equal(actual.description, expected.description, path);
    if (expected.title) assert.equal(actual.title, expected.title, path);
  }
  assert.equal(getPageSeo("/privacy-policy").description, "How The Media Collective collects, uses and protects personal data, and how to contact us about your privacy.");
  assert.equal(getPageSeo("/events/3").description, "An informal networking breakfast for media, broadcast and entertainment professionals at The Traveller, Amsterdam.");
  assert.equal(getPageSeo("/events/8").description, "Travel from London to Amsterdam for IBC in a dedicated Eurostar carriage with fellow attendees. An independent, paid-ticket event organised by Greenline.");
});

function renderPage(path: string, node: React.ReactNode) {
  return renderToStaticMarkup(<HelmetProvider><MemoryRouter initialEntries={[path]}>{node}</MemoryRouter></HelmetProvider>);
}

test("Partners programme names link to their own events and audience wording links to Community", () => {
  const html = renderPage("/partners", <Partners />);
  for (const [id, title] of [[4, "OFF AIR"], [5, "MPTS Networking Reception"], [6, "IBC Networking Breakfast"], [7, "IBC Decompression Party"], [8, "The Green Line"]]) {
    assert.match(html, new RegExp(`<h3[^>]*><a href="/events/${id}"[^>]*>${title}</a></h3>`));
  }
  assert.match(html, /<a href="\/community"[^>]*>our community<\/a>/);
});

test("FAQ and Community guidance expose contextual links without changing the answers", () => {
  const main = renderToStaticMarkup(<FAQSection faqs={faq} />);
  for (const [href, label] of [["/events/8", "The Green Line"], ["/privacy-policy", "Privacy Policy"], ["/events", "request an invitation"], ["/partners", "partnership idea"]]) {
    assert.ok(main.includes(`href="${href}"`));
    assert.ok(main.includes(`>${label}</a>`));
  }
  const items = community.sections.find(section => section.type === "faq")!.faqs!;
  const communityHtml = renderToStaticMarkup(<FAQSection faqs={items} />);
  assert.match(communityHtml, /<a href="\/events"[^>]*>event page<\/a>/);
  assert.match(communityHtml, /<a href="\/partners"[^>]*>partners<\/a>/);
  const plain = (value: string) => value.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
  for (const item of [...faq, ...items]) {
    const original = item.answer.split(/\n\s*\n/);
    for (const paragraph of original) assert.ok(plain(main + communityHtml).includes(paragraph));
  }
});

test("edition navigation identifies both next and previous editions without duplicate related links", () => {
  for (const [id, target, label] of [[2, 5, "Next edition"], [3, 6, "Next edition"], [5, 2, "Previous edition"], [6, 3, "Previous edition"]]) {
    const html = renderPage(`/events/${id}`, <Routes><Route path="/events/:id" element={<EventDetails />} /></Routes>);
    const editions = html.match(/<nav aria-label="Event editions"[^>]*>(.*?)<\/nav>/)?.[1];
    assert.ok(editions?.includes(`href="/events/${target}"`));
    assert.ok(editions?.includes(`${label}:`));
    assert.equal((html.match(new RegExp(`href="/events/${target}"`, "g")) || []).length, 1);
  }
  for (const id of [1, 4, 7, 8]) {
    const html = renderPage(`/events/${id}`, <Routes><Route path="/events/:id" element={<EventDetails />} /></Routes>);
    assert.doesNotMatch(html, /aria-label="Event editions"/);
  }
});

test("contextual linking keeps CMS text escaped and leaves unrelated text untouched", () => {
  const text = '<img src=x onerror="alert(1)"> Privacy Policy';
  const html = renderToStaticMarkup(<ContextualText text={text} links={[{ text: "Privacy Policy", href: "/privacy-policy" }]} />);
  assert.doesNotMatch(html, /<img/);
  assert.match(html, /&lt;img/);
  assert.match(html, /href="\/privacy-policy"/);
  assert.equal(renderToStaticMarkup(<ContextualText text="Unrelated copy." links={[{ text: "Privacy Policy", href: "/privacy-policy" }]} />), "Unrelated copy.");
});
