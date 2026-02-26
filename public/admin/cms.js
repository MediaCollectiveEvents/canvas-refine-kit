// public/admin/cms.js
import CMS from "decap-cms-app";
import React from "react";
import ReactDOM from "react-dom/client";

// Make React available inside the preview iframe
window.React = React;

// Helper to safely extract CMS data
const toJS = (value) =>
  value && typeof value.toJS === "function" ? value.toJS() : value;

// ---------------------------------------------------------------------------
// IMPORT REAL COMPONENTS
// ---------------------------------------------------------------------------

// Wrapper + divider
import SectionWrapper from "../../src/components/shared/SectionWrapper.jsx";
import SectionDivider from "../../src/components/shared/SectionDivider.jsx";

// Sections (update paths if needed)
import JoinCommunitySection from "../../src/components/sections/JoinCommunity.jsx";
import AboutIntroSection from "../../src/components/sections/AboutIntro.jsx";
import WhoAttendsSection from "../../src/components/sections/WhoAttends.jsx";
import UpcomingEventsIntroSection from "../../src/components/sections/UpcomingEventsIntro.jsx";
import ForBrandsSection from "../../src/components/sections/ForBrands.jsx";
import NewHereSection from "../../src/components/sections/NewHere.jsx";
import TestimonialsSection from "../../src/components/sections/Testimonials.jsx";
import PartnersStripSection from "../../src/components/sections/PartnersStrip.jsx";
import MissionValuesSection from "../../src/components/sections/MissionValuesSection.jsx";
import StorySection from "../../src/components/sections/StorySection.jsx";
import JoinUsSection from "../../src/components/sections/JoinUs.jsx";
import FAQSection from "../../src/components/sections/FAQSection.jsx";
import CTASection from "../../src/components/sections/CTASection.jsx";
import PostsGridSection from "../../src/components/sections/PostsGrid.jsx";
import EventsIntroSection from "../../src/components/sections/EventsIntro.jsx";
import EventsListSection from "../../src/components/sections/EventsList.jsx";

// ---------------------------------------------------------------------------
// MAP SECTION TYPES → COMPONENTS
// ---------------------------------------------------------------------------

const SECTION_MAP = {
  joinCommunity: JoinCommunitySection,
  aboutIntro: AboutIntroSection,
  whoAttends: WhoAttendsSection,
  upcomingEventsIntro: UpcomingEventsIntroSection,
  forBrands: ForBrandsSection,
  newHere: NewHereSection,
  testimonials: TestimonialsSection,
  partners: PartnersStripSection,
  missionValues: MissionValuesSection,
  story: StorySection,
  joinUs: JoinUsSection,
  faqSection: FAQSection,
  cta: CTASection,
  postsGrid: PostsGridSection,
  eventsIntro: EventsIntroSection,
  eventsList: EventsListSection,
};

// ---------------------------------------------------------------------------
// RENDER SECTIONS WITH REAL COMPONENTS
// ---------------------------------------------------------------------------

function SectionsPreviewRenderer({ sections }) {
  return (
    <div style={{ background: "#020617", minHeight: "100vh", color: "white" }}>
      {sections.map((section, index) => {
        const Component = SECTION_MAP[section.type];
        if (!Component) {
          return (
            <div key={index} style={{ padding: "2rem", color: "#f87171" }}>
              Unknown section type: <strong>{section.type}</strong>
            </div>
          );
        }

        const settings = section.settings || {};
        const style = settings.style || {};
        const divider = settings.divider || {};

        // Avoid fade+divider stacking
        const bottomFadeDisabled = divider.enabled === true;

        return (
          <React.Fragment key={index}>
            <SectionWrapper
              variant={style.variant ?? "clean"}
              padding={style.padding ?? "lux"}
              glow={!!style.glow}
              noise={!!style.noise}
              grid={!!style.grid}
              withFades={style.fades !== false && !bottomFadeDisabled}
            >
              <Component section={section} settings={settings} />
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
}

// ---------------------------------------------------------------------------
// GENERIC PAGE PREVIEW
// ---------------------------------------------------------------------------

function previewPage(entry) {
  const data = toJS(entry.getIn(["data"])) || {};
  return <SectionsPreviewRenderer sections={data.sections || []} />;
}

// ---------------------------------------------------------------------------
// REGISTER PAGE PREVIEWS
// ---------------------------------------------------------------------------

CMS.registerPreviewTemplate("homepage", previewPage);
CMS.registerPreviewTemplate("aboutPage", previewPage);
CMS.registerPreviewTemplate("faqPage", previewPage);
CMS.registerPreviewTemplate("partnersPage", previewPage);
CMS.registerPreviewTemplate("eventsPage", previewPage);
CMS.registerPreviewTemplate("blogPage", previewPage);

// SETTINGS PREVIEW (simple text dump)
CMS.registerPreviewTemplate("settings", ({ entry }) => {
  const data = toJS(entry.getIn(["data"])) || {};
  return (
    <div style={{ padding: "2rem", background: "#020617", color: "white" }}>
      <h1>Site Settings</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
});

// BLOG POSTS PREVIEW
CMS.registerPreviewTemplate("blogPosts", ({ entry }) => {
  const data = toJS(entry.getIn(["data"])) || {};
  return (
    <div style={{ padding: "2rem", background: "#020617", color: "white" }}>
      <h1>{data.title || "Blog Title…"}</h1>
      <p style={{ opacity: 0.7 }}>{data.excerpt}</p>
      <div style={{ marginTop: "1rem" }}>{data.body}</div>
    </div>
  );
});

// EVENTS (single)
CMS.registerPreviewTemplate("events", ({ entry }) => {
  const data = toJS(entry.getIn(["data"])) || {};
  return (
    <div style={{ padding: "2rem", background: "#020617", color: "white" }}>
      <h1>{data.title}</h1>
      <p style={{ opacity: 0.7 }}>{data.date}</p>
      <p>{data.summary}</p>
    </div>
  );
});
