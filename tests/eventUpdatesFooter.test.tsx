import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import Footer from "../src/components/layout/Footer";
const render = (path: string, hideAttendanceCTA = true) => renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [path] }, createElement(Footer, { hideAttendanceCTA })));

test("footer exposes a native event-updates button and retains cookie and privacy controls", () => {
  const html = render("/");
  assert.match(html, /<button[^>]*>Be the first to hear about new events<\/button>/);
  assert.match(html, /Cookie settings/);
  assert.match(html, /href="\/privacy-policy"/);
});
test("administrative pages do not acquire a public subscription or invitation flow", () => {
  const html = render("/admin", false);
  assert.doesNotMatch(html, /Be the first to hear|Request an invitation/);
});
test("invitation and event-updates actions remain separate on public pages", () => {
  const html = render("/", false);
  assert.match(html, /Request an invitation/);
  assert.match(html, /Be the first to hear about new events/);
});
