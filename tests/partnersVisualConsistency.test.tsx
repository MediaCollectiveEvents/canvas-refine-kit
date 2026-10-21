import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PreviewProviders } from "../src/cms/previews/PreviewLayout";
import Partners from "../src/pages/Partners";
import OurEventsSection from "../src/components/sections/OurEventsSection";
import AuthorityStrip from "../src/components/sections/AuthorityStrip";
import partners from "../src/content/partners.json";

const renderPartners = () => renderToStaticMarkup(<PreviewProviders route="/partners"><Partners /></PreviewProviders>);

test("editorial event heading falls back to the label without empty headings", () => {
  const html = renderToStaticMarkup(<OurEventsSection presentation="editorial" section={{ eyebrow: "OUR EVENTS", heading: " ", body: "Programme introduction" }} />);
  assert.match(html, /<h2[^>]*>OUR EVENTS<\/h2>/);
  assert.doesNotMatch(html, /<h2[^>]*>\s*<\/h2>/);
  assert.match(html, /max-w-\[65ch\]/);
});

test("empty authority strips disappear and populated editorial feedback survives", () => {
  assert.equal(renderToStaticMarkup(<AuthorityStrip section={{ heading: " ", body: "\n" }} />), "");
  const html = renderPartners();
  const feedback = partners.sections.find(section => section.id === "Partner quote")!;
  assert.match(html, /PARTNER FEEDBACK/);
  assert.ok(html.includes(feedback.body!.trim().replaceAll("'", "&#x27;")));
  assert.ok(html.indexOf('id="Partner quote"') < html.indexOf('id="partner-conversation"'));
  const ids = partners.sections.filter(section => !section.hidden).map(section => section.id);
  assert.equal(ids[ids.indexOf("benefits") + 1], "partner-authority");
  assert.match(html, /AT A GLANCE/);
});

test("CTA correction preserves action, destination and approved typography", () => {
  const html = renderPartners();
  const cta = partners.sections.find(section => section.id === "cta")!;
  assert.equal(cta.heading, "Connect your brand with leaders across media and technology.");
  assert.equal(cta.cta!.label, "Arrange a Call");
  assert.equal(cta.cta!.url, "https://calendly.com/mediacollective/call-with-chris");
  assert.match(html, /!text-\[25\.6px\]/);
  assert.match(html, /h-\[7\.8rem\] w-\[14\.3rem\]/);
  assert.match(html, /id="partner-community"[^>]*site-section-compact/);
});
