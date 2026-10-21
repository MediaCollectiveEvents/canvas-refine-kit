import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ANALYTICS_ID, ANALYTICS_CONSENT_KEY, createAnalyticsConsent, parseAnalyticsChoice } from "../src/lib/analyticsConsent";
import { protectUnsavedForm } from "../src/lib/unsavedForm";
import { analyticsConsentPolicy } from "../src/lib/analyticsConsentPolicy";
import CookieConsent, { CookieSettingsButton } from "../src/components/shared/CookieConsent";
import { injectHead } from "../scripts/generate-static-heads.mjs";
import { getCanonicalRoutes } from "../src/lib/canonicalRoutes.mjs";
import events from "../src/content/events.json";

const savedRecord = (choice: string, savedAt = Date.now()) => JSON.stringify({ version: 2, choice, savedAt });
function environment(saved?: string) {
  if (saved === "accepted" || saved === "rejected") saved = savedRecord(saved);
  const storage = new Map(saved ? [[ANALYTICS_CONSENT_KEY, saved]] : []);
  const scripts: any[] = [], listeners = new Map<string, (event: any) => void>();
  const cookies = new Map([["_ga", "old"], ["_ga_4VZBFPC4S8", "old-session"], ["sidebar_state", "true"]]);
  let reloads = 0, removed = 0, confirms = 0;
  const transport: string[] = [];
  class Request { url = ""; open(_method: string, url: string) { this.url = url; } send() { transport.push(this.url); } }
  const browser: any = {
    localStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) },
    navigator: { sendBeacon(url: string) { transport.push(url); return true; } },
    XMLHttpRequest: Request,
    fetch: async (url: string) => { transport.push(url); return {}; },
    confirm() { confirms++; return true; },
    location: { href: "https://mediacollective.events/", origin: "https://mediacollective.events", hostname: "mediacollective.events", reload() { reloads++; } },
    addEventListener(name: string, handler: any) { listeners.set(name, handler); },
    document: {
      createElement: () => ({ setAttribute(name: string, value: string) { (this as any)[name] = value; } }),
      head: { appendChild(script: any) { assert.equal(commands()[0][0], "consent"); scripts.push(script); } },
      getElementById: () => ({ remove() { removed++; } }),
      get cookie() { return [...cookies].map(([key, value]) => `${key}=${value}`).join("; "); },
      set cookie(value: string) { cookies.delete(value.split("=")[0]); },
    },
  };
  const commands = () => (browser.dataLayer ?? []).map((entry: any) => Array.from(entry));
  const controller = createAnalyticsConsent(browser);
  return { browser, controller, storage, scripts, cookies, commands, listeners, reloads: () => reloads, removed: () => removed, confirms: () => confirms, transport };
}
const adsDenied = (state: any) => {
  for (const field of ["ad_storage", "ad_user_data", "ad_personalization"]) assert.equal(state[field], "denied");
};

test("basic mode defaults to denied locally and makes no Google request without a choice", () => {
  const e = environment(); e.controller.initialize(); e.controller.initialize();
  assert.equal(e.scripts.length, 0); assert.equal(e.controller.getChoice(), null);
  assert.equal(e.browser[`ga-disable-${ANALYTICS_ID}`], true);
  assert.equal(e.commands().length, 1);
  assert.deepEqual(e.commands()[0].slice(0, 2), ["consent", "default"]);
  assert.equal(e.commands()[0][2].analytics_storage, "denied"); adsDenied(e.commands()[0][2]);
});

test("rejection is remembered, never loads Google, and clears only analytics cookies", () => {
  const e = environment(); e.controller.choose("rejected");
  assert.equal(JSON.parse(e.storage.get(ANALYTICS_CONSENT_KEY)!).choice, "rejected");
  assert.equal(e.scripts.length, 0); assert.equal(e.reloads(), 0);
  assert.deepEqual([...e.cookies.keys()], ["sidebar_state"]);
  assert.equal(e.commands().at(-1)[2].analytics_storage, "denied");
  const reload = environment(e.storage.get(ANALYTICS_CONSENT_KEY)); reload.controller.initialize();
  assert.equal(reload.scripts.length, 0); assert.equal(reload.controller.getChoice(), "rejected");
});

test("acceptance grants analytics alone before one async tag/config, without manual duplicate page views", () => {
  const e = environment(); e.controller.initialize(); e.controller.choose("accepted"); e.controller.choose("accepted");
  assert.equal(e.scripts.length, 2); assert.equal(e.scripts[0].async, true);
  assert.equal(e.scripts[0].src, `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`);
  const commands = e.commands();
  assert.deepEqual(commands.map((c: any[]) => c.slice(0, 2)), [["consent", "default"], ["consent", "update"], ["js", commands[2][1]], ["config", ANALYTICS_ID]]);
  assert.equal(commands[1][2].analytics_storage, "granted"); adsDenied(commands[1][2]);
  assert.equal(commands[3][2].allow_google_signals, false);
  assert.equal(commands[3][2].allow_ad_personalization_signals, false);
  assert.equal(JSON.parse(e.storage.get(ANALYTICS_CONSENT_KEY)!).choice, "accepted");
  assert.ok(!commands.some((c: any[]) => c[0] === "event"));
});

