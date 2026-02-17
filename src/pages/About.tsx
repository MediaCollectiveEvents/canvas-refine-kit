// src/pages/About.tsx
import { useState } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import PageHero from "@/components/shared/PageHero";

import AboutPageRenderer from "@/components/sections/AboutPageRenderer";

import heroImage from "@/assets/hero-placeholder.jpg";
import about from "@/content/about.json";

const About = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { hero, sections } = about as any;

  const handleOpenRegister = () => setIsFormOpen(true);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      {/* Match Home page top padding so hero is below header */}
      <main className="pt-20 sm:pt-24 lg:pt-28">
        <PageHero
          eyebrow={hero.eyebrow ?? hero.subtitle}
          title={hero.title}
          description={hero.description}
          primaryCtaText={hero.primaryCta?.label}
          onPrimaryClick={handleOpenRegister}
          secondaryCtaText={hero.secondaryCta?.label}
          secondaryCtaHref={hero.secondaryCta?.url}
          variant="image"
          backgroundImage={heroImage}
          overlayStrength={hero.overlayStrength ?? 0.5}
          theme={hero.theme ?? "dark"}
        />

        {/* JSON-driven About sections */}
        <AboutPageRenderer
          sections={sections}
          onRegister={handleOpenRegister}
        />
      </main>

      <Footer />
    </div>
  );
};

export default About;
