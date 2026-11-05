import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import vm from "node:vm";
import { EVENT_UPDATES_CONSENT_TEXT, EVENT_UPDATES_CONSENT_VERSION, getEventUpdatesMetadata } from "../src/lib/eventUpdates";

const request = {
  fullName: "Test Person", companyName: "Test company", emailAddress: "TEST@example.invalid",
  event: "All future Media Collective events", howEngage: "Receive new event notifications", consent: "Y",
  ...getEventUpdatesMetadata("16cfa410-7017-45aa-bb8a-b376700d4ec5"),
};
function harness(status: number | "timeout" = 200) {
  const rows: unknown[][] = [];
  const registrations: unknown[][] = [];
  const sent: { url: string; body: any }[] = [];
  let released = 0;
  let enabled = true;
  const audit = {
    appendRow(row: unknown[]) { rows.push(row); },
    getLastRow() { return rows.length; },
    getDataRange() { return { getValues: () => rows }; },
    getRange(row: number, col: number) { return { setValue: (value: unknown) => { rows[row - 1][col - 1] = value; } }; },
  };
  const registrationSheet = { appendRow: (row: unknown[]) => registrations.push(row) };
  let created = false;
  const spreadsheet = {
    getSheetByName: () => created ? audit : null,
    insertSheet: () => { created = true; return audit; },
  };
  const context = vm.createContext({
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => enabled ? "true" : "false" }) },
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => { released++; } }) },
    UrlFetchApp: { fetch: (url: string, options: { payload: string }) => {
      sent.push({ url, body: JSON.parse(options.payload) });
      if (status === "timeout") throw new Error("provider response lost");
      return { getResponseCode: () => status };
    } },
  });
  vm.runInContext(fs.readFileSync(new URL("../docs/apps-script/EventRegistrations.gs", import.meta.url), "utf8"), context);
  return { context, sent, rows, registrations, run: (data = request) => context.submitEventUpdates_(spreadsheet, registrationSheet, data), disable: () => { enabled = false; }, released: () => released };
}

test("only dedicated, versioned, explicit event-email consent can reach the subscription builder", () => {
  const { context } = harness();
  assert.equal(context.EVENT_UPDATES_CONSENT_TEXT_, EVENT_UPDATES_CONSENT_TEXT);
  assert.equal(context.EVENT_UPDATES_CONSENT_VERSION_, EVENT_UPDATES_CONSENT_VERSION);
  for (const patch of [{ formType: "contact" }, { formType: undefined }, { consent: "N" }, { consentVersion: "old" }, { howEngage: "Attend" }, { requestId: "invalid" }]) {
    assert.throws(() => context.buildEventUpdatesSubmission_({ ...request, ...patch }));
  }
});

test("HubSpot receives only email and subscription-specific consent, not event registration or invented name splits", () => {
  const h = harness();
  assert.equal(h.run().success, true);
  assert.equal(h.sent.length, 1);
  assert.match(h.sent[0].url, /139602049\/8c503e92-d086-4931-bacb-ab3ccde5dbfa$/);
  assert.deepEqual(h.sent[0].body.fields, [{ objectTypeId: "0-1", name: "email", value: "test@example.invalid" }]);
  assert.equal(h.sent[0].body.legalConsentOptions.consent.communications[0].subscriptionTypeId, 183441347);
  assert.equal(h.rows[1][5], "ACCEPTED");
  assert.equal(h.registrations.length, 1);
  assert.equal(h.registrations[0].length, 7);
  assert.equal(h.released(), 1);
});

test("duplicate successful requests acknowledge receipt without another HubSpot call or registration row", () => {
  const h = harness();
  h.run();
  assert.equal(h.run().success, true);
  assert.equal(h.sent.length, 1);
  assert.equal(h.registrations.length, 1);
  assert.equal(h.run({ ...request, emailAddress: "other@example.invalid" }).outcomeUnknown, true);
  assert.equal(h.sent.length, 1);
});

