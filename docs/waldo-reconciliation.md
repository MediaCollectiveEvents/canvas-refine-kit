# Waldo reconciliation — 5 November 2026

## Baseline and review location

Review: http://127.0.0.1:5174/
Isolated checkout: `/tmp/media-production-review`, branch `codex/production-review`.
Production base: `8404d674fa112f4eff6ab7c1375863747f82f4e1`, verified against the latest successful production workflow. The old working folder on port 5173 was behind production; its pending source files remain preserved and its preview server was stopped. No staging or production deployment was made during this reconciliation.

## Implemented and reconciled

- Homepage: live hero title/subtitle/body preserved, invitation action added, working `#next-event` target, next gathering before About, readable orientation text immediately, independent artwork cell with fade and aligned endpoint. Existing mobile responsive sources and matching preloads retained.
- Homepage OFF AIR: existing title and introduction precede its artwork in DOM/mobile reading order; desktop retains artwork beside content. Current published event details remain Soho House, White City, London, 14:00–18:00, 120 attendees. No event date, venue or time fields were edited in this checkout.
- Homepage audience: requested highlighted `300+` in existing introductory sentence; Community organisation list reused underneath, including the explicitly requested Skydance addition.
- Partners: existing hidden proof sections enabled and rendered near the top, using the current Community snapshot and existing parser. No new stats model or duplicated numeric content. Organisation names also come directly from Community.
- Invitation form: tighter responsive padding, gaps and progress spacing; removed the repeated attendance disclaimer whose meaning remains in DialogDescription and consent stage. Required semantics, name/organization/email autocomplete and existing custom validation retained. Privacy/consent wording and submission mapping preserved.
- Accessibility: invitation and contact controls describe errors only when error elements exist; labels retained; valid mobile navigation target kept mounted; short menu scrolls; mobile header reduced from 116/108px to 96/88px with matching page clearance; skip link and main focus targets added. Removed dangling cookie-settings aria-controls. Focus return and existing unsaved-form protection retained.
- Testimonials: existing production carousel retained; visible keyboard-operable Pause/Play; manual testimonial choice stops rotation; reduced-motion guard preserved. No testimonial copy changed.
- Events: production card layout retained, View/Hide past-events control exposes existing historical cards, historical card action reads View event. IDs 1 (6 May), 2 (13 May), 3 (12 September 2026) are completed under existing date logic.
- Past detail pages: shared action checks completion before partner/registration links and points to `/events` with View upcoming events. Completed generic sections use Event focus / Event format; future events keep published invitation actions. No invented next-edition relationship, IDs, routes, event dates or schema changes.
- Performance: existing responsive event delivery retained; restored only relevant existing WebP variants after confirming original PNG hashes match this production baseline. Sponsor delivery aliases preserve CMS paths and original assets. No new runtime dependencies.
- Event-updates integration: previously approved staging patch retained with existing lazy form loading, consent/cookie controls, anti-replay handling and server-validated CAPTCHA. No credentials included in the frontend or this patch. Live handler remains previously deployed Version 8.

## Audience source trace

`src/content/community.json`, section with ID `community-audience-snapshot`:
- heading line 1: `75 — C-suite guests`
- heading line 2: `321 — senior leaders*`
- heading line 3: `661 — unique guests across 6 events`
- body: `* Founder, Executive, President, Director, Head of Function or equivalent senior leadership titles.`

The existing `src/lib/audienceSnapshot.ts` parser supplies AuthorityStrip's metrics directly. The site owner explicitly requested “unique guests” on 5 November 2026. This clarification updates the shared Community source and both public renderings; it is owner-supplied, not independently deduced from attendance records.

Organisation names: `src/content/community.json`, `community-organisations.organisations` (38 names after requested Skydance addition). No new organisation-count or attendance claim was added.

## Copy and architecture guardrails

All production content JSON remains unchanged except the requested 300+ sentence, Skydance entry, unique-guests clarification and two existing Partners `hidden` flags. Live headings, body copy, testimonials, FAQ answers and event content remain intact. Necessary functional CTA/status and accessibility labels are documented above. The duplicated form disclaimer was removed without losing its meaning or consent requirements.

`covertage`, CTA capitalisation and repeated curated language remain as published under the user's later instruction to preserve live copy; they were not silently edited. The FAQ currently uses the production accordion and its existing questions; the older local report's claim that it was static does not apply. No old FAQ renderer was copied across.

No routes, event IDs/filenames, CMS collection/config, schemas, dependencies or package-lock changes.

