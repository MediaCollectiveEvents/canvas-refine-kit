import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PreviewProviders } from "../src/cms/previews/PreviewLayout";
import Partners from "../src/pages/Partners";
import OurEventsSection from "../src/components/sections/OurEventsSection";
import AuthorityStrip from "../src/components/sections/AuthorityStrip";
import homepage from "../src/content/homepage.json";
import partners from "../src/content/partners.json";

const renderPartners = () => renderToStaticMarkup(<PreviewProviders route="/partners"><Partners /></PreviewProviders>);

test("editorial event heading falls back to the label without empty headings", () => {
  const html = renderToStaticMarkup(<OurEventsSection presentation="editorial" section={{ eyebrow: "OUR EVENTS", heading: " ", body: "Programme introduction" }} />);
  assert.match(html, /<h2[^>]*>OUR EVENTS<\/h2>/);
  assert.doesNotMatch(html, /<h2[^>]*>\s*<\/h2>/);
  assert.match(html, /max-w-\[65ch\]/);
});

test("empty authority strips disappear and shared Home testimonials replace the single quote", () => {
  assert.equal(renderToStaticMarkup(<AuthorityStrip section={{ heading: " ", body: "\n" }} />), "");
  const html = renderPartners();
  const shared = homepage.sections.find(section => section.type === "testimonials")!;
  assert.match(html, /role="region" aria-label="Testimonials"/);
  assert.ok(html.replace(/<[^>]*>/g, "").includes(shared.heading!));
  for (const item of shared.items!) {
    assert.ok(html.includes(item.name!), item.name);
    for (const sentence of item.quote!.split("\n").map(line => line.trim()).filter(Boolean)) {
      assert.ok(html.includes(sentence.replaceAll("'", "&#x27;").replaceAll("&", "&amp;").replaceAll("&amp;#x27;", "&#x27;")), sentence);
    }
  }
  assert.equal((html.match(/aria-label="Show testimonial /g) ?? []).length, shared.items!.length);
  assert.doesNotMatch(html, /PARTNER FEEDBACK/);
  assert.equal(partners.sections.find(section => section.id === "Partner quote")!.type, "testimonials");
  assert.ok(html.indexOf('id="Partner quote"') < html.indexOf('id="partner-conversation"'));
  const ids = partners.sections.map(section => section.id);
  assert.equal(ids[ids.indexOf("benefits") + 1], "partner-authority");
  const authority = partners.sections.find(section => section.id === "partner-authority")!;
  if (authority.hidden) assert.doesNotMatch(html, /AT A GLANCE/);
  else assert.match(html, /AT A GLANCE/);
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
