// src/pages/Home.tsx
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";
import EventRegistrationForm from "@/components/EventRegistrationForm";

import { HomepageRenderer } from "@/components/sections/HomepageRenderer";

import heroImage from "@/assets/hero-placeholder.jpg";
import homepage from "@/content/homepage.json";

const Home = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { hero, sections } = homepage as any;

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
          onPrimaryClick={() => setIsFormOpen(true)}
          secondaryCtaText={hero.secondaryCta?.label}
          secondaryCtaHref={hero.secondaryCta?.url}
          variant="image"
          backgroundImage={heroImage}
        />

        {/* HOMEPAGE SECTIONS – driven by homepage.json via Decap CMS */}
        <HomepageRenderer
          sections={sections}
          onRegister={() => setIsFormOpen(true)}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
