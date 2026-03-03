// src/cms/preview.tsx

// 0) Make React global BEFORE anything else so Decap v3 portal can use it
import React from "react";
(window as any).React = React;

// 1) Process shim early
import "./shim-process";

declare global {
  interface Window {
    CMS?: any;
    DecapCMS?: any;
    React?: any;
  }
}

// 2) Helpers
function pickExport<T = any>(mod: any, named: string): T {
  return (mod && (mod.default || mod[named])) as T;
}

function toJS(v: any): any {
  if (v && typeof v.toJS === "function") return v.toJS();
  return v;
}

function getCMS(): any | undefined {
  return (window as any).CMS || (window as any).DecapCMS;
}

function waitForCMSReady(timeout = 10000, poll = 50): Promise<any> {
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
const SectionWrapper: React.ComponentType<any> = pickExport(SectionWrapperMod, "SectionWrapper");
const SectionDivider: React.ComponentType<any> = pickExport(SectionDividerMod, "SectionDivider");

// Generic site sections (used by non‑homepage pages)
import * as AboutIntroMod from "../components/sections/AboutIntroSection";
import * as MissionValuesMod from "../components/sections/MissionValuesSection";
import * as FAQSectionMod from "../components/sections/FAQSection";
const AboutIntro: React.ComponentType<any> = pickExport(AboutIntroMod, "AboutIntroSection");
const MissionValues: React.ComponentType<any> = pickExport(MissionValuesMod, "MissionValuesSection");
const FAQSection: React.ComponentType<any> = pickExport(FAQSectionMod, "FAQSection");

// Styled homepage preview (hero + all homepage sections)
import HomepagePreview from "./previews/HomepagePreview";

/* ------------------------------------------------------------------ */
/* 4) Map for generic sections pages (homepage uses HomepagePreview)   */
/* ------------------------------------------------------------------ */
const SECTION_MAP: Record<string, React.ComponentType<any>> = {
  aboutIntro: AboutIntro,
  missionValues: MissionValues,
  faqSection: FAQSection,
};

/* ------------------------------------------------------------------ */
/* 5) Generic SectionsPreview (aboutPage, faqPage, eventsPage, …)      */
/* ------------------------------------------------------------------ */
function SectionsPreview({ entry }: { entry: any }) {
  try {
    const data = toJS(entry.getIn(["data"])) || {};
    const sections = data.sections || [];

    return (
      <div style={{ background: "#020617", minHeight: "100vh", color: "white" }}>
        {sections.map((section: any, index: number) => {
          const Cmp = SECTION_MAP[section?.type as string];
          if (!Cmp) {
            return (
              <div key={index} style={{ padding: 20, color: "#f87171" }}>
                Unknown section type: <strong>{section?.type}</strong>
              </div>
            );
          }

          const settings = section?.settings || {};
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
                  variant={divider.variant || "hairline"}
                  className="max-w-[1280px] mx-auto px-6 md:px-10"
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    );
  } catch (err: any) {
    console.error("[Decap Preview] render error:", err);
    return (
      <div style={{ padding: 20, color: "#f87171" }}>
        Preview render error: {String(err?.message || err)}
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

    // Minimal preview CSS
    const css =
      "body{background:#020617;color:#e5e7eb;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif}" +
      ".nc-app-iframe-root{background:#020617}";
    CMS.registerPreviewStyle(css, { raw: true });

    // ✅ Homepage (your styled preview: hero + all homepage sections)
    CMS.registerPreviewTemplate("homepage", HomepagePreview);

    // Other page types use generic sections renderer
    CMS.registerPreviewTemplate("aboutPage", SectionsPreview);
    CMS.registerPreviewTemplate("faqPage", SectionsPreview);
    CMS.registerPreviewTemplate("eventsPage", SectionsPreview);
    CMS.registerPreviewTemplate("partnersPage", SectionsPreview);
    CMS.registerPreviewTemplate("blogPage", SectionsPreview);

    console.log("[Decap Preview] templates registered.");
  } catch (err) {
    console.error("[Decap Preview] CMS not ready:", err);
  }
}

boot();