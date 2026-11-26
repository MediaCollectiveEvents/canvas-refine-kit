// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import settings from "@/content/settings.json";

// Pages
import Home from "@/pages/Home";
const Team = lazy(() => import("@/pages/Team"));
const InsightsComparison = lazy(() => import("@/pages/InsightsComparison"));
const InsightsSubmit = lazy(() => import("@/pages/InsightsSubmit"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const Events = lazy(() => import("@/pages/Events"));
const EventDetails = lazy(() => import("@/pages/EventDetails"));
const Partners = lazy(() => import("@/pages/Partners"));
const Community = lazy(() => import("@/pages/Community"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const SponsorReportsFrankfurt = lazy(() => import("@/pages/SponsorReportsFrankfurt"));
const SponsorReportFrankfurtOwner = lazy(() => import("@/pages/SponsorReportFrankfurtOwner"));
const MptsReceptionReport = lazy(() => import("@/pages/MptsReceptionReport"));
const PartnerPasswordReset = lazy(() => import("@/pages/PartnerPasswordReset"));
const SponsorOwnerPasswordReset = lazy(() => import("@/pages/SponsorOwnerPasswordReset"));
const SponsorActivate = lazy(() => import("@/pages/SponsorActivate"));
const WalkInKiosk = lazy(() => import("@/components/walk-in/WalkInKiosk"));
const SpeakerProfile = lazy(() => import("@/pages/SpeakerProfile"));
const SpeakerEdit = lazy(() => import("@/pages/SpeakerEdit"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const MyNewPage = lazy(() => import("@/pages/MyNewPage"));
const Admin = lazy(() => import("@/pages/Admin"));
const Wireframe = lazy(() => import("@/pages/Wireframe"));
const NotFound = lazy(() => import("@/pages/NotFound"));
import Maintenance from "@/pages/Maintenance";
import CookieConsent from "@/components/shared/CookieConsent";

import { isEventHubStaging, isEventHubRehearsalReady } from "@/lib/event-hub-backend";

function eventHubScreen(page: React.ReactNode, supportsRehearsal = true) {
  if (isEventHubStaging && (!supportsRehearsal || !isEventHubRehearsalReady)) {
    return <main className="site-container py-24"><h1>Event Hub staging</h1><p>This preview is waiting for a separate test backend.</p></main>;
  }
  return page;
}

const App = () => {
  // Inject CMS colour palette into CSS variables
  useEffect(() => {
    const root = document.documentElement;

    // These two control ALL light & dark section backgrounds
    root.style.setProperty(
      "--background-dark",
      settings.palette.backgroundDark ?? "#101d24"
    );

    root.style.setProperty(
      "--background-light",
      settings.palette.backgroundLight ?? "#f7f7f7"
    );
  }, []);

  // Maintenance mode: ONLY enabled on production builds
  // - import.meta.env.PROD = false in `npm run dev` → you see full site
  // - import.meta.env.PROD = true on live site → maintenanceMode applies
  const maintenanceMode =
    import.meta.env.PROD && (settings as { maintenanceMode?: boolean }).maintenanceMode === true;

  return (
    // 🔵 Global site wrapper using the CMS-driven dark background
    <div
      className="min-h-screen text-white"
      style={{ backgroundColor: "var(--background-dark)" }}
    >
      <Router>
        <Suspense fallback={<div role="status" className="site-container site-header-clearance py-12 text-base text-white/80">Loading page…</div>}>
        <Routes>
          {maintenanceMode ? (
            // 🚧 When maintenanceMode is ON in production, all routes go to Maintenance
            <Route path="*" element={<Maintenance />} />
          ) : (
            <>
              {/* Core pages */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={import.meta.env.DEV || window.location.hostname === "staging.mediacollective.events" ? <Team /> : <Navigate to="/" replace />} />

              {/* Events */}
              <Route path="/events" element={<Events />} />
              {/* Calendar is temporarily deferred; its page, data and downloads remain intact. */}
              <Route path="/events/calendar" element={<Navigate to="/" replace />} />
              <Route path="/events/:id" element={<EventDetails />} />

              {/* Insights and legacy article links */}
              <Route path="/insights" element={<Blog />} />
              <Route path="/insights/design-comparison" element={import.meta.env.DEV || window.location.hostname === "staging.mediacollective.events" ? <InsightsComparison /> : <NotFound />} />
              <Route path="/insights/submit" element={import.meta.env.DEV || window.location.hostname === "staging.mediacollective.events" ? <InsightsSubmit /> : <NotFound />} />
              <Route path="/insights/:slug" element={<BlogPost />} />
              <Route path="/blog" element={<Navigate to="/insights" replace />} />
              <Route path="/blog/:slug" element={<BlogPost />} />

              {/* Partners & Sponsors */}
              <Route path="/partners" element={<Partners />} />
              <Route path="/community" element={<Community />} />

              {/* FAQ & Policy */}
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />

              <Route path="/eventhub" element={eventHubScreen(<SponsorReportsFrankfurt />)} />
              <Route path="/eventhub/owner" element={eventHubScreen(<SponsorReportFrankfurtOwner />)} />
              <Route path="/eventhub/mpts-reception-2027" element={eventHubScreen(<MptsReceptionReport />)} />
              <Route path="/eventhub/partner-password-reset" element={eventHubScreen(<PartnerPasswordReset />)} />
              <Route path="/eventhub/reset-password" element={eventHubScreen(<SponsorOwnerPasswordReset />)} />
              <Route path="/eventhub/activate" element={eventHubScreen(<SponsorActivate />)} />
              <Route path="/eventhub/walk-in" element={eventHubScreen(<WalkInKiosk />, false)} />
              <Route path="/eventhub/speakers/:id" element={eventHubScreen(<SpeakerProfile />)} />
              <Route path="/eventhub/speaker-edit" element={eventHubScreen(<SpeakerEdit />)} />

              {/* Extra pages */}
              {import.meta.env.DEV && <Route path="/my-new-page" element={<MyNewPage />} />}

              {/* Admin dashboard (NOT Decap) */}
              <Route path="/manage" element={<Admin />} />

              {import.meta.env.DEV && <Route path="/wireframe" element={<Wireframe />} />}

              {/* Catch‑all */}
              <Route path="*" element={<NotFound />} />
            </>
          )}
        </Routes>
        </Suspense>
      </Router>
      <CookieConsent />
    </div>
  );
};

export default App;
