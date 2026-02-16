// src/App.tsx

import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SectionStyleProvider } from "./lib/SectionStyleProvider";

// Pages (relative imports kept as you had)
import Home from "./pages/Home";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Events from "./pages/Events";
import Partners from "./pages/Partners";
import Sponsors from "./pages/Sponsors";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Wireframe from "./pages/Wireframe";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin"; // Custom link-to-Decap page

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App: React.FC = () => {
  return (
    <SectionStyleProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Main site pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          {/* Blog list + single post */}
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />

          {/* Events & partners */}
          <Route path="/events" element={<Events />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/sponsors" element={<Sponsors />} />

          {/* Legal / misc */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/wireframe" element={<Wireframe />} />

          {/* Custom admin info page — /cms */}
          <Route path="/cms" element={<Admin />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </SectionStyleProvider>
  );
};

export default App;