test("saved acceptance loads once with denied defaults preceding the grant", () => {
  const e = environment("accepted"); e.controller.initialize(); e.controller.initialize();
  assert.equal(e.scripts.length, 2);
  assert.equal(e.commands()[0][2].analytics_storage, "denied");
  assert.equal(e.commands()[1][2].analytics_storage, "granted");
});

test("withdrawal disables immediately, saves rejection and unloads via reload without denied-consent pings", () => {
  const e = environment("accepted"); e.controller.initialize(); const before = e.commands().length;
  e.controller.choose("rejected");
  assert.equal(e.browser[`ga-disable-${ANALYTICS_ID}`], true);
  assert.equal(JSON.parse(e.storage.get(ANALYTICS_CONSENT_KEY)!).choice, "rejected");
  assert.equal(e.reloads(), 1); assert.equal(e.removed(), 2);
  assert.equal(e.commands().length, before, "no command sent to a running tag after rejection");
});

test("another tab's rejection also disables and unloads the active tag", () => {
  const e = environment("accepted"); e.controller.initialize();
  e.listeners.get("storage")!({ key: ANALYTICS_CONSENT_KEY, newValue: savedRecord("rejected") });
  assert.equal(e.controller.getChoice(), "rejected");
  assert.equal(e.browser[`ga-disable-${ANALYTICS_ID}`], true); assert.equal(e.reloads(), 1);
});

test("invalid or unavailable saved preferences fail closed", () => {
  for (const value of ["true", "granted", "garbled"]) {
    const e = environment(value); e.controller.initialize(); assert.equal(e.scripts.length, 0);
  }
  const e = environment(); e.browser.localStorage.getItem = () => { throw new Error("storage unavailable"); };
  const controller = createAnalyticsConsent(e.browser); controller.initialize(); assert.equal(e.scripts.length, 0);
  e.browser.localStorage.setItem = () => { throw new Error("storage unavailable"); };
  assert.doesNotThrow(() => controller.choose("rejected")); assert.equal(e.scripts.length, 0);
});

