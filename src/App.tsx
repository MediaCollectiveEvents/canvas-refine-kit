// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import settings from "@/content/settings.json";

// Pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Events from "@/pages/Events";
import EventDetails from "@/pages/EventDetails";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Partners from "@/pages/Partners";
import FAQ from "@/pages/FAQ";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import MyNewPage from "@/pages/MyNewPage";
import Admin from "@/pages/Admin";
import Wireframe from "@/pages/Wireframe";
import NotFound from "@/pages/NotFound";
import Maintenance from "@/pages/Maintenance";

const App = () => {
  // Inject CMS colour palette into CSS variables
  useEffect(() => {
    const root = document.documentElement;

    // These two control ALL light & dark section backgrounds
    root.style.setProperty(
      "--background-dark",
      settings.palette.backgroundDark ?? "#0b111a"
    );

    root.style.setProperty(
      "--background-light",
      settings.palette.backgroundLight ?? "#ffffff"
    );
  }, []);

  // Maintenance mode: ONLY enabled on production builds
  // - import.meta.env.PROD = false in `npm run dev` → you see full site
  // - import.meta.env.PROD = true on live site → maintenanceMode applies
  const maintenanceMode =
    import.meta.env.PROD && (settings as any).maintenanceMode === true;

  return (
    // 🔵 Global site wrapper using the CMS-driven dark background
    <div
      className="min-h-screen text-white"
      style={{ backgroundColor: "var(--background-dark)" }}
    >
      <Router>
        <Routes>
          {maintenanceMode ? (
            // 🚧 When maintenanceMode is ON in production, all routes go to Maintenance
            <Route path="*" element={<Maintenance />} />
          ) : (
            <>
              {/* Core pages */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />

              {/* Events */}
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />

              {/* Blog listing + individual posts */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />

              {/* Partners & Sponsors */}
              <Route path="/partners" element={<Partners />} />

              {/* FAQ & Policy */}
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />

              {/* Extra pages */}
              <Route path="/my-new-page" element={<MyNewPage />} />

              {/* Admin dashboard (NOT Decap) */}
              <Route path="/manage" element={<Admin />} />

              <Route path="/wireframe" element={<Wireframe />} />

              {/* Catch‑all */}
              <Route path="*" element={<NotFound />} />
            </>
          )}
        </Routes>
      </Router>
    </div>
  );
};

export default App;