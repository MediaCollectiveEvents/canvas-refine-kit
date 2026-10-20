# Analytics preferences — pre-launch review draft

Owner-approved wording for the staging candidate, not a legal-compliance statement. The rendered Privacy Policy in the isolated candidate now includes these disclosures; production has not been changed.

## Implementation and proposed Privacy Policy section 11

Place the following reviewed copy in `src/pages/PrivacyPolicy.tsx`, replacing the generic paragraph under `#cookies`. Reconcile section 6 (external form services), section 7 (retention) and the policy date at the same time. Do not publish owner-review placeholders.

### Analytics and preferences

With your permission, we use Google Analytics and Cloudflare Web Analytics to understand site usage and performance and improve the website. Neither analytics script loads or sends measurement requests until you accept analytics. Rejecting analytics leaves both services off. Google Analytics uses first-party `_ga` and `_ga_…` cookies; Cloudflare documents its beacon as not using cookies or browser storage. That description does not decide its privacy classification.

Google Consent Mode defaults analytics and advertising consent to denied. Acceptance grants analytics only before GA4 configuration. Advertising consent stays denied; Google signals and advertising personalisation signals are disabled. Route visits begin with the page you are viewing when you accept; earlier visits are not replayed.

We remember your choice in this browser's local storage under `tmc.analytics-consent.v2`, with the choice, format version and time it was saved. It applies to both analytics services. The saved choice expires after 180 days, for both acceptance and rejection, or sooner if changed or cleared by you or your browser. Expiry is evaluated on the next document load or cross-tab preference update, so a long-open form is not abruptly reloaded solely because time passes. Choices are separate between browsers and between production and staging origins. Invalid or expired stored records are discarded. Clearing storage or an invalid/expired preference brings the choice interface back and keeps analytics blocked. The earlier GA-only preference is not treated as permission for Cloudflare.

Use **Cookie settings** to review or change your choice. Withdrawing acceptance requires a reload to unload both analytics runtimes. The interface warns that unfinished registration/enquiry entries will be lost and offers **Keep current choice** or **Reject and reload**. Dirty forms also request a browser warning on document unload, including when another tab withdraws analytics. Cancelling the interface warning retains the existing choice and form values. Form values are not stored across reloads. Accessible GA cookies are cleared on withdrawal; this does not erase data providers have already received. Requests already sent before withdrawal cannot be recalled.

### Provider retention — proposed factual copy

In our Google Analytics property, event-data and user-data retention are both set to 2 months, with reset on new user activity disabled. These provider controls concern detailed data associated with identifiers and do not limit most standard aggregated reports. They are separate from the 180-day browser preference.

According to Cloudflare's published Web Analytics documentation, unsampled beacon data is retained for 7 days and is then aggregated for longer-term storage; reports provide access to the previous six months. These are provider-published details, not independently verified account settings or a promise of complete deletion after either period. The verified site settings expose no retention control. Owner check: ask Cloudflare to confirm any alternative account controls and its total deletion/retention policy for aggregated data.

### Fonts and verification, separate from analytics

The site currently requests Montserrat, Source Sans 3 and Satisfy from Google Fonts. These external requests occur independently of analytics permission. The isolated project has PlaylistScript font files, but not the three Google font families or their licence files; remote delivery has therefore been left unchanged. Agreed decision: retain current external font delivery until approved local font files and licences are available; self-hosting would be a separate change. No exemption is assumed.

Google reCAPTCHA helps assess automated form submissions and is independent of the analytics choice. No reCAPTCHA script is loaded by the closed lazy forms on initial Home/event load. Registration first loads its form on opening, and mounts reCAPTCHA at the consent/verification step. The contact form needs verification for its one-page submission flow and mounts reCAPTCHA on first opening. Once opened, form components remain mounted to preserve values; closing them does not unload third-party code that has already loaded. Google documents `_GRECAPTCHA` for its risk analysis, and other Google/partitioned storage depends on the browser and existing Google session. Review this actual processing with the site owner; this document does not classify it as legally necessary or exempt.

Submitted invitation/enquiry details are processed using Google Apps Script/Google Sheets, as described in section 6 of the current policy. No transport, consent-checkbox, endpoint, payload or timeout behaviour was changed.

## Preference duration decision

`src/lib/analyticsConsentPolicy.ts` sets the approved configurable duration to `180 * 24 * 60 * 60 * 1000` milliseconds. The cookie banner derives its displayed duration from the same configuration. The saved timestamp is checked on document initialization and cross-tab storage updates; an active page is not automatically reloaded partway through a form merely because time passes.

