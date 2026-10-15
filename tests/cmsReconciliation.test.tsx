import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import yaml from "js-yaml";
import { resolveHref } from "../src/components/layout/Header";
import settings from "../src/content/settings.json";
import savedFaqs from "../src/content/faq.json";
import FaqAnswersPreview from "../src/cms/previews/FaqAnswersPreview";
import { FAQ_FILE, readFaqForEditor, registerFaqRootArrayAdapter, writeFaqFromEditor } from "../src/cms/faqRootArray";

const config = yaml.load(readFileSync("public/admin/config.yml", "utf8")) as any;
const file = (collection: string) => config.collections.find((item: any) => item.name === collection).files[0];
const field = (fields: any[], name: string) => fields.find(item => item.name === name);

// Exercise the serializer and backend registry actually shipped in Decap 3.0,
// without starting its UI or making a network request. These module IDs belong
// to the pinned vendor bundle; an upgrade must revalidate this integration.
function decapModules() {
  const vendor = readFileSync("public/admin/vendor/decap-cms.js", "utf8");
  const start = vendor.indexOf("var __webpack_modules__=");
  const end = vendor.lastIndexOf("var __webpack_exports__={};return");
  assert.ok(start >= 0 && end > start, "Decap runtime boundary changed; review adapter compatibility");
  return new Function(vendor.slice(start, end) + "return __webpack_require__;")();
}

test("CMS URL overrides legacy href; current navigation output is preserved", () => {
  assert.deepEqual(settings.nav.map(resolveHref), ["/", "/events", "/community", "/partners"]);
  assert.equal(resolveHref({ label: "Community", type: "community", href: "/community", url: "/partners" }), "/partners");
  assert.equal(resolveHref({ label: "Legacy", href: "/community", url: "" }), "/community");
  assert.equal(resolveHref({ label: "Events", type: "events" }), "/events");
});

test("FAQ save/reload stays a root array through Decap's actual JSON formatter", () => {
  const require = decapModules();
  const formatter = require(93223).default;
  const { fromJS } = require(46670);
  const { serializeValues } = require(33188);
  const faqFile = config.collections.find((item: any) => item.name === "faqPage").files.find((item: any) => item.name === "faqAnswers");
  const draft = formatter.fromFile(readFaqForEditor(JSON.stringify(savedFaqs)));
  assert.deepEqual(draft.faqs, savedFaqs);
  draft.faqs[0].answer = "A draft answer.\n\nWith a second paragraph.";
  draft.faqs[0].retainedExtra = "Preserve unknown record keys";
  const serialized = serializeValues(fromJS(draft), fromJS(faqFile.fields)).toJS();
  const raw = writeFaqFromEditor(formatter.toFile(serialized));
  assert.ok(raw.trimStart().startsWith("["));
  assert.deepEqual(JSON.parse(raw), draft.faqs);
  assert.deepEqual(formatter.fromFile(readFaqForEditor(raw)), draft);
  assert.ok(!Object.hasOwn(JSON.parse(raw), "items"));
});

test("FAQ adapter refuses wrong roots or malformed records", () => {
  for (const value of [{ items: savedFaqs }, { faqs: savedFaqs }, [null], [{ question: "Missing answer" }]]) {
    assert.throws(() => readFaqForEditor(JSON.stringify(value)));
  }
  for (const value of [savedFaqs, { items: savedFaqs }, { faqs: savedFaqs, unexpected: true }, { faqs: [{ answer: 3 }] }]) {
    assert.throws(() => writeFaqFromEditor(JSON.stringify(value)));
  }
  assert.equal(writeFaqFromEditor('{"faqs":[]}'), "[]\n");
});

test("real Decap backend factories adapt FAQ reads and writes only, including local proxy", async () => {
  const require = decapModules();
  const cms = require(41891).default;
  const otherRaw = '{"hero":{"theme":"dark"},"unconfigured":"retained"}';
  let persisted: any;
  class Backend {
    identity = "existing backend";
    async getEntry(path: string) { return { file: { path }, data: path === FAQ_FILE ? JSON.stringify(savedFaqs) : otherRaw }; }
    async entriesByFiles() { return [await this.getEntry(FAQ_FILE), await this.getEntry("src/content/homepage.json")]; }
    async persistEntry(entry: unknown, options: unknown) { persisted = { entry, options }; return this.identity; }
    currentUser() { return this.identity; }
  }
  cms.registerBackend("github", Backend);
  cms.registerBackend("proxy", Backend);
  registerFaqRootArrayAdapter(cms);
  registerFaqRootArrayAdapter(cms); // Registration is idempotent.
  for (const name of ["github", "proxy"]) {
    const backend = cms.getBackend(name).init();
    const entries = await backend.entriesByFiles();
    assert.deepEqual(JSON.parse(entries[0].data).faqs, savedFaqs);
    assert.equal(entries[1].data, otherRaw);
    assert.deepEqual(await backend.getEntry(FAQ_FILE), entries[0]);
    assert.equal(backend.currentUser(), "existing backend");
    const payload = { assets: ["unchanged"], dataFiles: [
      { path: FAQ_FILE, raw: entries[0].data, slug: "faqAnswers" },
      { path: "src/content/homepage.json", raw: otherRaw },
    ] };
    const options = { collectionName: "faqPage", commitMessage: "existing flow" };
    assert.equal(await backend.persistEntry(payload, options), "existing backend");
    assert.deepEqual(JSON.parse(persisted.entry.dataFiles[0].raw), savedFaqs);
    assert.equal(persisted.entry.dataFiles[1].raw, otherRaw);
    assert.equal(persisted.entry.assets, payload.assets);
    assert.equal(persisted.options, options);
    const previous = persisted;
    assert.throws(() => backend.persistEntry({ dataFiles: [{ path: FAQ_FILE, raw: "{}" }] }, options));
    assert.equal(persisted, previous, "invalid data must never reach persistence");
  }
});

