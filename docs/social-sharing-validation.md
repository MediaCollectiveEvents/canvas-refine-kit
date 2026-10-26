# Social-sharing metadata audit and generated HTML validation

Social-sharing configuration and generated HTML verification. Deployment is authorized separately; see the release workflow for deployment status.

## Cause

`src/lib/seoHead.ts` previously used `homepageContent.seo.ogImage` as the fallback for both `og:image` and `twitter:image`. Community, Events, Partners, FAQ and Privacy inherited `/uploads/chatgpt-image-mar-23-2026-10_58_36-am.png`; Home selected it explicitly. Static heads and React Helmet both use this function, so the unwanted image was present in the actual crawler-visible HTML, not just a preview cache.

## Default image and overrides

Explicit default: `https://mediacollective.events/uploads/media-collective-social-default.png`. This is the supplied `MediaCollectiveSocial.png` (1200×630), copied byte-for-byte without generation, cropping or resizing. It replaces the provisional logo fallback.

Home retains its existing `seo.ogImage` override field, now set to the brand fallback. Event routes `/events/1` through `/events/8` retain `socialImage` first, then the existing event-image mapping. No current event sets `socialImage`; the event artwork is used. Standard pages never fall back to hero artwork. Existing explicit HTTP(S) image URLs are supported; unsafe schemes, embedded credentials, empty and malformed URLs use the brand fallback. No CMS schema or routing changes.

## Verification

All 14 canonical generated HTML heads contain exactly one of every required tag. Titles, descriptions, canonicals and parsed JSON-LD match the baseline exactly. Both image tags agree and every generated image URL is absolute with an existing corresponding build asset. Full suite: 285 passed. Application/Node TypeScript, production build and deployment-payload validation passed.

## Generated tags for requested routes

### /

```html
<meta property="og:title" content="Media &amp; Broadcast Events — The Media Collective">
<meta property="og:description" content="Curated events for people working across broadcasting, streaming and media technology. Explore the programme and request an invitation.">
<meta property="og:url" content="https://mediacollective.events/">
<meta property="og:type" content="website">
<meta property="og:image" content="https://mediacollective.events/uploads/media-collective-social-default.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Media &amp; Broadcast Events — The Media Collective">
<meta name="twitter:description" content="Curated events for people working across broadcasting, streaming and media technology. Explore the programme and request an invitation.">
<meta name="twitter:image" content="https://mediacollective.events/uploads/media-collective-social-default.png">
```

### /community

```html
<meta property="og:title" content="Media &amp; Technology Community — The Media Collective">
<meta property="og:description" content="See who attends Media Collective events, from broadcasters and studios to streaming and technology businesses, and how invitations work.">
<meta property="og:url" content="https://mediacollective.events/community">
<meta property="og:type" content="website">
<meta property="og:image" content="https://mediacollective.events/uploads/media-collective-social-default.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Media &amp; Technology Community — The Media Collective">
<meta name="twitter:description" content="See who attends Media Collective events, from broadcasters and studios to streaming and technology businesses, and how invitations work.">
<meta name="twitter:image" content="https://mediacollective.events/uploads/media-collective-social-default.png">
```

### /events

```html
<meta property="og:title" content="Upcoming Media &amp; Broadcast Events — The Media Collective">
<meta property="og:description" content="Browse upcoming discussions, breakfasts, receptions and social events, plus independent partner events. Find dates, locations and attendance details.">
<meta property="og:url" content="https://mediacollective.events/events">
<meta property="og:type" content="website">
<meta property="og:image" content="https://mediacollective.events/uploads/media-collective-social-default.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Upcoming Media &amp; Broadcast Events — The Media Collective">
<meta name="twitter:description" content="Browse upcoming discussions, breakfasts, receptions and social events, plus independent partner events. Find dates, locations and attendance details.">
<meta name="twitter:image" content="https://mediacollective.events/uploads/media-collective-social-default.png">
```

### /partners

```html
<meta property="og:title" content="Event Partnerships — The Media Collective">
<meta property="og:description" content="Explore ways to support Media Collective events, build your presence and contribute to discussion-led programmes where the format allows.">
<meta property="og:url" content="https://mediacollective.events/partners">
<meta property="og:type" content="website">
<meta property="og:image" content="https://mediacollective.events/uploads/media-collective-social-default.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Event Partnerships — The Media Collective">
<meta name="twitter:description" content="Explore ways to support Media Collective events, build your presence and contribute to discussion-led programmes where the format allows.">
<meta name="twitter:image" content="https://mediacollective.events/uploads/media-collective-social-default.png">
```

### /faq

```html
<meta property="og:title" content="Event FAQs — The Media Collective">
<meta property="og:description" content="Answers about invitations, attendance, event costs, partnerships and how guest contact details are used at The Media Collective.">
<meta property="og:url" content="https://mediacollective.events/faq">
<meta property="og:type" content="website">
<meta property="og:image" content="https://mediacollective.events/uploads/media-collective-social-default.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Event FAQs — The Media Collective">
<meta name="twitter:description" content="Answers about invitations, attendance, event costs, partnerships and how guest contact details are used at The Media Collective.">
<meta name="twitter:image" content="https://mediacollective.events/uploads/media-collective-social-default.png">
```

### /events/4

```html
<meta property="og:title" content="OFF AIR: The Unfiltered Future of Media — The Media Collective">
<meta property="og:description" content="An invitation-only forum exploring media technology, business models and strategy at Soho House, London, on 24 November 2026.">
<meta property="og:url" content="https://mediacollective.events/events/4">
<meta property="og:type" content="website">
<meta property="og:image" content="https://mediacollective.events/uploads/off-air.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="OFF AIR: The Unfiltered Future of Media — The Media Collective">
<meta name="twitter:description" content="An invitation-only forum exploring media technology, business models and strategy at Soho House, London, on 24 November 2026.">
<meta name="twitter:image" content="https://mediacollective.events/uploads/off-air.png">
```

## Social-preview caches

Previously cached social previews can retain the old image after updated HTML is published. After deployment, request a fresh inspection of `/community` and any previously shared routes in LinkedIn Post Inspector and Meta Sharing Debugger. Other services may keep cached cards; existing posts/messages may retain their original preview. A cache refresh must follow deployment of the corrected HTML.

- LinkedIn: https://www.linkedin.com/post-inspector/
- Meta: https://developers.facebook.com/tools/debug/
