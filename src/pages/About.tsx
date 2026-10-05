// src/pages/About.tsx
import { useState } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import PageHero from "@/components/shared/PageHero";

import AboutPageRenderer from "@/components/sections/AboutPageRenderer";

import about from "@/content/about.json";

const About = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { hero, sections } = about;

  const openRegister = () => setIsFormOpen(true);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      {/* Top padding to clear fixed header (same as Home) */}
      <main className="pt-[88px] sm:pt-[96px] lg:pt-[104px]">
        <PageHero
          presentation="business"
          editorialCoherence
          eyebrow={hero?.eyebrow}
          title={hero?.title}
          description={hero?.description}
          // Single CTA – open registration form if label exists
          primaryCtaText={hero?.cta?.label}
          onPrimaryClick={hero?.cta?.label ? openRegister : undefined}
          // Hero image + visual controls from CMS
          image={hero?.image}

        />

        <AboutPageRenderer sections={sections} onRegister={openRegister} />
      </main>

      <Footer />
    </div>
  );
};

export default About;
