// src/App.tsx

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages (relative imports)
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

const App: React.FC = () => {
  return (
    <BrowserRouter>
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

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
