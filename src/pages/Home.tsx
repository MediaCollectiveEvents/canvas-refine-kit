// src/pages/Home.tsx
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";
import EventRegistrationForm from "@/components/EventRegistrationForm";

import { HomepageRenderer } from "@/components/sections/HomepageRenderer";
import EventsSection from "@/components/sections/EventsSection";

import heroImage from "@/assets/hero-placeholder.jpg";
import homepage from "@/content/homepage.json";

const Home = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { hero, sections } = homepage as any;

  const handleOpenRegister = () => setIsFormOpen(true);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      <main>
        {/* HERO – CMS-driven hero JSON */}
        <PageHero
          eyebrow={hero.subtitle}
          title={hero.title}
          description={hero.description}
          primaryCtaText={hero.primaryCta?.label}
          onPrimaryClick={handleOpenRegister}
          secondaryCtaText={hero.secondaryCta?.label}
          secondaryCtaHref={hero.secondaryCta?.url}
          variant="image"
          backgroundImage={heroImage}
        />

        {/* HOMEPAGE SECTIONS – driven by homepage.json via Decap CMS */}
        <HomepageRenderer sections={sections} onRegister={handleOpenRegister} />

        {/* UPCOMING EVENTS – cards section (matches your design) */}
        <EventsSection onRegisterClick={handleOpenRegister} />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
