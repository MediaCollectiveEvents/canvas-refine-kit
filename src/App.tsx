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
import Maintenance from "@/pages/Maintenance"; // 👈 add this

const App = () => {
  // ⭐ Inject CMS colour palette into CSS variables
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

  return (
    <Router>
      <Routes>
        {/* 🚧 Maintenance mode: send every route to Maintenance */}
        <Route path="*" element={<Maintenance />} />
      </Routes>
    </Router>
  );
};

export default App;