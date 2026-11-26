# Canvas Refine Kit Data Flow Guide

This document explains how content moves from source files into page renderers.

## Blog data flow

Blog content may originate from:

- src/content/blog/*.md
- blogPosts.json
- blogPage.json

Blog listing logic is handled by:

useBlog.ts

Blog detail routing is handled by:

BlogPost.tsx

Slug values must remain stable for routing to work.

## Events data flow

Event content may originate from:

- src/content/events/*.md
- events.json
- eventsPage.json

Event lookup logic is handled by:

useEvents.ts

Event detail pages use:

EventDetails.tsx

Preserve event identifiers when editing content.

## Section content flow

Section content originates from:

src/content/sections/*.json

Rendered by:

src/components/sections/

Examples:

HomepageRenderer.tsx
AboutPageRenderer.tsx
EventsPageRenderer.tsx
FaqPageRenderer.tsx
PartnersPageRenderer.tsx

Prefer editing section JSON before modifying components.

## Shared site configuration

Global settings may originate from:

settings.json
site-settings.json

These may control:

navigation
footer
CTA labels
branding text

Do not assume both files serve identical purposes.

## Safe editing rules

When modifying content:

1. identify the source file first
2. preserve slug values
3. preserve identifiers
4. preserve array structure
5. preserve renderer expectations


## Website invitations and event-update consent

On staging, attendance requests go through the Supabase `website-enquiry`
function into `portal_private.website_invitation_requests`. OFF AIR 2026
requests also appear as pending in the existing Event Hub owner invitation
queue. Contact and other enquiries still use Google Apps Script and Google
Sheets. Production website enquiries and invitation requests still use the
Google handler.

The staging function verifies Google reCAPTCHA and the staging hostname before
processing either form. When event-update signups are enabled, it writes the
email, request ID, received timestamp, consent wording and version to
`portal_private.event_update_consents` before forwarding the email and consent
to HubSpot. It records the provider outcome and processing time. A repeat of
an accepted request is acknowledged without resubmitting it. Pending or
ambiguous outcomes require manual review. A signup creates no invitation or
attendance record.

The Supabase record is evidence of consent at signup. HubSpot holds the
current subscription and suppression status. During retention reviews and
when handling withdrawals, reconcile the two by email and preserve the
minimum suppression record before deleting related data. Retain the form and
privacy notice versions that were shown at signup. For historical submissions,
include the Google Sheets intake and `EventUpdateRequests` audit in reviews
until their records have been reconciled and disposed of under the retention
schedule.

Staging newsletter delivery is enabled only for controlled testing. See the
[staging deployment guide](docs/staging-deployment.md) for the feature switch.
