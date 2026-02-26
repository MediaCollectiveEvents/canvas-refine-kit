// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
import Admin from "@/pages/Admin"; // your React "Content Manager" page
import Wireframe from "@/pages/Wireframe";
import NotFound from "@/pages/NotFound";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Core pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

        {/* Events */}
        <Route path="/events" element={<Events />} />
        {/* If EventDetails uses an ID or slug, adjust the param name as needed */}
        <Route path="/events/:id" element={<EventDetails />} />

        {/* Blog listing + individual posts */}
        <Route path="/blog" element={<Blog />} />
        {/* ✅ Option A: stop passing props to BlogPost */}
        <Route path="/blog/:slug" element={<BlogPost />} />

        {/* Partners & Sponsors */}
        <Route path="/partners" element={<Partners />} />

        {/* FAQ & Policy */}
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* Extra pages */}
        <Route path="/my-new-page" element={<MyNewPage />} />

        {/* ✅ Move app's Admin page off /admin (Decap CMS lives at /admin/) */}
        <Route path="/manage" element={<Admin />} />

        <Route path="/wireframe" element={<Wireframe />} />

        {/* Catch-all for unknown routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