test("removing CMS controls preserves unconfigured stored JSON through Decap serialization", () => {
  const require = decapModules();
  const { fromJS } = require(46670);
  const { serializeValues } = require(33188);
  for (const collection of config.collections) for (const entry of collection.files) {
    if (entry.file === FAQ_FILE) continue;
    const data = JSON.parse(readFileSync(entry.file, "utf8"));
    const saved = serializeValues(fromJS(data), fromJS(entry.fields)).toJS();
    assert.deepEqual(saved, data, entry.file);
    if (data.hero?.title) {
      const edited = fromJS(data).setIn(["hero", "title"], "Unsaved editor fixture");
      assert.deepEqual(serializeValues(edited, fromJS(entry.fields)).toJS(), {
        ...data, hero: { ...data.hero, title: "Unsaved editor fixture" },
      }, `${entry.file}: editing a live field must retain ignored legacy values`);
    }
  }
});

test("FAQ preview renders edited answers and no stale saved-file answer", () => {
  const faqs = structuredClone(savedFaqs);
  const old = faqs[0].answer;
  faqs[0] = { question: "Draft question", answer: "Draft answer from this editor." };
  const html = renderToStaticMarkup(<FaqAnswersPreview entry={{ getIn: () => ({ toJS: () => ({ faqs }) }) }} />);
  assert.match(html, /Draft question/);
  assert.match(html, /Draft answer from this editor\./);
  assert.ok(!html.includes(old));
});

test("CMS retains collection names, live controls and root-array file path", () => {
  assert.deepEqual(config.collections.map((item: any) => item.name), ["homepage", "aboutPage", "faqPage", "events", "eventsPage", "partnersPage", "communityPage", "blogPage", "blogPosts", "sponsors", "settings", "contributors", "taxonomy"]);
  assert.equal(config.backend.name, "github");
  assert.equal(config.backend.branch, "main");
  assert.equal(config.media_folder, "public/uploads");
  assert.equal(config.public_folder, "/uploads");
  for (const collection of ["homepage", "events", "partnersPage", "faqPage"]) {
    const hero = field(file(collection).fields, "hero").fields;
    for (const name of ["theme", "overlayStrength", "mobileCrop", "imagePosition", "imageOffset", "backdropColor", "backdropStrength", "backdropSize", "align", "primaryCta", "secondaryCta", "cta"]) assert.equal(field(hero, name), undefined, `${collection}.${name}`);
    for (const name of ["eyebrow", "title", "description", "image"]) assert.ok(field(hero, name));
  }
  const homeSections = field(file("homepage").fields, "sections").types;
  assert.deepEqual(homeSections.find((item: any) => item.name === "upcomingEventsIntro").fields.map((item: any) => item.name), ["type", "hidden"]);
  assert.deepEqual(homeSections.find((item: any) => item.name === "eventDiscovery").fields.map((item: any) => item.name), ["type", "intro", "hidden"]);
  const who = homeSections.find((item: any) => item.name === "whoAttends").fields;
  assert.equal(field(who, "statistics"), undefined);
  assert.equal(field(field(who, "highlights").fields, "icon"), undefined);
  const testimonial = homeSections.find((item: any) => item.name === "testimonials").fields;
  assert.ok(field(field(testimonial, "styleTitle").fields, "eyebrow"));
  assert.ok(field(field(testimonial, "styleTitle").fields, "sub"));
  const faqTypes = field(file("faqPage").fields, "sections").types;
  assert.equal(field(faqTypes[0].fields, "variant"), undefined);
  assert.equal(field(faqTypes[0].fields, "accentWord"), undefined);
  assert.equal(field(faqTypes[0].fields, "buttonLabel"), undefined);
  assert.ok(field(faqTypes[1].fields, "accentWord"));
  assert.ok(field(faqTypes[1].fields, "buttonLabel"));
  assert.equal(field(file("settings").fields, "heroDefaults"), undefined);
  assert.equal(field(file("settings").fields, "footer"), undefined);
  assert.deepEqual(field(file("settings").fields, "palette").fields.map((item: any) => item.name), ["backgroundDark", "backgroundLight"]);
});

test("FAQ adapter and preview registration precede manual Decap initialization", () => {
  const html = readFileSync("public/admin/index.html", "utf8");
  assert.ok(html.indexOf("CMS_MANUAL_INIT = true") < html.indexOf('src="/admin/vendor/decap-cms.js"'));
  const source = readFileSync("src/cms/preview.tsx", "utf8");
  assert.ok(source.indexOf("registerFaqRootArrayAdapter(CMS)") < source.indexOf("CMS.init()"));
  assert.ok(source.indexOf('registerPreviewTemplate("faqAnswers"') < source.indexOf("CMS.init()"));
  // Public font links are not inherited by the preview iframe.
  const publicHtml = readFileSync("index.html", "utf8");
  const fontLinks = [...publicHtml.matchAll(/href="(https:\/\/fonts\.googleapis\.com\/css2[^\"]+)"/g)].map(match => match[1]);
  for (const url of new Set(fontLinks)) assert.ok(source.includes(`registerPreviewStyle("${url}", { raw: false })`));
});
