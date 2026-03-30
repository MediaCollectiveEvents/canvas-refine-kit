# Canvas Refine Kit Routing Guide

This document explains how routing works in the Canvas Refine Kit website so the assistant can safely create pages and update navigation without breaking existing routes.

## Primary router location

All routes are defined in:

src/App.tsx

Do not assume routes exist unless they appear in App.tsx or are explicitly provided.

When adding a new page:

1. create the page component in src/pages/
2. import the page into App.tsx
3. register a new <Route> entry

Both steps are required.

## Known page components

Pages live in:

src/pages/

Examples include:

- Home.tsx
- About.tsx
- Blog.tsx
- BlogPost.tsx
- Events.tsx
- EventDetails.tsx
- FAQ.tsx
- Partners.tsx
- PrivacyPolicy.tsx
- Admin.tsx
- Maintenance.tsx
- Wireframe.tsx
- NotFound.tsx

Do not create duplicate pages unless requested.

## Dynamic blog routing

Dynamic blog routing uses:

/blog/:slug

Handled by:

BlogPost.tsx

Slug values typically originate from:

src/content/blog/*.md
or
blogPosts.json

When editing blog entries:

- preserve slug values
- do not rename slug fields unless routing logic is updated
- ensure new blog posts include a slug-compatible identifier

## Blog listing route

Blog listing page:

/blog

Handled by:

Blog.tsx

Content may come from:

blog.json
blogPage.json
blogPosts.json
useBlog.ts

Do not assume a single source of truth.

## Event detail routing

Event detail pages likely use:

EventDetails.tsx

Slug or ID fields may originate from:

src/content/events/*.md
or
events.json

When editing event entries:

- preserve slug or id fields
- maintain date formatting
- maintain location structure

Event routing logic may depend on:

useEvents.ts

Check this file if event lookups fail.

## Section renderer routing pattern

Many pages use renderer components:

- HomepageRenderer.tsx
- AboutPageRenderer.tsx
- BlogPageRenderer.tsx
- EventsPageRenderer.tsx
- FaqPageRenderer.tsx
- PartnersPageRenderer.tsx

These render content-driven layouts from JSON.

Prefer editing JSON before modifying renderer logic.

## NotFound route

Fallback route:

NotFound.tsx

Should remain last in route order if present.

Do not remove unless explicitly requested.

## Adding a new page safely

Steps:

1. create new file in src/pages/
2. export default component
3. import into App.tsx
4. register <Route path="/new-page" element={<NewPage />} />

Do not modify existing routes unless requested.

## Navigation updates

Navigation links may live in:

settings.json
site-settings.json

Do not hardcode navigation changes into Header.tsx unless confirmed.

Prefer updating content configuration files first.

## CMS interaction with routing

Decap CMS config:

public/admin/config.yml

When adding content collections:

- ensure slug fields match route expectations
- ensure folder paths match actual content locations
- do not rename existing collections unless requested

## Safe routing edit principles

When modifying routing:

1. preserve existing paths
2. preserve slug-based dynamic routes
3. avoid renaming route paths silently
4. avoid removing routes unless instructed
5. confirm App.tsx before suggesting route edits

If App.tsx is not provided, request it before making routing changes.
