CMS Editor Guide – Canvas Refine Kit
This guide explains how to manage website content for The Media Collective using the content files inside the project.
All website text, images, lists, articles, events, sponsors and page settings are editable — no coding required.

🧭 Where Content Lives
All editable website content lives in:
src/content/

This folder contains JSON files that control each section of the website.
Important files:

FileWhat it Controlshomepage.jsonHome hero text, homepage sectionsabout.jsonAbout section copyfaq.jsonFAQ questions + answerssettings.jsonNavigation items + Footer contentevents.jsonUpcoming Events on homepageblog.jsonBlog list + full article contentsponsors.jsonSponsors pagepartners.jsonPartners pagespeakers.jsonFuture speakers section
Updating these files updates the website instantly after deployment.

✏️ How to Edit Content (General Rules)

1. Open the file you want to edit
   Example:
   src/content/about.json

All content is stored in plain English inside the JSON. 2. Update the text inside the quotes
Example:
JSON"title": "About Us"Show more lines
Change to:
JSON"title": "Who We Are"Show more lines 3. Save the file
Your changes will appear on the site after deployment.

⚠️ JSON Editing Rules (Important)
JSON is very strict. Follow these rules:

Use double quotes only → "text"
Do not remove commas unless it's the last item
No trailing commas at the end of objects
No comments allowed (no // or /_ … _/)
Don’t change field names, only the text on the right side

If JSON is invalid, the site will not build — VS Code will show red errors.

📝 Editing Specific Content Types

1. Homepage
   src/content/homepage.json

Controls:

Hero title
Hero subtitle
Button label / link
Homepage sections list

Example:
JSON"heroTitle": "Curated Events","heroSubtitle": "Exclusive networking events...",Show more lines

2. About Page
   src/content/about.json

Controls:

About page headline
Accent word
Intro paragraph
Main body text

Supports basic HTML for paragraphs if needed.

3. FAQ Section
   src/content/faq.json

Add, edit or reorder questions and answers.
Example:
JSON{ "question": "Who are the events for?", "answer": "Senior executives, founders and media leaders."}Show more lines

4. Blog Posts
   src/content/blog.json

Each blog article contains:

title
category
date
excerpt
heroImage
author
body → full article HTML

Example body:
JSON"body": "<p>Networking doesn't have to be awkward...</p><h2>1. Start with intent</h2>"Show more lines

The body supports HTML, so paragraphs, headings, bold, lists, etc.
A Markdown version can be added later.

5. Events (Upcoming Events Section)
   src/content/events.json

Each event should include:

title
location
venue
imageKey (used to match venue images)

Example:
JSON{ "title": "IBC Breakfast", "location": "RAI, Amsterdam", "venue": "The Traveller", "imageKey": "traveller"}Show more lines
Edit or reorder events to change the homepage.

6. Sponsors
   src/content/sponsors.json

Each sponsor has:

name
tier
logo
description
website URL

Updating this updates the Sponsors page.

7. Navigation & Footer
   src/content/settings.json

Navigation:
JSON"nav": [ { "label": "Home", "href": "/" }, { "label": "Blog", "href": "/blog" }]Show more lines
Footer:
JSON"footer": { "text": "© 2026 The Media Collective", "showEventsInFooter": false}Show more lines
Changing these updates the live site automatically.

🖼 Images
Store images in:
src/assets/

Examples:
src/assets/blog/
src/assets/events/
src/assets/sponsors/

Then refer to them in JSON:
JSON"heroImage": "/src/assets/blog/ai-innovation.jpg"Show more lines
Paths must match exactly.

🚀 Publishing Changes
If using GitHub:

Commit changes to JSON files
Push to the main branch
IONOS Deploy Now automatically rebuilds and deploys the site
Live website updates with your changes

No extra work required.

👥 Editing via CMS (when enabled)
When Decap CMS authentication is set up:
Go to:
/admin

You will be able to edit:

Homepage
About
FAQ
Blog posts
Events
Sponsors / Partners
Settings (nav + footer)

Using a friendly UI instead of editing JSON manually.

❓ Need Help?
If anything breaks:

Look for red error messages in VS Code
Validate JSON using https://jsonlint.com/
Check that the file path to images is correct
Make sure each JSON object is separated with commas

If you need assistance with content structure, adding new fields, or building new pages, contact the technical owner or developer.
