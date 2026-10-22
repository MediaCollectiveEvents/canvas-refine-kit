import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import WhoAttendsSection from "../src/components/sections/WhoAttendsSection";
import Community from "../src/pages/Community";
import { PreviewProviders } from "../src/cms/previews/PreviewLayout";
import homepage from "../src/content/homepage.json";

const section = homepage.sections.find(item => item.type === "whoAttends")!;
const home = renderToStaticMarkup(<WhoAttendsSection section={{ ...section, highlights: section.highlights.slice(0, 3).map(item => ({ ...item, title: `THE ${item.title.match(/\d+/)?.[0]}` })) }} />);
const currentHome = renderToStaticMarkup(<WhoAttendsSection section={section} />);

test("Home retains the deliberately different numeral sizes, baseline strut and THE prefixes", () => {
  for (const sizes of ['text-[46px] md:text-[66px]', 'text-[56px] md:text-[74px]', 'text-[66px] md:text-[88px]']) assert.ok(home.includes(sizes));
  assert.equal((home.match(/>THE<\/span>/g) || []).length, 3);
  assert.equal((home.match(/data-audience-numeral/g) || []).length, 3);
  assert.match(home, /h-20 items-end/);
  assert.match(home, /w-0 text-\[76px\] leading-none md:text-\[104px\]/);
  assert.match(home, /-translate-y-\[0\.62em\]/);
});

test("Home uses equal-width desktop columns and compact mobile label rows without oversized captions", () => {
  assert.match(home, /mt-8 grid md:grid-cols-3/);
  assert.match(currentHome, /mt-8 grid md:grid-cols-2 xl:grid-cols-4/);
  for (const item of section.highlights) assert.ok(currentHome.includes(`aria-label="${item.title}"`));
  assert.match(home, /grid-cols-\[112px_minmax\(0,1fr\)\]/);
  assert.match(home, /md:first:border-l-0/);
  assert.match(home, /font-body text-base font-medium/);
  assert.match(home, /md:mt-3 md:text-xl/);
  assert.doesNotMatch(home, /min-h-\[2\.6em\]|site-section-compact/);
});

test("Community reduces its figures, matches label typography and keeps snapshot content intact", () => {
  const html = renderToStaticMarkup(<PreviewProviders route="/community"><Community /></PreviewProviders>);
  const start = html.indexOf('id="community-audience-snapshot"');
  const snapshot = html.slice(start, html.indexOf('</section>', start));
  assert.equal((snapshot.match(/text-\[48px\]/g) || []).length, 3);
  assert.equal((snapshot.match(/md:text-\[64px\]/g) || []).length, 3);
  assert.match(snapshot, /grid-cols-\[112px_minmax\(0,1fr\)\]/);
  assert.match(snapshot, /mt-6 max-w-3xl font-body text-sm/);
  assert.doesNotMatch(snapshot, /text-8xl|text-6xl|site-section-compact/);
  for (const value of ['75', '321', '661', 'C-suite guests', 'senior leaders*', 'guests across 6 events']) assert.ok(snapshot.includes(value));
});
