📘 Keyword System README
Global Taxonomy & Tagging Plan for the Canvas Refine Website
This document explains how the global keyword system works across the website and how editors and developers should use it.
The goal is to provide a single unified taxonomy that can reliably tag:

Blog posts
Events
Topic pages
Homepage sections
Technical documentation
Future dynamic filters and search experiences

All keyword logic is driven from src/content/keywords.json.

🎯 1. Purpose of the Keyword Plan
The keywords system solves three major challenges:
① Consistency
Instead of manually typing tags (which causes duplication and typos), all content uses canonical IDs from keywords.json.
② Cross‑event and cross‑domain alignment
We integrate themes across:

IBC 2026
MPTS 2026
DPP 2026
SMPTE metadata
Storytelling / Search
Personalised Media POCs

This ensures that one term like Generative AI means the same thing everywhere.
③ Future-ready structure
The hierarchical format supports:

Topic Page generation
Faceted search
‘Related content’ sections
Event filters
Decap CMS auto-suggest

🧱 2. File Structure: keywords.json
The file has two main sections:
A. keywords: The global list of canonical terms
Each item includes:

id — the stable internal identifier
label — the human-facing display text
themes — which theme(s) the keyword belongs to

Example:
JSON{ "id": "ai-generative", "label": "Generative AI", "themes": ["ai-automation"]}``Show more lines
B. themes: Hierarchical grouping
Each theme includes:

label — display label
global — the top universal keywords for that theme
events — how keywords map to IBC/MPTS/DPP/POC contexts

Example:
JSON"ai-automation": { "label": "AI & Automation", "global": ["ai-generative", "ai-agentic", "ai-automation"], "events": { "ibc2026": ["ai-generative"], "mpts2026": ["ai-generative", "ai-automation"], "dpp2026": ["ai-agentic", "ai-automation"] }}Show more lines
This lets the site know:

which keywords belong to which theme
which events talk about each concept
how to filter content properly

🏷 3. How to Tag Content
All content files (blog posts, homepage sections, event entries) support a keywordIds array.
Simply reference the canonical id values from keywords.json.
Example — blog.json
JSON{ "slug": "ai-in-media-2026", "title": "AI in Media: What 2026 Will Look Like", "keywordIds": ["ai-generative", "cloud-native-supply-chains", "personalisation"], "body": "<p>...</p>"}Show more lines
Example — events.json
JSON{ "name": "IBC 2026", "date": "2026-09-12", "keywordIds": ["ai-generative", "virtual-production", "content-monetisation"]}Show more lines

🧩 4. Where Keywords Are Used in the UI
The new keyword system enables:
Homepage

Topic highlights
Tag-driven featured content

Blog system (/blog)

Filters
“Related posts” based on shared tags

Events system

Filter by technology (e.g., “AI & Automation”)

Future Topic Pages
Automatically generated using theme data:
/topics/ai-automation
/topics/cloud-supply-chain
/topics/personalisation-experience

Decap CMS
Use the same canonical IDs for:

auto-suggest
select/multi-select widgets
preventing tag drift

🛠 5. How Developers Use It
Developers can load the keyword map in React:
TypeScriptimport keywordMap from "../content/keywords.json";const allKeywords = keywordMap.keywords;const themes = keywordMap.themes;Show more lines
From here you can:

Build filters
Build topic navigation
Display human-readable keyword labels
Match content to themes or events

🔍 6. How Editors Use It
Editors only need to remember:
➡ Always tag using keywordIds, not free text
➡ IDs come directly from keywords.json
➡ You can start with a few tags per piece of content (3–5 is ideal)
➡ No need to know theme names — IDs handle everything

🔄 7. Updating the Keyword Plan
If new themes emerge:

Add new keywords (with IDs and labels)
Assign them to a theme via the themes block
Optionally map to events
Update Decap CMS options for tagging (optional)

This ensures long-term consistency.

🧭 8. Why This Matters
A unified keyword system helps the site:

Connect content automatically
Improve search + discovery
Reduce editorial overhead
Scale to more events and topics
Power AI-driven recommendations later
Build dynamic topic pages without custom coding

It’s the backbone of a scalable media-tech knowledge platform.
