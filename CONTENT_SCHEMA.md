# Canvas Refine Kit Content Schema

This document describes the content structure used by the Canvas Refine Kit website so the assistant can make safe edits without inventing schema changes.

## Content locations

Primary content lives in:

- src/content/*.json
- src/content/sections/*.json
- src/content/blog/*.md
- src/content/events/*.md

The project does not use a single flat content model. Some pages use page-level JSON, some use section-specific JSON, and some blog/event entries use Markdown files.

## Key rules

- Preserve existing key names unless explicitly asked to change schema.
- Do not flatten section-based content into one file unless requested.
- Do not move Markdown content into JSON unless requested.
- Prefer minimal edits that match the current content model.
- When uncertain, inspect the provided file before suggesting new keys.

## Page-level JSON files

Examples include:

- homepage.json
- about.json
- faq.json
- settings.json
- blog.json
- blogPage.json
- blogPosts.json
- events.json
- eventsPage.json
- faqPage.json
- partners.json
- sponsors.json
- speakers.json
- site-settings.json

The assistant should not assume all of these have the same shape.

## Section JSON files

Section content may live in:

- src/content/sections/aboutIntro.json
- src/content/sections/aboutOverview.json
- src/content/sections/eventFormats.json
- src/content/sections/events.json
- src/content/sections/faqSection.json
- src/content/sections/forBrands.json
- src/content/sections/joinCommunity.json
- src/content/sections/joinUs.json
- src/content/sections/missionValues.json
- src/content/sections/newHere.json
- src/content/sections/ourStory.json
- src/content/sections/testimonials.json
- src/content/sections/valuePillars.json
- src/content/sections/whoAttends.json

These files are typically consumed by renderer or section components in src/components/sections/.

When editing section data:

- preserve object structure
- keep array item shapes consistent
- do not rename fields unless the component changes too

## Blog content

Blog content may come from both JSON and Markdown:

- src/content/blog.json
- src/content/blogPage.json
- src/content/blogPosts.json
- src/content/blog/*.md

Do not assume blog posts are stored in only one place.

Likely pattern:

- page-level blog settings live in JSON
- individual blog entries live in Markdown
- routing depends on slug values
- listing logic depends on useBlog.ts

When editing blog content:

- preserve slug stability
- do not change slug format unless requested
- keep expected listing fields intact
- preserve Markdown frontmatter structure if present

## Event content

Event content may come from both JSON and Markdown:

- src/content/events.json
- src/content/eventsPage.json
- src/content/events/*.md

Likely pattern:

- page-level event configuration in JSON
- event entries in Markdown
- detail rendering depends on useEvents.ts and EventDetails.tsx

When editing event content:

- preserve slug or id fields
- preserve date formats
- preserve location field structure

## Settings and site configuration

Shared site settings may exist in:

- settings.json
- site-settings.json

These may control:

- navigation
- footer
- CTAs
- labels
- brand metadata

Do not assume both files are interchangeable.

## CMS alignment rules

Decap CMS config lives in:

public/admin/config.yml

When suggesting CMS updates:

- match collection fields to real file structure
- distinguish JSON vs Markdown collections
- preserve frontend field names
- avoid redesigning collections unless requested

## Safe editing principles

When making edits:

1. Prefer updating existing files over creating new ones
2. Preserve schema shape
3. Keep JSON valid
4. Keep Markdown valid
5. Keep YAML valid
6. Ask for missing files instead of guessing

## Rendering relationship

Renderer components include:

- HomepageRenderer.tsx
- AboutPageRenderer.tsx
- BlogPageRenderer.tsx
- EventsPageRenderer.tsx
- FaqPageRenderer.tsx
- PartnersPageRenderer.tsx

Section components live in:

src/components/sections/

Content edits should normally target JSON or Markdown before changing components.

## Routing relationship

Routes are defined in App.tsx

Dynamic route:

/blog/:slug → BlogPost.tsx

Event detail routes may depend on slug values from Markdown or JSON entries.

When editing content affecting routing:

- preserve slug values
- maintain identifier consistency

## Assistant behavior guidance

When asked to update content:

1. identify whether the source is JSON, section JSON, blog Markdown, event Markdown, or settings JSON
2. propose the smallest valid edit
3. request missing files if schema cannot be confirmed
