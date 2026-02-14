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

      {/* This instance is for hero + sections CTAs */}
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      {/* Top padding matches header height so hero sits flush beneath */}
      <main className="pt-20 sm:pt-24 lg:pt-28">
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

        <HomepageRenderer sections={sections} onRegister={handleOpenRegister} />

        <EventsSection onRegisterClick={handleOpenRegister} />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
``;
