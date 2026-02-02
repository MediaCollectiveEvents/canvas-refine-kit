Developer README – Canvas Refine Kit
This document provides developers with a complete overview of the Canvas Refine Kit project — its structure, workflows, content model, and development guidelines.

🚀 Project Overview
Canvas Refine Kit is a React + Vite + TypeScript website with a JSON‑driven content architecture and optional Decap CMS for editing via /admin.
The project uses:

React Router v6 (routing)
TailwindCSS (design system)
Framer Motion (animations)
ShadCN / custom UI components (Cards, Buttons, SectionHeader)
JSON content files (src/content/\*.json)
Static images stored in src/assets/\*\*
Dynamic pages for Blog & Events

The site is designed to be fully content-driven, with editors eventually managing content via Decap CMS.

📁 Folder Structure
src/
├── assets/ # images, logos, blog images, event images
├── components/
│ ├── layout/ # Header, Footer
│ ├── sections/ # About, Events, FAQ, Sponsors, etc.
│ └── shared/ # PageHero, PageCTA, SectionHeader
├── content/ # JSON content (CMS-ready)
│ ├── homepage.json
│ ├── about.json
│ ├── faq.json
│ ├── settings.json
│ ├── events.json
│ ├── blog.json
│ ├── sponsors.json
│ ├── partners.json
│ └── speakers.json
├── pages/ # Top-level route pages
│ ├── Home.tsx
│ ├── About.tsx
│ ├── Blog.tsx
│ ├── BlogPost.tsx
│ ├── Events.tsx
│ ├── Sponsors.tsx
│ ├── Partners.tsx
│ ├── PrivacyPolicy.tsx
│ └── NotFound.tsx
├── App.tsx # Routing configuration
└── main.tsx # App bootstrap with BrowserRouter

🛠 Tech Stack
Core

Vite
React (TypeScript)
React Router DOM
TailwindCSS
Framer Motion

Content Layer

JSON-based content model in src/content/
No markdown loader required
Structured for Decap CMS compatibility

CMS

Decap CMS shell available at:
public/admin/index.html
public/admin/config.yml

✨ Content Architecture
All editable website data is located in:
src/content/\*.json

Examples:
Homepage
JSON{ "heroTitle": "...", "heroSubtitle": "...", "sections": []}Show more lines
Blog Posts
blog.json contains all posts including full body content.
Events
events.json stores event cards for the homepage Events section.
FAQ
faq.json stores array of question/answer objects.
Sponsors / Partners
Dynamic pages read from sponsors.json and partners.json.

🧭 Routing
Routing is defined in src/App.tsx:
TypeScript<Routes> <Route path="/" element={<Home />} /> <Route path="/about" element={<About />} /> <Route path="/blog" element={<Blog />} /> <Route path="/blog/:slug" element={<BlogPost />} /> <Route path="/events" element={<Events />} /> <Route path="/sponsors" element={<Sponsors />} /> <Route path="/partners" element={<Partners />} /> <Route path="/privacy-policy" element={<PrivacyPolicy />} /> <Route path="\*" element={<NotFound />} /></Routes>Show more lines
Dynamic routing is used for:

/blog/:slug
/events/:slug (future option)

🖼 Working With Images
All images live under:
src/assets/

Common folders:

/blog/ – blog hero images
/events/ – event venue images
/sponsors/ – sponsor logos

Ensure all paths in JSON content match actual files.
Example:
JSON"heroImage": "/src/assets/blog/ai-innovation.jpg"Show more lines

🔧 Local Development
Install dependencies:
Shellnpm installShow more lines
Start development server:
Shellnpm run devShow more lines
Build:
Shellnpm run buildShow more lines
Preview production build:
Shellnpm run previewShow more lines

🧪 Common Pitfalls + Fixes
❌ White Screen / Blank Page
Usually due to:

Invalid import path
Missing default export in a page file
Invalid JSON in src/content/\*.json

Check browser console + terminal.

❌ JSON Import Fails
Ensure tsconfig.json contains:
JSON"resolveJsonModule": true,"esModuleInterop": true``Show more lines

❌ Dynamic route shows 404
Confirm:
TypeScript<Route path="/blog/:slug" element={<BlogPost />} />Show more lines
And that BrowserRouter wraps <Routes>.

❌ Images not showing
Path likely incorrect or file missing.
Check folder + extension.

🧩 CMS Integration (Decap)
Admin interface is located at:
/public/admin/index.html

CMS configuration:
public/admin/config.yml

Content types map directly to JSON files in src/content/.
To enable editing later, configure GitHub authentication for Decap CMS.

🎨 UI Components
Shared components follow the design system:

SectionHeader
PageHero
PageCTA
Card, Button
Motion wrappers

Developers should reuse these for consistency.

💡 Extending the Site
Typical tasks include:

Adding new sections → create SectionNameSection.tsx in components/sections
Adding content → update JSON in src/content
Adding routes → update App.tsx
Adding new blog posts → update blog.json
Adding new events → update events.json

📦 Deployment
This project is ready for deployment to:

IONOS Deploy Now
Netlify
GitHub Pages (via static build)
Vercel (with vite config tweaks)

Build output goes to:
dist/

🙋🏻 Additional Developer Notes

Avoid comments in JSON files
Ensure all page files export a default component
Keep routing clean and shallow
Prefer JSON-based content over embedding copy in JSX
Use Tailwind utility classes for layout + spacing

🎯 Final Notes
This project is now fully aligned with a content-first, CMS-ready, and developer-friendly architecture.
All major sections are dynamic, pages are structured, and routing is clean and maintainable.
If extending this README, consider adding:

CMS editor guide
Component catalogue
Code style guidelines
Deployment instructions
