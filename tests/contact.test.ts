import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import vm from "node:vm";
import { contactPayload, contactSchema, sendContact } from "../src/lib/contact";

test("contact payload has only enquiry fields and existing verification fields", () => {
  const payload = contactPayload({ fullName: " Chris ", email: "chris@example.com", message: " Hello " }, "captcha");
  assert.equal(payload.fullName, "Chris");
  assert.equal(payload.message, "Hello");
  assert.equal(payload.formType, "contact");
  for (const key of ["event", "howEngage", "consent", "companyName"]) assert.ok(!(key in payload));
  assert.ok(!contactSchema.safeParse({ fullName: " ", email: "bad", message: "" }).success);
});

test("contact submission uses existing endpoint and does not claim opaque receipt", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /AKfycbxDtoPvPsdOwB-j06Cf3WluKBY6v33Jndyvly5FMQr0Y0V4pmACrYHR0OyR1ieVSs1E\/exec$/);
    assert.equal(options?.mode, "no-cors");
    assert.equal(JSON.parse(options?.body as string).message, "Hello");
    return { type: "opaque", ok: false } as Response;
  };
  try { await sendContact({ fullName: "Chris", email: "chris@example.com", message: "Hello" }, "captcha"); }
  finally { globalThis.fetch = original; }
});

test("handler preserves registration column order and stores messages separately", () => {
  const rows: unknown[][] = [];
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(new URL("../docs/apps-script/EventRegistrations.gs", import.meta.url), "utf8"), context);
  const post = (data: unknown) => context.appendEnquiry({ appendRow: (row: unknown[]) => rows.push(row) }, data);
  post({ fullName: "Guest", companyName: "Studio", emailAddress: "guest@example.com", event: "MPTS", howEngage: "Attend", consent: "Y" });
  assert.deepEqual(Array.from(rows[0].slice(0, 6)), ["Guest", "Studio", "guest@example.com", "MPTS", "Attend", "Y"]);
  assert.equal(rows[0].length, 7);
  post({ formType: "contact", fullName: "Guest", emailAddress: "guest@example.com", message: "=not a formula" });
  assert.deepEqual(Array.from(rows[1].slice(0, 6)), ["Guest", "", "guest@example.com", "", "", ""]);
  assert.equal(rows[1][7], "'=not a formula");
  assert.throws(() => post({ formType: "contact", fullName: "Guest", emailAddress: "guest@example.com" }), /Invalid contact details/);
  assert.equal(rows.length, 2);
});
