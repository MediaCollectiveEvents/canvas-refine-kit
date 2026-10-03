import { registerReferenceWidgets, type ReferenceWidgetCMS } from "./controls/ReferenceRelationControl";
import BlogPagePreview from "./previews/BlogPagePreview";
import ArticlesPreview from "./previews/ArticlesPreview";
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

function pickExport<T>(mod: Record<string, unknown>, named: string): T {
  return (mod.default || mod[named]) as T;
}

function toJS(value: unknown): unknown {
  if (value && typeof value === "object" && "toJS" in value && typeof value.toJS === "function") return value.toJS();
  return value;
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

/* ------------------------------------------------------------------ */
/* 3) IMPORTS (NOTE the depth: preview.tsx is in src/cms/,            */
/*    so components are at ../components/… not ../../components/…)    */
/* ------------------------------------------------------------------ */

// Layout helpers (default or named)
import * as SectionWrapperMod from "../components/layout/SectionWrapper";
import * as SectionDividerMod from "../components/shared/SectionDivider";
const SectionWrapper = pickExport<typeof SectionWrapperMod.default>(SectionWrapperMod, "SectionWrapper");
const SectionDivider = pickExport<typeof SectionDividerMod.default>(SectionDividerMod, "SectionDivider");

// Generic site sections (used by non‑homepage pages)
import * as AboutIntroMod from "../components/sections/AboutIntroSection";
import * as MissionValuesMod from "../components/sections/MissionValuesSection";
import * as FAQSectionMod from "../components/sections/FAQSection";
const AboutIntro = pickExport<React.ComponentType<GenericSectionProps>>(AboutIntroMod, "AboutIntroSection");
const MissionValues = pickExport<React.ComponentType<GenericSectionProps>>(MissionValuesMod, "MissionValuesSection");
const FAQSection = pickExport<React.ComponentType<GenericSectionProps>>(FAQSectionMod, "FAQSection");

// Styled homepage preview (hero + all homepage sections)
import HomepagePreview, { PartnersPreview } from "./previews/HomepagePreview";
import EventsPreview from "./previews/EventsPreview";
import previewCss from "../index.css?inline";
import settings from "../content/settings.json";

/* ------------------------------------------------------------------ */
/* 4) Map for generic sections pages (homepage uses HomepagePreview)   */
/* ------------------------------------------------------------------ */
interface GenericSection {
  type?: string;
  settings?: {
    style?: Partial<React.ComponentProps<typeof SectionWrapper>> & { fades?: boolean };
    divider?: { enabled?: boolean; variant?: string };
  };
  [key: string]: unknown;
}
type GenericSectionProps = { section: GenericSection; settings: GenericSection["settings"] };

const SECTION_MAP: Record<string, React.ComponentType<GenericSectionProps>> = {
  aboutIntro: AboutIntro,
  missionValues: MissionValues,
  faqSection: FAQSection,
};

/* ------------------------------------------------------------------ */
/* 5) Generic SectionsPreview (aboutPage, faqPage, eventsPage, …)      */
/* ------------------------------------------------------------------ */
export function SectionsPreview({ entry }: PreviewProps) {
  try {
    const data = (toJS(entry.getIn(["data"])) || {}) as { sections?: GenericSection[] };
    const sections = data.sections || [];

    return (
      <div style={{ background: "#020617", minHeight: "100vh", color: "white" }}>
        {sections.map((section: GenericSection, index: number) => {
          const Cmp = SECTION_MAP[section?.type as string];
          if (!Cmp) {
            return (
              <div key={index} style={{ padding: 20, color: "#f87171" }}>
                Unknown section type: <strong>{section?.type}</strong>
              </div>
            );
          }

          const settings: NonNullable<GenericSection["settings"]> = section?.settings || {};
          const style = settings?.style || {};
          const divider = settings?.divider || {};
          const withFades = (style.fades !== false) && !divider.enabled;

          return (
            <React.Fragment key={index}>
              <SectionWrapper
                variant={style.variant ?? "clean"}
                padding={style.padding ?? "lux"}
                noise={!!style.noise}
                grid={!!style.grid}
                withFades={withFades}
              >
                <Cmp section={section} settings={settings} />
              </SectionWrapper>

              {divider.enabled ? (
                <SectionDivider
                  className="max-w-[1280px] mx-auto px-6 md:px-10"
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    );
  } catch (err) {
    console.error("[Decap Preview] render error:", err);
    return (
      <div style={{ padding: 20, color: "#f87171" }}>
        Preview render error: {String(err instanceof Error ? err.message : err)}
      </div>
    );
  }
}

/* ------------------------------------------------------------------ */
/* 6) Boot and register previews                                       */
/* ------------------------------------------------------------------ */
async function boot() {
  console.log("[Decap Preview] waiting for CMS…");
  try {
    const CMS = await waitForCMSReady();
    console.log("[Decap Preview] CMS ready.");

    registerReferenceWidgets(CMS);
    CMS.registerPreviewTemplate("blogPosts", ArticlesPreview);

    // Minimal preview CSS
    const css =
      "body{background:#020617;color:#e5e7eb;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif}" +
      ".nc-app-iframe-root{background:#020617}";
    CMS.registerPreviewStyle(css + previewCss + `:root{--background-dark:${settings.palette.backgroundDark};--background-light:${settings.palette.backgroundLight}}`, { raw: true });

    // ✅ Homepage (your styled preview: hero + all homepage sections)
    CMS.registerPreviewTemplate("homepage", HomepagePreview);
    CMS.registerPreviewTemplate("eventsContent", EventsPreview);

    // Other page types use generic sections renderer
    CMS.registerPreviewTemplate("aboutPage", SectionsPreview);
    CMS.registerPreviewTemplate("faqPage", SectionsPreview);
    CMS.registerPreviewTemplate("eventsPage", SectionsPreview);
    CMS.registerPreviewTemplate("partnersPage", PartnersPreview);
    CMS.registerPreviewTemplate("blogPage", BlogPagePreview);

    console.log("[Decap Preview] templates registered.");
  } catch (err) {
    console.error("[Decap Preview] CMS not ready:", err);
  }
}

boot();