**Agreed decision implemented:** ask again after 180 days for acceptance and rejection. The same policy file owns `version`; increment it whenever providers or purposes materially change. The storage key and record validator both use this version, so old scope records are not reused. This is a product decision, not a legal-compliance assertion.

## Withdrawal mechanism

Cloudflare's current public integration has no documented runtime teardown. Removing a script element does not remove its event listeners. A narrow transport guard blocks only Cloudflare `/cdn-cgi/rum` requests (its external host or same-origin endpoint) once consent is absent, including an unload beacon. It passes through unrelated fetch/XHR/sendBeacon requests, including forms and reCAPTCHA. GA is disabled synchronously before reload. The next document loads neither service. The guard covers current sendBeacon/XHR transport and fetch for forward compatibility; a future provider transport change needs revalidation.

## Owner decisions before release

- Approve the draft service descriptions, provider processing/transfer arrangements and use of both analytics services.
- Preference duration is agreed at 180 days; no further duration decision is pending. Bump the configured version for future material provider/purpose changes.
- Supply Montserrat (300–700), Source Sans 3 (400–600), Satisfy and their redistribution licences if self-hosting is wanted. PlaylistScript is not a replacement.
- Review reCAPTCHA handling, remote fonts and their disclosures independently of analytics.
- GA4 event retention (2 months), user retention (2 months) and activity reset (off) are account-verified below. Cloudflare account/site/product and matching beacon token are verified; no retention control appears on Manage site. Owner check: total Cloudflare deletion/retention policy, any alternative retention controls and GA4 enhanced-measurement settings. Review the old policy date, blanket 26-month claim and broader operational/security claims before publication.
- Approve reload-based withdrawal with confirmation. Nothing entered into forms is persisted across reloads.

## Staging test plan (requires separate deployment authorisation)

1. Deploy only a reviewed candidate to the existing real staging domain; preserve staging noindex and production isolation. No deployment was performed in this task.
2. In a fresh browser profile, confirm no GA/Cloudflare scripts or collection requests before choice. Inventory first-party and third-party/partitioned cookies, localStorage and sessionStorage with DevTools. Record remote Fonts separately.
3. Reject; reload; navigate Home, Events, Community and Partners. Both analytics services must remain absent.
4. Accept. Verify one script per service; GA4 default denied → analytics-only grant → config in Tag Assistant. Count route page views without replaying pre-consent routes or duplicating the initial view. Check Cloudflare SPA beacons with Network preserving the log.
5. Reload accepted. Confirm the saved version-2 preference applies before analytics initialization. Test invalid and configured-expired records in a test build; confirm both accepted and rejected choices expire at the exact 180-day boundary. Bump the version in a test build and verify both services return to blocked until the new scope is accepted.
6. Enter an unsent registration, close/reopen it and verify retention. Open settings, reject, choose Keep current choice and verify entries remain. Then explicitly confirm withdrawal: check reload warning, no post-withdrawal/unload collection, and no analytics on subsequent routes. Repeat a cross-tab rejection with an unfinished form.
7. Open registration: no reCAPTCHA before verification step. Open contact: verification loads on first open. Verify rejection of analytics does not prevent verification. Do not send production submissions for this check.
8. Confirm form transport/state/focus tests, hero/image delivery and production public site remain unchanged.
9. Verify the candidate uses the matched Cloudflare Web Analytics token and GA4 measurement ID `G-4VZBFPC4S8` for property `559747234`. Check there is no independently injected analytics snippet bypassing the consent controller. Confirm staging returns `X-Robots-Tag: noindex, nofollow`; test valid routes and genuine unknown-route 404s.
10. Record evidence: build/commit identity, hostname, viewport, clean-profile state, timestamped Network log (including page unload), Tag Assistant consent timeline, cookies/storage before and after each choice, route page-view counts and cancellation preserving unsent form values. Account-retention evidence records both GA4 values at 2 months and reset off; do not infer that consent expiry or report access equals provider data deletion. No staging deployment is authorised by this document.

## References for review

- Consent API: https://developers.google.com/tag-platform/security/guides/consent
- Basic mode: https://developers.google.com/tag-platform/security/concepts/consent-mode
- Cloudflare beacon: https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/
- Cloudflare setup: https://developers.cloudflare.com/web-analytics/get-started/
- Fonts: https://fonts.google.com/faq
- reCAPTCHA: https://developers.google.com/recaptcha/docs/faq

