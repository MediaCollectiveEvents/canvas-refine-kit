import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PrivacyPolicy from "../src/pages/PrivacyPolicy";
import { PreviewProviders } from "../src/cms/previews/PreviewLayout";
import { analyticsConsentPolicy } from "../src/lib/analyticsConsentPolicy";

function policyText() {
  return renderToStaticMarkup(createElement(PreviewProviders, {
    route: "/privacy-policy", children: createElement(PrivacyPolicy),
  })).replace(/<[^>]*>/g, " ").replace(/&#x27;|&#39;/g, "'").replace(/\s+/g, " ");
}

test("rendered policy discloses the shared analytics choice and configured expiry", () => {
  const text = policyText();
  assert.match(text, /Google Analytics and Cloudflare Web Analytics/);
  assert.match(text, /Neither analytics script loads or sends measurement requests until you accept/);
  assert.match(text, /Rejecting analytics leaves both services off/);
  assert.match(text, /Advertising consent stays denied/);
  assert.match(text, /tmc\.analytics-consent\.v2/);
  assert.match(text, new RegExp(`expires after ${analyticsConsentPolicy.maxAgeMs / 86400000} days`));
  assert.match(text, /Keep current choice or Reject and reload/);
  assert.match(text, /Cancelling the interface warning retains the existing choice and form values/);
});

test("rendered policy separates verified GA retention from unverified Cloudflare deletion", () => {
  const text = policyText();
  assert.doesNotMatch(text, /26 months/);
  assert.match(text, /event-data and user-data retention are both set to 2 months, with reset on new user activity disabled/);
  assert.match(text, /unsampled beacon data is retained for 7 days/);
  assert.match(text, /previous six months/);
  assert.match(text, /not independently verified account settings or a promise of complete deletion/);
  assert.match(text, /Cloudflare's total deletion timing, backend retention and any alternative account controls remain unverified/);
});

test("rendered policy describes remote fonts and the distinct deferred verification flows", () => {
  const text = policyText();
  assert.match(text, /Montserrat, Source Sans 3 and Satisfy from Google Fonts/);
  assert.match(text, /external requests occur independently of analytics permission/);
  assert.match(text, /mounts reCAPTCHA at the consent\/verification step/);
  assert.match(text, /mounts reCAPTCHA on first opening/);
  assert.match(text, /closing them does not unload third-party code/);
  assert.match(text, /does not classify these services as legally necessary or exempt/);
});
