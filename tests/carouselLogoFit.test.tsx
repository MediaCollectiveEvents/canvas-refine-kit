import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, readdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { PreviewProviders } from "../src/cms/previews/PreviewLayout";
import PartnersPageRenderer from "../src/components/sections/PartnersPageRenderer";
import { getOrganisations } from "../src/lib/organisations";

const logos = getOrganisations();
const html = renderToStaticMarkup(<PreviewProviders route="/partners"><PartnersPageRenderer sections={[{type:"partnersLogos"}]} onRegister={() => {}} /></PreviewProviders>);

test("carousel preserves CMS logo order, complete artwork containment and rounded tiles", () => {
  assert.equal(logos.length, 29);
  assert.equal(logos.find(logo => logo.name === "Caretta Research")?.src, "/uploads/caretta-research-logo.svg");
  assert.equal(logos.find(logo => logo.name === "RSG Media")?.src, "/uploads/rsg-media-logo.png");
  assert.equal((html.match(/object-contain/g) || []).length, logos.length * 2);
  assert.doesNotMatch(html, /transform:scale|object-cover/);
  assert.match(html, /max-w-full object-contain/);
  assert.match(html, /overflow-hidden rounded-2xl/);
  let position = -1;
  for (const logo of logos) {
    const next = html.indexOf(`alt="${(logo.alt || logo.name).replaceAll('&','&amp;')}"`);
    assert.ok(next > position, logo.name);
    position = next;
  }
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /aria-keyshortcuts="Space"/);
  assert.match(html, /animation-duration:53.333333s/);
  assert.match(html, /motion-reduce:animate-none/);
});

test("all usable sponsor files are listed and the cropped source remains available for replacement", () => {
  const folder = new URL('../src/assets/sponsors/', import.meta.url);
  const registered = logos.filter(logo => logo.src.startsWith("/src/assets/sponsors/")).map(logo => decodeURIComponent(logo.src.split('/').at(-1)!)).sort();
  const available = readdirSync(folder).filter(name => /\.(png|jpe?g|svg|webp|avif)$/i.test(name)).sort();
  assert.deepEqual([...registered, "Caretta research logo.jpeg", "rsg-media.png"].sort(), available);
  assert.match(readFileSync(new URL("../public/uploads/caretta-research-logo.svg", import.meta.url), "utf8"), /viewBox="0 0 1174 305"/);
  for (const name of available) assert.ok(readFileSync(new URL(name, folder)).length > 0);
});