## Validation in this isolated build

- Full Node suite: 250 tests passed, including consent ordering, dual-service gating, versioned persistence/expiry, withdrawal cancellation, Cloudflare transport guard, unsaved-form warning, form submission states and lazy form behaviour.
- TypeScript application check (`tsc -p tsconfig.app.json --noEmit`), production build, generated heads and deployment payload passed.
- Browser: fresh version-2 scope had no GA/Cloudflare resources; saved rejection survived reload. Acceptance loaded one script for each service, GA initial page_view once, then one additional Events route view. Saved acceptance initialized both scripts in a new document.
- Browser: custom withdrawal warning shown; Keep current choice preserved the unsent registration name on reopening. Confirmed withdrawal returned to no analytics scripts. A fresh document with saved rejection had zero analytics resources, including after route navigation. No real submission was made.
- Cloudflare denied/unload transport blocking is unit-tested for sendBeacon, XHR and fetch, including passthrough for unrelated requests. A full preserved-Network-log check on real staging remains part of the plan above; the browser asset inventory retains old document requests after some reloads and is not a precise unload-request log.
- Fonts unchanged because required font files/licences are absent. reCAPTCHA and all form transport/security behaviour remain unchanged except the unsaved-document warning.
- Nothing committed, pushed, deployed or published; original workspace not edited. All copy here remains a draft for owner review.

## Files changed in this preparation pass

- `index.html`: removed unconditional Cloudflare beacon.
- `src/lib/analyticsConsent.ts`: dual-service loading, version-2 preferences and confirmed withdrawal.
- `src/lib/analyticsConsentPolicy.ts`: approved configurable 180-day expiry and shared scope version.
- `src/lib/cloudflareConsent.ts`: narrowly scoped Cloudflare denied/unload transport guard.
- `src/lib/unsavedForm.ts`: native document-unload warning for dirty forms.
- `src/components/shared/CookieConsent.tsx`: shared service disclosure and cancellable withdrawal warning.
- `src/components/EventRegistrationForm.tsx`: dirty-state unload warning only.
- `src/components/ContactForm.tsx`: dirty-state unload warning only.
- `tests/googleTag.test.ts`: dual-service, persistence, expiry, transport and withdrawal safeguards.
- `tests/formSubmissionStates.test.tsx`: adapt test harness to unsaved-warning helper; existing transport assertions retained.
- `docs/prelaunch-consent-review.md`: this draft, decisions and staging test plan.

Earlier pending shared lazy-form integration/import changes remain untouched. The generated CMS bundle was restored; no CMS content/config change is included.


## Provider data retention — confirmed account review

These settings are separate from the 180-day browser preference and GA cookie lifetimes. Earlier authorised GA4 actions disabled activity reset and shortened user-level retention to 2 months, with values verified after reload. This Cloudflare review changed no account settings or application code.

### GA4 — account verified

- Account: **The Media Collective Events**, ID **412622003**.
- Property: **MediaCollectiveEvents**, ID **559747234**.
- Measurement ID: **G-4VZBFPC4S8**, confirmed in that property's Home view against the site's configured tag.
- Admin → Data collection and modification → Data retention: **event data = 2 months** (already set; preserved).
- **User data = 2 months** (changed from 14 months in the separately authorised GA4 task, saved and confirmed after reload).
- **Reset on new user activity = off** (changed from on, saved and verified after reloading the settings page).
- GA4's page states retention changes take effect after 24 hours and these controls do not affect most standard aggregated reporting.
- The blocking email-communications prompt was completed by saving the existing unchecked choices; no optional marketing subscriptions were enabled.

No further GA4 retention change is pending: both controls are 2 months and activity reset is off. Replace the site's old, unsupported blanket 26-month analytics statement with the confirmed provider-specific wording when publishing the reviewed policy. These saved values do not establish a deletion deadline for all aggregate reports.

### Cloudflare — account/site verified; published retention details remain provider documentation

Authenticated access was available in the user's connected **Chrome** profile. The older in-app-browser session still showed login; no credentials were entered, requested or handled.

Verified through visible Cloudflare account/site pages:

