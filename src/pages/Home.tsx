// src/pages/Home.tsx
import { useState } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";
import EventRegistrationForm from "@/components/EventRegistrationForm";

// Default import – matches `export default HomepageRenderer`
import HomepageRenderer from "@/components/sections/HomepageRenderer";

import homepageContent from "@/content/homepage.json";

const Home = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // homepage.json shape: { hero, sections, ... }
  const { hero, sections } = homepageContent as any;

  const handleOpenRegister = () => setIsFormOpen(true);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      {/* Top padding equals fixed header height */}
      <main className="pt-[160px] sm:pt-[180px] lg:pt-[200px]">
        <PageHero
          // Using subtitle as an eyebrow/kicker
          eyebrow={hero?.subtitle}
          title={hero?.title}
          description={hero?.description}
          // Single CTA – opens the registration form
          primaryCtaText={hero?.cta?.label}
          onPrimaryClick={hero?.cta?.label ? handleOpenRegister : undefined}
          // Hero image + visual behaviours from CMS
          image={hero?.image}
          theme={hero?.theme ?? "dark"}
          overlayStrength={hero?.overlayStrength ?? 0.5}
          mobileCrop={hero?.mobileCrop}
          imagePosition={hero?.imagePosition}
          imageOffset={hero?.imageOffset}
        />

        {/* JSON-driven homepage sections (order = order in homepage.json) */}
        <HomepageRenderer sections={sections} onRegister={handleOpenRegister} />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
