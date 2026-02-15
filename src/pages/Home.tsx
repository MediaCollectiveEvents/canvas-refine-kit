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

  // 🔎 Read Upcoming Events Intro from CMS (for underHeader + image controls)
  const upcomingIntro = Array.isArray(sections)
    ? sections.find((s: any) => s?.type === "upcomingEventsIntro")
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      {/* Top padding equals header height */}
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
          overlayStrength={hero.overlayStrength ?? 0.5}
          theme={hero.theme ?? "dark"}
        />

        {/* JSON-driven homepage sections */}
        <HomepageRenderer sections={sections} onRegister={handleOpenRegister} />

        {/* Uniform card images + optional text under header (driven by CMS) */}
        <EventsSection
          onRegisterClick={handleOpenRegister}
          underHeader={upcomingIntro?.underHeader}
          imageAspect={upcomingIntro?.imageAspect ?? "3:2"}
          imageFit={upcomingIntro?.imageFit ?? "contain"}
          imagePadding={
            typeof upcomingIntro?.imagePadding === "boolean"
              ? upcomingIntro.imagePadding
              : true
          }
        />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