## Content and external verification blockers

- OFF AIR confirmed individual speakers/hosts and timed running order: `speakers.json` has no items, `contributors.json` has no contributors, and OFF AIR has no confirmed person references or session times. Existing programme and host organisations (The Media Collective, Faultline, decodeTV) are already rendered. No people, biographies, placeholders or times were invented.
- Real-event photography: no new approval evidence was established in this reconciliation. Existing artwork remains; no stock/generated/placeholder photography was introduced. Candidate photos still need owner review and approval before publication.
- Real HubSpot submission and UK English double-opt-in email delivery: still unverified after the prior staging reCAPTCHA service connection failure. Localhost cannot complete the configured CAPTCHA. No bypass, fake token or success claim was used. Requires a real successful staging submission and receipt verification.
- Reduced-motion branches remain intact and covered by source/tests; a system reduced-motion browser run remains a manual verification item because the available browser control does not expose preference emulation.

These blockers mean the entire original UX review must not be described as fully completed or end-to-end verified.

## Validation

- All content JSON parses.
- Application TypeScript passes.
- Production build passes.
- 116 focused tests pass, covering subscription, attendance/contact handling, lazy form loading, privacy disclosures, performance/image delivery, current audience snapshot reuse, event data/detail/editorial pages and past CTA behaviour. Tests expecting superseded past registration CTAs and old image-size hints were updated to the intended behaviour. This is not a claim that every repository test was run.
- Staging deployment payload validates: 14 canonical shells, error shell, root routing file, sitemap and CMS.
- `git diff --check` passes.
- Browser: Home/Events/Partners checked at desktop and 375px mobile; no horizontal overflow. Mobile OFF AIR title/introduction before image and anchor work. Initial fields and Next fit at 375×812; short 375×476 dialog scrolls and keyboard Tab reaches Next. Native required/autocomplete/labels verified, active form/Partners ARIA references checked, close focus return works. Past event 1 has discovery links and no event-booking buttons; future OFF AIR retains invitation controls. Archive keyboard control and manual testimonial pause verified. No real form submitted during these local checks.
- No broken loaded images observed on checked pages. Existing responsive delivery preserved.

Build-generated `public/admin/cms.bundle.js` restored to exact baseline bytes. Do not commit an incidental generated bundle change. `dist` remains ignored build output, not source.

## Restored delivery variants

Existing originals remain unchanged. Variants were copied from the earlier local optimisation after matching original-source hashes; no new image generation or processing dependency was used.
| Original | Dimensions | Bytes | Delivery variant | Dimensions | Bytes | Reduction |
|---|---:|---:|---|---:|---:|---:|
| `public/uploads/website-hero-home.png` | 3600×2025 | 620,565 | `public/uploads/website-hero-home.webp` | 3600×2025 | 361,590 | 41.7% |
| `src/assets/events/broadcaster.png` | 1275×797 | 875,580 | `src/assets/events/broadcaster.webp` | 1275×797 | 413,048 | 52.8% |
| `src/assets/events/handandflower.png` | 1536×1024 | 1,074,068 | `src/assets/events/handandflower.webp` | 1536×1024 | 578,818 | 46.1% |
| `src/assets/events/traveller.png` | 1275×797 | 1,033,781 | `src/assets/events/traveller.webp` | 1275×797 | 499,090 | 51.7% |
| `src/assets/sponsors/dce-agency.png` | 1200×800 | 158,413 | `src/assets/sponsors/dce-agency.webp` | 600×400 | 36,176 | 77.2% |
| `src/assets/sponsors/giant-worldwide.png` | 1200×800 | 187,888 | `src/assets/sponsors/giant-worldwide.webp` | 600×400 | 45,094 | 76.0% |
| `src/assets/sponsors/rsg-media.png` | 1200×800 | 314,987 | `src/assets/sponsors/rsg-media.webp` | 600×400 | 80,042 | 74.6% |
| `src/assets/sponsors/zille.png` | 1200×800 | 526,180 | `src/assets/sponsors/zille.webp` | 600×400 | 65,664 | 87.5% |
| `src/assets/sponsors/Netactuate-Black-Logo-H (2).png` | 4800×1338 | 103,003 | `src/assets/sponsors/Netactuate-Black-Logo-H (2).webp` | 600×167 | 10,500 | 89.8% |
| `public/uploads/Venue tiles/Livepiano.png` | 1920×1920 | 1,705,285 | `public/uploads/Venue tiles/Livepiano.webp` | 1280×1280 | 497,802 | 70.8% |
