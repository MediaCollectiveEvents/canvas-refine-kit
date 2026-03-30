# Canvas Refine Kit CMS Collections Guide

This document explains how Decap CMS collections should align with the Canvas Refine Kit content structure.

## CMS config location

Decap CMS config lives at:

public/admin/config.yml

When editing CMS config:
- preserve existing collection names unless explicitly asked to rename them
- keep paths aligned with the real repo structure
- do not convert file collections to folder collections unless requested
- do not change slug logic unless routing is updated too

## Content sources the CMS may manage

Content in this project may exist in:

- src/content/*.json
- src/content/sections/*.json
- src/content/blog/*.md
- src/content/events/*.md

The CMS should reflect this mixed structure rather than assuming everything is a flat JSON file.

## Likely collection types

### 1. File-based JSON collections

Use file-based collections for singleton or page-config content such as:

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

Use a file collection when:
- the content is a single known file
- the page is configured from one JSON document
- the editor should open a specific file directly

### 2. Folder-based Markdown collections

Use folder collections for repeatable content entries such as:

- src/content/blog/*.md
- src/content/events/*.md

Use a folder collection when:
- there are multiple entries in the same directory
- each entry is its own Markdown file
- slug generation matters

## Slug and routing rules

### Blog posts

Blog detail pages use slug-based routing:

/blog/:slug

Handled by:

BlogPost.tsx

Therefore, blog CMS entries must preserve:
- stable slugs
- predictable filenames
- any frontmatter fields used by useBlog.ts or BlogPost.tsx

Do not change slug templates unless the frontend route logic is updated.

### Event entries

Event detail pages may depend on slug or id fields read by:
- useEvents.ts
- EventDetails.tsx

Therefore, event CMS entries must preserve:
- stable identifiers
- consistent date fields
- location fields expected by the frontend

## Media rules

Media assets currently appear under:

- public/uploads/
- public/admin/uploads/

When editing CMS config:
- preserve the current media path pattern unless explicitly asked to consolidate it
- ensure public-facing paths work with the frontend
- do not invent a new media folder structure

If the existing config already defines media_folder and public_folder, prefer preserving those values.

## Field design rules

When defining CMS fields:
- mirror the actual frontend schema
- preserve existing key names
- do not flatten nested objects unless requested
- keep repeatable arrays as list/widget structures
- keep rich text fields compatible with the current renderer

For JSON-backed files:
- match the exact JSON shape used by the frontend

For Markdown-backed collections:
- preserve frontmatter fields expected by hooks and page components

## Safe collection design principles

1. Prefer the smallest config change.
2. Match real file paths exactly.
3. Keep collection labels human-readable.
4. Keep field names aligned with frontend code.
5. Preserve slug consistency.
6. Do not redesign the editorial workflow unless requested.

## Assistant guidance for CMS tasks

When asked to update config.yml:

1. identify whether the content source is:
   - singleton JSON file
   - section JSON file
   - blog Markdown folder
   - events Markdown folder

2. choose the correct collection type:
   - files collection for singleton JSON
   - folder collection for repeatable Markdown entries

3. preserve:
   - media paths
   - field names
   - slug logic
   - collection names where possible

4. if the actual config.yml is not provided, ask for it before making structural CMS changes

## Recommended CMS mental model for this project

- Page configuration content is often best represented as file-based collections
- Repeatable blog and event entries are best represented as folder-based Markdown collections
- Section JSON may be exposed as either:
  - separate file entries in a files collection
  - or left unmanaged if the current CMS does not expose them

Do not assume every section JSON file is already wired into Decap CMS.

## Common mistakes to avoid

- pointing a collection at the wrong folder
- using Markdown fields for JSON files
- renaming slug fields without updating routes
- changing media_folder/public_folder without checking existing assets
- exposing JSON fields with the wrong nesting
- assuming blogPosts.json and blog/*.md are interchangeable
- assuming events.json and events/*.md are interchangeable

## If config.yml is missing

If the user asks for CMS collection changes but has not provided public/admin/config.yml, request that file before proposing a full structural rewrite.
