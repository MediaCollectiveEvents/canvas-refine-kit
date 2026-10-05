import { registerReferenceWidgets, type ReferenceWidgetCMS } from "./controls/ReferenceRelationControl";
import BlogPagePreview from "./previews/BlogPagePreview";
import ArticlesPreview from "./previews/ArticlesPreview";
import adaptPreview from "./React18PreviewAdapter";
// src/cms/preview.tsx

// 0) Make React global BEFORE anything else so Decap v3 portal can use it
import React from "react";
window.React = React;

// 1) Process shim early
import "./shim-process";

type PreviewProps = { entry: import("./previews/HomepagePreview").PreviewEntry };
interface CMSApi extends ReferenceWidgetCMS {
  registerPreviewTemplate(name: string, component: React.ComponentType<PreviewProps>): void;
  registerPreviewStyle(css: string, options: { raw: boolean }): void;
}

declare global {
  interface Window {
    CMS?: CMSApi;
    DecapCMS?: CMSApi;
    React?: typeof React;
  }
}

function getCMS(): CMSApi | undefined {
  return window.CMS || window.DecapCMS;
}

function waitForCMSReady(timeout = 10000, poll = 50): Promise<CMSApi> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function tick() {
      const cms = getCMS();
      if (cms && typeof cms.registerPreviewTemplate === "function") {
        resolve(cms);
        return;
      }
      if (Date.now() - start > timeout) {
        reject(new Error("CMS global not ready"));
        return;
      }
      setTimeout(tick, poll);
    })();
  });
}

import HomepagePreview from "./previews/HomepagePreview";
import { AboutPreview, FaqPreview, PartnersPreview } from "./previews/EditorialPagePreview";
import EventsPreview, { LegacyEventsPagePreview } from "./previews/EventsPreview";
import previewCss from "../index.css?inline";
import settings from "../content/settings.json";

async function boot() {
  console.log("[Decap Preview] waiting for CMS…");
  try {
    const CMS = await waitForCMSReady();
    console.log("[Decap Preview] CMS ready.");

    registerReferenceWidgets(CMS);
    CMS.registerPreviewTemplate("blogPosts", adaptPreview(ArticlesPreview));

    // Keep font imports first and use the same CSS/palette as the live pages.
    CMS.registerPreviewStyle(previewCss + `:root{--background-dark:${settings.palette.backgroundDark};--background-light:${settings.palette.backgroundLight}}`, { raw: true });

    // ✅ Homepage (your styled preview: hero + all homepage sections)
    CMS.registerPreviewTemplate("homepage", adaptPreview(HomepagePreview));
    CMS.registerPreviewTemplate("eventsContent", adaptPreview(EventsPreview));

    // Editorial previews reuse the current page renderers.
    CMS.registerPreviewTemplate("about", adaptPreview(AboutPreview));
    CMS.registerPreviewTemplate("faqPage", adaptPreview(FaqPreview));
    CMS.registerPreviewTemplate("eventsPage", adaptPreview(LegacyEventsPagePreview));
    CMS.registerPreviewTemplate("partnersPage", adaptPreview(PartnersPreview));
    CMS.registerPreviewTemplate("blogPage", adaptPreview(BlogPagePreview));

    console.log("[Decap Preview] templates registered.");
  } catch (err) {
    console.error("[Decap Preview] CMS not ready:", err);
  }
}

boot();
