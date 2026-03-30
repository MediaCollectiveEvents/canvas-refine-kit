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
