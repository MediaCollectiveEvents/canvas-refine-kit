import assert from "node:assert/strict";
import test from "node:test";
import { getEnquirySiteKey } from "../src/lib/enquiryVerification";
import { getEventTimeZoneLabel } from "../src/lib/eventTimeZone";
import { getEventById } from "../src/lib/events";

test("development verification requires an explicitly approved key and production keeps its existing key", () => {
  assert.equal(getEnquirySiteKey(true), undefined);
  assert.equal(getEnquirySiteKey(true, "  "), undefined);
  assert.equal(getEnquirySiteKey(true, " approved-key "), "approved-key");
  assert.equal(getEnquirySiteKey(false), "6LeBiU8sAAAAAOmWadJe4sFM-0UaOBkFk-19GyIc");
  assert.equal(getEnquirySiteKey(false, "production-override"), "production-override");
});

test("timezone labels follow the confirmed event date, including daylight saving", () => {
  assert.equal(getEventTimeZoneLabel(getEventById(1)!), "BST");
  assert.equal(getEventTimeZoneLabel(getEventById(3)!), "CEST");
  assert.equal(getEventTimeZoneLabel(getEventById(4)!), "GMT");
});

test("date-only and invalid schedules never invent a timezone label", () => {
  assert.equal(getEventTimeZoneLabel(getEventById(5)!), undefined);
  assert.equal(getEventTimeZoneLabel({ ...getEventById(4)!, timeZone: "Invalid/Zone" }), undefined);
  assert.equal(getEventTimeZoneLabel({ ...getEventById(4)!, startsAt: "invalid" }), undefined);
});
