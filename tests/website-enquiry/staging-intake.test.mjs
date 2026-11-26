import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const project = "https://ioynilkvrfujnmudaped.supabase.co";
const origin = "https://staging.mediacollective.events";
const source = readFileSync(new URL("../../supabase/functions/website-enquiry/index.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022 } });
const registration = { fullName: "QA", emailAddress: "QA@example.com", companyName: "QA", event: "MPTS", consent: "Y" };
const contact = { formType: "contact", fullName: "QA", emailAddress: "QA@example.com", message: "Test enquiry" };

function mount({ hostname = new URL(origin).hostname, verified = true } = {}) {
  const calls = [];
  let handler;
  const env = {
    SUPABASE_URL: project, SUPABASE_SERVICE_ROLE_KEY: "fixture", WEBSITE_ENQUIRY_RECAPTCHA_SECRET: "fixture",
    WEBSITE_INVITATION_WRITE_KEY: "fixture", WEBSITE_INVITATION_PUBLISHABLE_KEY: "fixture",
    HUBSPOT_EVENT_UPDATES_ENABLED: "true", STAGING_HUBSPOT_PORTAL_ID: "139602049",
  };
  const deno = { env: { get: name => env[name] }, serve: callback => { handler = callback; } };
  async function fakeFetch(url, options) {
    calls.push({ url, options });
    if (url === "https://www.google.com/recaptcha/api/siteverify") return Response.json({ success: verified, hostname });
    if (url.startsWith(project + "/rest/v1/rpc/")) return Response.json(true);
    throw new Error("Unexpected outbound request");
  }
  new Function("Deno", "fetch", outputText)(deno, fakeFetch);
  const submit = (fields, requestOrigin = origin) => handler(new Request(project + "/functions/v1/website-enquiry", {
    method: "POST", headers: { Origin: requestOrigin },
    body: JSON.stringify({ "g-recaptcha-response": "fixture", ...fields }),
  }));
  return { calls, submit };
}

test("verified contact and commercial enquiries only write to isolated intake", async () => {
  for (const [payload, kind] of [[contact, "contact"], [{ ...registration, howEngage: "Sponsor, Co-host" }, "commercial"]]) {
    const { submit, calls } = mount();
    assert.equal((await (await submit(payload)).json()).success, true);
    assert.equal(calls.length, 2);
    assert.equal(calls[1].url, project + "/rest/v1/rpc/portal_record_staging_website_enquiry");
    assert.equal(JSON.parse(calls[1].options.body).p_kind, kind);
  }
});

test("attendance continues through the invitation workflow", async () => {
  const { submit, calls } = mount();
  assert.equal((await (await submit({ ...registration, howEngage: "Attend" })).json()).success, true);
  assert.equal(calls[1].url, project + "/rest/v1/rpc/portal_record_website_invitation");
});

test("invalid verification and production origin cannot write enquiries", async () => {
  for (const options of [{ verified: false }, { hostname: "www.mediacollective.events" }]) {
    const { submit, calls } = mount(options);
    assert.equal((await (await submit(contact)).json()).success, false);
    assert.equal(calls.length, 1);
  }
  const { submit, calls } = mount();
  assert.equal((await submit(contact, "https://www.mediacollective.events")).status, 403);
  assert.equal(calls.length, 0);
});

test("staging subscriptions cannot fall back to the production CRM", async () => {
  const { submit, calls } = mount();
  const response = await submit({ ...registration, formType: "event-updates",
    requestId: crypto.randomUUID(), consentVersion: "event-updates-v1", howEngage: "Receive new event notifications" });
  assert.equal((await response.json()).success, false);
  assert.equal(calls.length, 1);
});