test("banner has named, equally available accept/reject controls and a settings control", () => {
  const html = renderToStaticMarkup(createElement(CookieConsent));
  assert.match(html, /role="region" aria-labelledby="[^"]+" aria-describedby="[^"]+"/);
  assert.match(html, />Accept analytics<\/button>/); assert.match(html, />Reject analytics<\/button>/);
  assert.doesNotMatch(html, />Cookie settings<\/button>/);
  const settings = renderToStaticMarkup(createElement(CookieSettingsButton));
  assert.match(settings, />Cookie settings<\/button>/);
  assert.match(settings, /aria-controls="analytics-cookie-preferences"/);
  assert.doesNotMatch(settings, /fixed/);
  assert.match(html, /privacy-policy#cookies/);
  assert.match(html, /Google Analytics and Cloudflare Web Analytics/);
  assert.match(html, /Google Fonts and form verification are separate/);
  const app = readFileSync("src/App.tsx", "utf8");
  assert.ok(app.indexOf("<CookieConsent />") > app.indexOf("</Suspense>"), "banner remains mounted during lazy route navigation");
});

test("all route/error shells contain no eager Google tag or config before consent", () => {
  const html = readFileSync("index.html", "utf8");
  const assertBlocked = (shell: string) => assert.doesNotMatch(shell, /googletagmanager\.com|google-analytics\.com|gtag\(/);
  assertBlocked(html);
  const routes = getCanonicalRoutes(events); assert.equal(routes.length, 14);
  for (const route of routes) assertBlocked(injectHead(html, `<title>${route.path}</title>`));
  assertBlocked(injectHead(html, '<title>Not found</title><meta name="robots" content="noindex, follow">'));
  assert.doesNotMatch(html, /cloudflareinsights/);
});


test("a quota failure while withdrawing removes a stale saved grant before reload", () => {
  const e = environment("accepted"); e.controller.initialize();
  e.browser.localStorage.setItem = () => { throw new Error("quota"); };
  e.controller.choose("rejected");
  assert.equal(e.storage.get(ANALYTICS_CONSENT_KEY), undefined);
  assert.equal(e.browser[`ga-disable-${ANALYTICS_ID}`], true);
  assert.equal(e.reloads(), 1);
});


test("one choice loads both analytics services once, and withdrawal blocks Cloudflare unload transports only", async () => {
  const e = environment(); e.controller.initialize();
  const endpoint = "https://cloudflareinsights.com/cdn-cgi/rum";
  const request = new e.browser.XMLHttpRequest(); request.open("POST", endpoint); request.send();
  assert.equal(e.browser.navigator.sendBeacon(endpoint), false);
  await assert.rejects(e.browser.fetch(endpoint), /consent denied/);
  assert.equal(e.transport.length, 0);
  await e.browser.fetch("https://script.google.com/macros/s/example/exec");
  e.browser.navigator.sendBeacon("https://example.com/unrelated");
  assert.equal(e.transport.length, 2, "unrelated transport is unchanged");
  e.controller.choose("accepted"); e.controller.choose("accepted");
  assert.equal(e.scripts.length, 2);
  assert.equal(e.scripts[1].src, "https://static.cloudflareinsights.com/beacon.min.js");
  assert.equal(JSON.parse(e.scripts[1]["data-cf-beacon"]).token, "5bf9c8154a3742a2a2373cf19d016170");
  assert.equal(e.browser.navigator.sendBeacon(endpoint), true);
  const count = e.transport.length;
  e.controller.choose("rejected");
  assert.equal(e.confirms(), 1);
  assert.equal(e.browser.navigator.sendBeacon(endpoint), false);
  const unload = new e.browser.XMLHttpRequest(); unload.open("POST", "/cdn-cgi/rum"); unload.send();
  await assert.rejects(e.browser.fetch(endpoint), /consent denied/);
  assert.equal(e.transport.length, count);
});

test("cancelling the withdrawal warning leaves choice, form document and analytics unchanged", () => {
  const e = environment("accepted"); e.controller.initialize();
  e.browser.confirm = () => false;
  assert.equal(e.controller.choose("rejected"), false);
  assert.equal(e.controller.getChoice(), "accepted");
  assert.equal(JSON.parse(e.storage.get(ANALYTICS_CONSENT_KEY)!).choice, "accepted");
  assert.equal(e.reloads(), 0); assert.equal(e.removed(), 0);
});

test("versioned preferences fail closed with configurable expiry", () => {
  assert.equal(parseAnalyticsChoice('"accepted"'), null, "legacy GA-only acceptance is not consent for Cloudflare");
  assert.equal(parseAnalyticsChoice(savedRecord("accepted", 100), 150, null), "accepted");
  assert.equal(parseAnalyticsChoice(savedRecord("accepted", 100), 150, 50), null);
  assert.equal(parseAnalyticsChoice(savedRecord("rejected", 100), 149, 50), "rejected");
  assert.equal(parseAnalyticsChoice(savedRecord("accepted", 151), 150, null), null);
  assert.equal(parseAnalyticsChoice(savedRecord("accepted", 100), 150, -1), null);
  assert.equal(parseAnalyticsChoice('{"version":2,"choice":"accepted"}'), null);
});

test("the approved default expires both choices at 180 days and invalidates changed scopes", () => {
  const duration = 180 * 24 * 60 * 60 * 1000;
  assert.equal(analyticsConsentPolicy.maxAgeMs, duration);
  assert.equal(ANALYTICS_CONSENT_KEY, `tmc.analytics-consent.v${analyticsConsentPolicy.version}`);
  for (const choice of ["accepted", "rejected"]) {
    const record = savedRecord(choice, 1_000);
    assert.equal(parseAnalyticsChoice(record, 1_000 + duration - 1), choice);
    assert.equal(parseAnalyticsChoice(record, 1_000 + duration), null);
    assert.equal(parseAnalyticsChoice(record, 1_001 + duration), null);
  }
  assert.equal(parseAnalyticsChoice(JSON.stringify({ version: analyticsConsentPolicy.version - 1, choice: "accepted", savedAt: 1_000 }), 1_001), null);
  assert.equal(parseAnalyticsChoice(savedRecord("accepted", -1), 1_000), null);
  const expired = environment(savedRecord("accepted", Date.now() - duration - 1));
  expired.controller.initialize();
  assert.equal(expired.controller.getChoice(), null);
  assert.equal(expired.storage.has(ANALYTICS_CONSENT_KEY), false, "expired preference is discarded");
  assert.equal(expired.scripts.length, 0, "neither analytics provider loads with expired consent");
});


test("unfinished forms install a native reload warning without storing their values", () => {
  let handler: any, removed = false, prevented = false;
  const cleanup = protectUnsavedForm({
    addEventListener(name: string, callback: any) { assert.equal(name, "beforeunload"); handler = callback; },
    removeEventListener(name: string, callback: any) { assert.equal(callback, handler); removed = true; },
  } as any);
  const event = { preventDefault() { prevented = true; }, returnValue: undefined };
  handler(event); assert.equal(prevented, true); assert.equal(event.returnValue, "");
  cleanup(); assert.equal(removed, true);
  for (const file of ["src/components/EventRegistrationForm.tsx", "src/components/ContactForm.tsx"]) {
    assert.match(readFileSync(file, "utf8"), /form.formState\?\.isDirty && !submitted/);
  }
});
