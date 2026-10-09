// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import settings from "@/content/settings.json";

// Pages
import Home from "@/pages/Home";
const Events = lazy(() => import("@/pages/Events"));
const EventPlanner = lazy(() => import("@/pages/EventPlanner"));
const EventDetails = lazy(() => import("@/pages/EventDetails"));
const Partners = lazy(() => import("@/pages/Partners"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const MyNewPage = lazy(() => import("@/pages/MyNewPage"));
const Admin = lazy(() => import("@/pages/Admin"));
const Wireframe = lazy(() => import("@/pages/Wireframe"));
const NotFound = lazy(() => import("@/pages/NotFound"));
import Maintenance from "@/pages/Maintenance";

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
              <Route path="/about" element={<Navigate to="/" replace />} />

              {/* Events */}
              <Route path="/events" element={<Events />} />
              <Route path="/events/calendar" element={<EventPlanner />} />
              <Route path="/events/:id" element={<EventDetails />} />

              {/* Phase 2: Insights listing + individual posts temporarily unavailable. */}
              <Route path="/blog" element={<Navigate to="/" replace />} />
              <Route path="/blog/:slug" element={<Navigate to="/" replace />} />

              {/* Partners & Sponsors */}
              <Route path="/partners" element={<Partners />} />

              {/* FAQ & Policy */}
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />

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
    </div>
  );
};

export default App;