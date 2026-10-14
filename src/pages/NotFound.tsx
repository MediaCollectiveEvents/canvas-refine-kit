import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Seo from "@/components/shared/Seo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title="Page Not Found — The Media Collective" />
      <Header />
      <main className="site-gutter site-header-clearance pb-16"><div className="site-container py-8">
        <p className="site-eyebrow mb-4 text-primary">404</p>
        <h1 className="site-page-h1 mb-4 break-words font-display text-3xl font-light md:text-5xl">Page not found</h1>
        <p className="text-muted-foreground">We couldn’t find this page. Choose where to go next.</p>
        <div className="mt-6 flex flex-wrap gap-6 font-display text-base text-primary">
          <Link to="/" className="site-secondary-action">Home</Link>
          <Link to="/events" className="site-secondary-action">Events</Link>
        </div>
      </div></main>
      <Footer hideAttendanceCTA />
    </div>
  );
};

export default NotFound;