test("provider failures and lost responses are retained for review and are never automatically replayed", () => {
  for (const status of [400, 429, 500, "timeout"] as const) {
    const h = harness(status);
    const result = h.run();
    assert.equal(result.success, false);
    assert.equal(result.outcomeUnknown, true);
    assert.equal(h.run().outcomeUnknown, true);
    assert.equal(h.sent.length, 1);
    assert.equal(h.registrations.length, 0);
    assert.equal(h.rows.length, 2);
  }
});

test("configuration switch prevents accidental CRM writes before deployment is ready", () => {
  const h = harness(); h.disable();
  assert.equal(h.run().success, false);
  assert.equal(h.sent.length, 0);
  assert.equal(h.rows.length, 0);
});

test("the handler routes only explicit event updates to HubSpot and verifies CAPTCHA before any routing", () => {
  const h = harness();
  let subscriptions = 0;
  let ordinary = 0;
  let validCaptcha = true;
  h.context.PropertiesService = { getScriptProperties: () => ({ getProperty: (key: string) => key === "RECAPTCHA_ALLOWED_HOSTNAMES" ? "www.mediacollective.events,mediacollective.events" : "server-only-secret" }) };
  h.context.SpreadsheetApp = { getActiveSpreadsheet: () => ({ getSheetByName: () => ({}) }) };
  h.context.ContentService = { MimeType: { JSON: "application/json" }, createTextOutput: (text: string) => ({ setMimeType: () => JSON.parse(text) }) };
  h.context.UrlFetchApp = { fetch: () => ({ getResponseCode: () => 200, getContentText: () => JSON.stringify({ success: validCaptcha, hostname: "www.mediacollective.events" }) }) };
  h.context.submitEventUpdates_ = () => { subscriptions++; return { success: true }; };
  h.context.appendEnquiry = () => { ordinary++; };
  const post = (data: object) => h.context.doPost({ postData: { contents: JSON.stringify({ ...data, "g-recaptcha-response": "test-captcha" }) } });
  const { formType, consentVersion, requestId, ...invitation } = request;
  assert.equal(post({ ...invitation, howEngage: "Attend" }).success, true);
  assert.equal(post({ formType: "contact", fullName: "Test", emailAddress: "test@example.invalid", message: "Hello" }).success, true);
  assert.equal(subscriptions, 0);
  assert.equal(ordinary, 2);
  validCaptcha = false;
  assert.equal(post(request).success, false);
  assert.equal(subscriptions, 0);
  validCaptcha = true;
  assert.equal(post(request).success, true);
  assert.equal(subscriptions, 1);
  const rawPost = (contents: string) => h.context.doPost({ postData: { contents } });
  for (const contents of ["{", "null", "[]", JSON.stringify({ ...request, extra: "unexpected" }), JSON.stringify({ ...request, formType: "unknown" }), JSON.stringify({ ...request, fullName: ["Test"] }), JSON.stringify({ ...request, emailAddress: "invalid" }), JSON.stringify({ ...request, fullName: "A".repeat(101) }), " ".repeat(20001)]) {
    assert.equal(rawPost(contents).success, false);
  }
  assert.equal(rawPost(JSON.stringify(request)).success, false); // missing CAPTCHA
  assert.equal(rawPost(JSON.stringify({ ...request, "g-recaptcha-response": " " })).success, false);
  for (const captcha of [{ success: false }, { success: "true", hostname: "www.mediacollective.events" }, { success: true, hostname: "attacker.invalid" }, { success: true }]) {
    h.context.UrlFetchApp = { fetch: () => ({ getResponseCode: () => 200, getContentText: () => JSON.stringify(captcha) }) };
    assert.equal(post(request).success, false);
  }
  assert.equal(subscriptions, 1); // none of the rejected requests reached HubSpot
});

test("an ambiguous provider receipt does not tell the visitor that a safe retry is available", async () => {
  const { sendEnquiry, EnquiryDeliveryError } = await import("../src/lib/enquiryTransport");
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ success: false, outcomeUnknown: true }));
  try {
    await assert.rejects(sendEnquiry(request), error => error instanceof EnquiryDeliveryError && !error.confirmedRejection);
  } finally { globalThis.fetch = original; }
});
