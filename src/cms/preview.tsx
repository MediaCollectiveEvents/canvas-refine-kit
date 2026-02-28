// src/cms/preview.tsx

// 1) Ensure "process" exists BEFORE any other import runs
import "./shim-process";

// 2) Globals injected by Decap CMS
declare global {
  interface Window {
    CMS?: any; // legacy global
    DecapCMS?: any; // modern global
    React?: any;
  }
}

// 3) React AFTER shim (some widgets expect global React)
import React from "react";
window.React = React;

// 4) Helpers
const toJS = (v: any) => (v && typeof v.toJS === "function" ? v.toJS() : v);

function getCMS(): any | undefined {
  return (window as any).CMS || (window as any).DecapCMS;
}

function waitForCMSReady(timeoutMs = 10000, pollMs = 50): Promise<any> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function tick() {
      const cms = getCMS();
      if (cms && typeof cms.registerPreviewTemplate === "function") {
        resolve(cms);
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error("CMS global not ready within timeout"));
        return;
      }
      setTimeout(tick, pollMs);
    })();
  });
}

// 5) IMPORT COMPONENTS — relative paths ONLY
import SectionWrapper from "../components/layout/SectionWrapper";
import SectionDivider from "../components/shared/SectionDivider";

import { AboutIntroSection as AboutIntro } from "../components/sections/AboutIntroSection";
import MissionValues from "../components/sections/MissionValuesSection";
import FAQSection from "../components/sections/FAQSection";

// 6) Section type → component map
const SECTION_MAP: Record<string, React.FC<any>> = {
  aboutIntro: AboutIntro,
  missionValues: MissionValues,
  faqSection: FAQSection,
};

// 7) Safe preview renderer with error guard
function SectionsPreview({ entry }: { entry: any }) {
  try {
    const data = toJS(entry.getIn(["data"])) || {};
    const sections = data.sections || [];

    return (
      <div
        style={{ background: "#020617", minHeight: "100vh", color: "white" }}
      >
        {sections.map((section: any, index: number) => {
          const Cmp = SECTION_MAP[section.type];
          if (!Cmp) {
            return (
              <div key={index} style={{ padding: 20, color: "#f87171" }}>
                Unknown section type: <strong>{section.type}</strong>
              </div>
            );
          }

          const settings = section.settings || {};
          const style = settings.style || {};
          const divider = settings.divider || {};
          const bottomFadeDisabled = divider.enabled === true;

          return (
            <React.Fragment key={index}>
              <SectionWrapper
                variant={style.variant ?? "clean"}
                padding={style.padding ?? "lux"}
                noise={!!style.noise}
                grid={!!style.grid}
                withFades={style.fades !== false && !bottomFadeDisabled}
              >
                <Cmp section={section} settings={settings} />
              </SectionWrapper>

              {divider.enabled && (
                <SectionDivider
                  variant={divider.variant || "hairline"}
                  className="max-w-[1280px] mx-auto px-6 md:px-10"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  } catch (err) {
    console.error("[Decap Preview] render error:", err);
    return (
      <div style={{ padding: 20, color: "#f87171" }}>
        Preview render error: {(err as Error)?.message}
      </div>
    );
  }
}

// 8) Register after CMS is ready
async function boot() {
  console.log("[Decap Preview] waiting for CMS…");
  try {
    const CMS = await waitForCMSReady();
    console.log("[Decap Preview] CMS ready.");

    // ✅ Correct signature: (cssString, { raw: true })
    const css =
      "body{background:#020617;color:#e5e7eb;font-family:system-ui,sans-serif}" +
      ".nc-entryEditor{background:#020617}" +
      ".nc-app-iframe-root{background:#020617}";
    CMS.registerPreviewStyle(css, { raw: true });

    // Register templates (names must match config.yml 'name')
    CMS.registerPreviewTemplate("homepage", SectionsPreview);
    CMS.registerPreviewTemplate("aboutPage", SectionsPreview);
    CMS.registerPreviewTemplate("faqPage", SectionsPreview);
    CMS.registerPreviewTemplate("eventsPage", SectionsPreview);
    CMS.registerPreviewTemplate("partnersPage", SectionsPreview);
    CMS.registerPreviewTemplate("blogPage", SectionsPreview);

    CMS.registerPreviewTemplate("settings", ({ entry }: any) => {
      const data = toJS(entry.getIn(["data"])) || {};
      return (
        <div style={{ padding: "2rem", background: "#020617", color: "white" }}>
          <h1>Settings</h1>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      );
    });

    CMS.registerPreviewTemplate("blogPosts", ({ entry }: any) => {
      const data = toJS(entry.getIn(["data"])) || {};
      return (
        <div style={{ padding: "2rem", background: "#020617", color: "white" }}>
          <h1>{data.title || "Blog Title…"}</h1>
          <p style={{ opacity: 0.7 }}>{data.excerpt}</p>
          <div style={{ marginTop: 16 }}>{data.body}</div>
        </div>
      );
    });

    console.log("[Decap Preview] templates registered.");
  } catch (err) {
    console.error("[Decap Preview] CMS not ready:", err);
  }
}

boot();
