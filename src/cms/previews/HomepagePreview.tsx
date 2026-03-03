// src/cms/previews/HomepagePreview.tsx
import React from "react";

/** Helper: prefer default export, otherwise a named export */
function pickExport<T = any>(mod: any, name: string): T {
  return (mod && (mod.default || mod[name])) as T;
}

// Layout helpers from your app (compat imports: default or named)
import * as SectionWrapperMod from "../../components/layout/SectionWrapper";
import * as SectionDividerMod from "../../components/shared/SectionDivider";
const SectionWrapper: React.ComponentType<any> = pickExport(SectionWrapperMod, "SectionWrapper");
const SectionDivider: React.ComponentType<any> = pickExport(SectionDividerMod, "SectionDivider");

// Production sections (compat imports: default or named)
import * as AboutIntroMod from "../../components/sections/AboutIntroSection";
import * as WhoAttendsMod from "../../components/sections/WhoAttendsSection";
import * as UpcomingEventsIntroMod from "../../components/sections/UpcomingEventsIntroSection";
import * as ForBrandsMod from "../../components/sections/ForBrandsSection";
import * as NewHereMod from "../../components/sections/NewHereSection";
import * as TestimonialsMod from "../../components/sections/TestimonialsSection";
import * as PartnersMod from "../../components/sections/PartnersSection";
import * as JoinCommunityMod from "../../components/sections/JoinCommunitySection";

const AboutIntro: React.ComponentType<any>                 = pickExport(AboutIntroMod, "AboutIntroSection");
const WhoAttends: React.ComponentType<any>                 = pickExport(WhoAttendsMod, "WhoAttendsSection");
const UpcomingEventsIntro: React.ComponentType<any>        = pickExport(UpcomingEventsIntroMod, "UpcomingEventsIntroSection");
const ForBrands: React.ComponentType<any>                  = pickExport(ForBrandsMod, "ForBrandsSection");
const NewHere: React.ComponentType<any>                    = pickExport(NewHereMod, "NewHereSection");
const Testimonials: React.ComponentType<any>               = pickExport(TestimonialsMod, "TestimonialsSection");
const Partners: React.ComponentType<any>                   = pickExport(PartnersMod, "PartnersSection");
const JoinCommunity: React.ComponentType<any>              = pickExport(JoinCommunityMod, "JoinCommunitySection");

// Accept any props for preview components (prevents TS prop errors)
type SectionComponent = React.ComponentType<any>;

// Map CMS section types → actual components
const SECTION_MAP: Record<string, SectionComponent> = {
  aboutIntro: AboutIntro,
  whoAttends: WhoAttends,
  upcomingEventsIntro: UpcomingEventsIntro,
  forBrands: ForBrands,
  newHere: NewHere,
  testimonials: Testimonials,
  partners: Partners,
  joinCommunity: JoinCommunity,
};

// Fallback if an unexpected type appears
function UnknownSection(props: { type?: string; section?: any; settings?: any }) {
  const t = props.type || (props.section && props.section.type) || "unknown";
  return (
    <div
      style={{
        padding: 20,
        background: "#111827",
        color: "#f87171",
        border: "1px dashed #f87171",
        borderRadius: 6,
      }}
    >
      Unknown section type: <strong>{t}</strong>
    </div>
  );
}

// Normalize homepage data shape from Decap entry (supports nesting under content/homepage)
function normalizeRoot(raw: any): any {
  if (raw && (raw.hero || raw.sections)) return raw;
  if (raw && raw.content && (raw.content.hero || raw.content.sections)) return raw.content;
  if (raw && raw.homepage && (raw.homepage.hero || raw.homepage.sections)) return raw.homepage;
  return raw || {};
}

export default function HomepagePreview(props: any) {
  const entry = props.entry;

  // Decap entry data -> JS
  const top = entry.getIn(["data"]);
  const raw = top && typeof top.toJS === "function" ? top.toJS() : top || {};
  const root = normalizeRoot(raw);

  const hero = root.hero || {};
  const sections: any[] = Array.isArray(root.sections) ? root.sections : [];

  // Page + Hero Styles (cast to any to avoid TS CSS union warnings)
  const pageStyle: any = { background: "#020617", minHeight: "100vh", color: "white" };

  const wrapperStyle: any = {
    width: "100%",
    height: "400px",
    position: "relative",
    backgroundImage: hero.image ? "url(" + hero.image + ")" : "",
    backgroundSize: hero.mobileCrop || "cover",
    backgroundPosition: hero.imagePosition || "center",
    backgroundColor: hero.theme === "dark" ? "#000000" : "#ffffff",
    color: hero.theme === "dark" ? "#ffffff" : "#000000",
    padding: "40px",
    boxSizing: "border-box",
  };

  const overlayStyle: any = {
    position: "absolute",
    inset: "0",
    background:
      hero.theme === "dark"
        ? "rgba(0,0,0," + (hero.overlayStrength || 0.5) + ")"
        : "rgba(255,255,255," + (hero.overlayStrength || 0.5) + ")",
  };

  const contentStyle: any = {
    position: "relative",
    zIndex: 2,
    maxWidth: "960px",
  };

  // Tiny badge: shows number of sections received
  const debugBadge: any = {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 3,
    padding: "4px 8px",
    background: "#ef4444",
    color: "white",
    fontSize: "12px",
    borderRadius: "3px",
  };

  return (
    <div style={pageStyle}>
      <div style={debugBadge}>Sections: {sections.length}</div>

      {/* HERO */}
      <div style={wrapperStyle}>
        <div style={overlayStyle}></div>
        <div style={contentStyle}>
          <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>{hero.title}</h1>

          {hero.subtitle ? (
            <h2 style={{ fontSize: "22px", opacity: 0.85, marginBottom: "8px" }}>
              {hero.subtitle}
            </h2>
          ) : null}

          {hero.description ? (
            <p style={{ fontSize: "16px", lineHeight: "22px", marginBottom: "20px" }}>
              {hero.description}
            </p>
          ) : null}

          {hero.cta && hero.cta.label ? (
            <a
              href={hero.cta.url || "#"}
              style={{
                display: "inline-block",
                padding: "10px 20px",
                background: hero.theme === "dark" ? "#ffffff" : "#000000",
                color: hero.theme === "dark" ? "#000000" : "#ffffff",
                borderRadius: "4px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              {hero.cta.label}
            </a>
          ) : null}
        </div>
      </div>

      {/* SECTIONS */}
      <div style={{ paddingTop: "40px" }}>
        {sections.map(function (section: any, index: number) {
          const type = section && section.type;
          const Component = (type && SECTION_MAP[type]) || UnknownSection;

          const settings = (section && section.settings) || {};
          const style = settings.style || {};
          const divider = settings.divider || {};

          return (
            <React.Fragment key={index}>
              <SectionWrapper
                variant={style.variant ?? "clean"}
                padding={style.padding ?? "lux"}
                noise={!!style.noise}
                grid={!!style.grid}
                withFades={style.fades !== false}
              >
                <Component section={section} settings={settings} />
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
    </div>
  );
}
``