- Account label: **Chris@mediacollective.events's Account**.
- Account ID: **51050af92546cfdf185185a88e7cd9d7**.
- Product: **Observability → Analytics → Web analytics**, not edge HTTP analytics.
- Registered site / configured hostname: **mediacollective.events**.
- Site tag: **e4fde89eb9c14b679444e04712cc3c1b**.
- Installation: **JS Snippet installation**, with `static.cloudflareinsights.com/beacon.min.js` and token **5bf9c8154a3742a2a2373cf19d016170**, exactly matching `src/lib/analyticsConsent.ts`. This public beacon token is distinct from the site tag and is not an account credential.
- **Manage site** exposes the hostname, installation snippet, Delete, Cancel and Update; **no retention control was exposed on this screen**. The Update button remained disabled. No field or setting was changed.
- Account-specific total deletion deadline, backend retention and the availability of controls elsewhere remain **unverified**. Absence on the reviewed screen is not proof that no alternative account/support control exists.
- Read-only evidence: `/private/tmp/tmc-cloudflare-site-settings-confirmed.png`.

**Published provider documentation, not account-verified settings:** Cloudflare's current Web Analytics FAQ says unsampled beacon data is retained for **7 days**, then aggregated to around **10%** of its original volume for long-term storage; its reporting interface offers access to the **previous six months**. Neither statement proves that all data is deleted after 7 days or six months. The public FAQ does not establish a customer-selectable shorter retention control.

Remaining owner action: ask Cloudflare support for the total deletion/retention policy for raw and sampled/aggregated **Web Analytics** data for this account, and whether a shorter period can be configured outside the reviewed site screen. Request product-specific details rather than an edge-analytics or reporting-window answer. Keep the seven-day sampling and six-month reporting details labelled provider documentation. If a provider-controlled period is unsuitable, the owner must decide whether to retain or remove this optional service; no such change was made here.

References: https://support.google.com/analytics/answer/7667196 and https://developers.cloudflare.com/web-analytics/faq/ .

Agreed-decision pass changed `src/lib/analyticsConsentPolicy.ts`, `src/lib/analyticsConsent.ts`, `src/components/shared/CookieConsent.tsx`, `tests/googleTag.test.ts` and this draft. Boundary tests cover both choices at 180 days, changed versions, invalid timestamps and deletion of expired records. Full suite: 250/250 passed. Application and Node TypeScript, production build, 14-route payload and diff checks passed. Browser recheck: zero analytics resources on a fresh visit, one tag per provider and one initial GA view after acceptance, warning retained, and zero resources in a fresh saved-rejected document. No account settings were changed in that earlier implementation pass.


## Remaining-owner-actions follow-up

Only this Markdown draft changed in this review. Cloudflare account, site, Web Analytics product and token are verified; no retention control is exposed on Manage site. GA4 user-level and event retention are both confirmed at 2 months with reset off. Existing 180-day consent, external Google Fonts and deferred reCAPTCHA implementation remain unchanged. No account setting changed in this review. The real-domain staging checklist above still requires separate deployment approval.

Validation: `git diff --check` and review of the updated draft. No application code changes, so the already-passing 250-test suite, TypeScript, production build and payload checks were not rerun unnecessarily. No commit, push, deployment or site publication occurred.


## Signed-in Cloudflare review outcome

This follow-up reconciled outdated GA4 user-retention text and the former Cloudflare sign-in blocker. It verified the draft against the current consent policy/controller and registration/contact verification mount conditions without altering source. Cloudflare's published seven-day unsampled-data period, later aggregation (around 10%) and six-month reporting access are kept separate from account facts and any unverified deletion deadline. Only `docs/prelaunch-consent-review.md` was edited. No suite/build rerun was needed for this documentation-only update; whitespace/diff checks passed. Site code, fonts, reCAPTCHA, all account settings and production delivery were unchanged. Nothing committed, pushed, deployed or published.


## Reconciled staging candidate — 20 October 2026

Applied the approved service disclosures to `src/pages/PrivacyPolicy.tsx` and replaced its obsolete 26-month analytics claim with provider-specific retention wording. Cloudflare total deletion timing remains explicitly unverified; seven-day unsampled storage and six-month reporting access are not deletion promises. The policy date reflects this candidate update. Unrelated operational/legal statements were not re-audited or certified.

Reconciled current `staging` at `fa9f999784e5b31c1fadd67d969d850921032c53`, retaining its CMS target, FAQ bytes and deployment separation. Previous validation entries above are historical; the preparation report records validation of the reconciled candidate. No consent behaviour, account setting, font or reCAPTCHA implementation changed in this reconciliation. No commit, push or deployment occurred. IONOS SFTP confinement still requires the owner's signed-in hosting review.
