# Media Collective: focused site review

## Existing data flow

- `public/admin/config.yml` defines Decap's homepage and partners file collections. Field names, collections, section types, ordering and routes are unchanged.
- Homepage: `src/content/homepage.json` → `Home.tsx` → `PageHero.tsx` and `HomepageRenderer.tsx`. The renderer selects components by section type and respects hidden sections.
- Audience evidence: `sections[].statistics` and `highlights` now render directly in `WhoAttendsSection.tsx`; previously its content was hardcoded. Placeholder punctuation is omitted. Existing claims have been retained, not independently verified.
- Homepage events: `src/content/events.json` → `EventsSection.tsx`; homepage section content supplies headings, notes and CTAs. The `/events` page uses the same JSON file. Dates and the existing `past` status determine homepage eligibility; with no upcoming dates, three recent gatherings appear instead.
- Partners: `src/content/partners.json` → `Partners.tsx` → `PageHero.tsx` and `PartnersPageRenderer.tsx`. The renderer still owns the existing logo, benefit and package arrays. The primary hero CTA now respects `primaryCta`, with legacy `cta` fallback.
- `/register` is an existing content convention that opens `EventRegistrationForm`, not an application route. Other CTA destinations remain links.

## Changes in this pass

CMS audience credentials replace decorative hardcoded counters. The home and partners heroes opt into compact, legible business typography; other pages keep the classic presentation. Secondary hero CTAs now render, giving the homepage a direct partners journey. Partner enquiry wording is consistent across the hero, packages and closing CTA. The unsupported numeric reach claim has been removed. Event cards link to the existing events page, provide absolute share URLs, avoid placeholder summaries and do not assume complimentary admission. Homepage SEO title and description now read existing CMS content.

## Proposed follow-up work — not implemented

1. Reconcile event sources. The listing uses `events.json`, while event details reads `content/events/*.json`; other helpers read Markdown. First agree which collection is authoritative, then map existing IDs without changing public routes or CMS field names.
2. Fix event detail lookup. The existing `/events/:id` route supplies `id`, but `EventDetails.tsx` reads `eventId`. This can be repaired without altering the route after confirming the intended detail source.
3. Refresh registration choices. The existing form lists 2025 events and has separate IDs. Confirm current options and submission expectations before connecting it to event content.
4. Confirm event copy. IBC BREAKFAST has a Eurostar/Greenline summary but a Traveller venue; do not invent a correction. Confirm package promises and audience credentials with the content owner.
5. Align Decap preview with production rendering. The preview currently has a separate hero and section mapping, including `UpcomingEventsIntroSection` rather than `EventsSection`. Reuse production components in a dedicated follow-up, preserving the editing workflow.

## Validation

Closeout validation passes: targeted ESLint on all eight changed TSX files, the production Vite build and `git diff --check`. Homepage and partners rendering were visually verified at 1440px desktop and 390px mobile. Primary invitation and partnership CTAs, a package enquiry CTA, event disclosure expansion/collapse and homepage-to-partners navigation work. No form was submitted. Decap editing and preview alignment remain untested.

Repository-wide lint reported 187 problems (151 errors, 36 warnings) before edits; closeout reports 166 problems (130 errors, 36 warnings) outside the passing targeted check. TypeScript checking still stops at existing TS1109 and TS1434 syntax errors in `EventFormatsSection.tsx`, line 8. The build retains outdated Browserslist data and bundle-size warnings. Type-only renderer annotations were corrected during closeout without changing runtime behaviour. The user's staged `vite.config.ts` change is excluded from the redesign commit.
