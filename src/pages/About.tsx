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

  const { hero, sections } = about as any;

  const openRegister = () => setIsFormOpen(true);

  // ✅ Use CMS hero.image (uploaded via Decap)
  const heroBackgroundImage: string | undefined = hero?.image;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      <main className="pt-20 sm:pt-24 lg:pt-28">
        <PageHero
          eyebrow={hero.eyebrow}
          title={hero.title}
          description={hero.description}
          primaryCtaText={hero.primaryCta?.label}
          onPrimaryClick={openRegister}
          variant="image"
          backgroundImage={heroBackgroundImage}
          overlayStrength={hero.overlayStrength ?? 0.5}
          theme={hero.theme ?? "dark"}
        />

        <AboutPageRenderer sections={sections} onRegister={openRegister} />
      </main>

      <Footer />
    </div>
  );
};

export default About;
