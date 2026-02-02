📘 Developer Onboarding Guide — Canvas Refine Kit
Welcome to the Canvas Refine Kit project.
This guide will help you get set up quickly, understand the architecture, and confidently contribute to the website.

🧰 1. Prerequisites
Before you begin, make sure you have:

Node.js 18+
npm or yarn
Git
VS Code (recommended)
GitHub Desktop (optional)
OneDrive (if syncing with M365 Copilot workflows)

Optional but helpful:

TailwindCSS IntelliSense (VS Code extension)
Prettier
ES7+ React Snippets

📦 2. Install & Run the Project
Clone the repo:
Shellgit clone https://github.com/MediaCollectiveEvents/canvas-refine-kit.gitcd canvas-refine-kitnpm installnpm run devShow more lines
The site runs at:
http://localhost:5173

🧱 3. Project Architecture
The codebase is structured for clarity, scalability, and CMS-driven content.
src/
├── assets/ # images, icons, logos
├── components/
│ ├── layout/ # Header, Footer
│ ├── sections/ # Homepage sections (About, Events, FAQ, Sponsors, etc.)
│ └── shared/ # PageHero, SectionHeader, PageCTA
├── content/ # JSON content used by the entire site
│ ├── homepage.json
│ ├── about.json
│ ├── faq.json
│ ├── settings.json
│ ├── blog.json
│ ├── events.json
│ ├── sponsors.json
│ ├── partners.json
│ └── speakers.json
├── pages/ # Top-level pages rendered by React Router
│ ├── Blog.tsx
│ ├── BlogPost.tsx
│ ├── Events.tsx
│ ├── Sponsors.tsx
│ ├── Partners.tsx
│ ├── Home.tsx
│ ├── About.tsx
│ ├── PrivacyPolicy.tsx
│ └── NotFound.tsx
├── App.tsx # Routing configuration
└── main.tsx # Entry point + BrowserRouter

🧩 4. Tech Stack Overview
The project uses:

React + TypeScript for UI
Vite for fast bundling
React Router v6 for routing
TailwindCSS for styling
Framer Motion for animations
JSON content architecture instead of markdown or databases
Decap CMS (public/admin) for optional visual editing

🧠 5. Content-Driven Architecture
All editable text, copy, links, lists, blog posts, events, and page settings are stored in JSON files under src/content.
This means:

Writers can update content without touching code
Developers only adjust structure / components
Decap CMS can edit everything through /admin

📄 6. Key Content Files and Their Purpose
homepage.json
Hero text, CTA, homepage sections.
about.json
Intro text + detailed body copy.
faq.json
FAQ items array:
JSON{ "question": "", "answer": "" }Show more lines
settings.json
Navigation + Footer configuration.
blog.json
All blog posts, including:

heroImage
category
excerpt
slug
body (HTML)

events.json
Homepage Events section.
sponsors.json
Sponsors page cards.
partners.json
Partners page cards.

🚦 7. Routing Rules
Routing is managed in src/App.tsx.
Key routes:
/ → Home
/about → About
/blog → Blog List
/blog/:slug → BlogPost dynamic page
/events → Events List
/sponsors → Sponsors
/partners → Partners
/privacy-policy → Privacy page

-                → 404 NotFound

To add a new page:

Create src/pages/NewPage.tsx
Add import + <Route> in App.tsx

🎨 8. UI Component System
Sections rely on shared components:

SectionHeader
PageHero
PageCTA
Card, Button
Tailwind utility classes

This ensures visual consistency across the site.

🛠 9. How to Update Content

Pick the JSON file (e.g., blog.json)
Edit the values
Save
Refresh the site

⚠ JSON is strict — no trailing commas, comments, or single quotes.

🪲 10. Debugging & Error Fixing
Common issues:
❌ White screen
Usually caused by invalid JSON.
❌ ts(2306)
A page/component is missing a default export.
❌ Module not found
Incorrect import path.
❌ 404 on /blog/:slug
The dynamic route is missing from App.tsx.
❌ Image not displaying
Path does not exist under src/assets.

⚙️ 11. CMS (Decap) Overview
Located at:
public/admin/

Key files:

index.html
config.yml

Collections map directly to JSON files in src/content.
Visit:
/admin

for the CMS interface (after authentication is set up).

🤝 12. Working With Microsoft 365 Copilot Agent
The project's Copilot Agent (“Website Manager”) is set up to:

Help update JSON content
Suggest code updates
Fix errors when you paste error messages
Generate new sections/pages
Follow the project’s architecture

Important:
Copilot cannot see your repo unless you paste code/JSON into the chat.
Use the Prompt Pack to drive tasks efficiently.

🚀 13. Contribution Workflow

Create a new branch:

Shellgit checkout -b feature/<name>``Show more lines

Make changes
Commit:

Shellgit commit -m "Describe your change"Show more lines

Push:

Shellgit push origin feature/<name>Show more lines

Open a Pull Request in GitHub

📬 14. Need to Add a New Section or Page?
Ask the Website Manager Copilot:
Generate a new section component called LeadershipSection using the same structure as AboutSection.

Or:
Help me add a new page /services. Show me the App.tsx update and a starter page component.

⭐ 15. Outstanding Tasks (As of Today)

Build dynamic Partners page
Add full body content to blog posts
Add /events/:slug detail pages
Wire nav + footer to settings.json
Add homepage “Value Sections”
Standardise layout spacing across sections

🎉 Welcome aboard!
You’re now fully set up to contribute effectively to the Canvas Refine Kit project.
Let me know if you'd like:

a designer onboarding guide
a content editor guide
a technical roadmap
or a testing checklist
