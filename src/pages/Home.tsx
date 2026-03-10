// src/pages/Home.tsx
import { useState } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";
import EventRegistrationForm from "@/components/EventRegistrationForm";

import HomepageRenderer from "@/components/sections/HomepageRenderer";

import homepageContent from "@/content/homepage.json";

const Home = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { hero, sections } = homepageContent as any;

  const handleOpenRegister = () => setIsFormOpen(true);

  return (
    <div className="min-h-screen">
      <Header />

      <EventRegistrationForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />

      {/* FULL-WIDTH HERO (RESTORES ORIGINAL LAYOUT) */}
      <div className="w-full bg-[#0b111a]">
        <main className="pt-[160px] sm:pt-[180px] lg:pt-[200px]">
          <PageHero
            eyebrow={hero?.subtitle}
            title={hero?.title}
            description={hero?.description}
            primaryCtaText={hero?.cta?.label}
            onPrimaryClick={hero?.cta?.label ? handleOpenRegister : undefined}
            image={hero?.image}
            theme={hero?.theme ?? "dark"}
            overlayStrength={hero?.overlayStrength ?? 0.5}
            mobileCrop={hero?.mobileCrop}
            imagePosition={hero?.imagePosition}
            imageOffset={hero?.imageOffset}
          />
        </main>
      </div>

      {/* PAGE CONTENT (WRAPPED AS NORMAL) */}
      <div className="w-full bg-[#f7f7f7]">
        <HomepageRenderer
          sections={sections}
          onRegister={handleOpenRegister}
        />
      </div>

      <Footer />
    </div>
  );
};

export default Home;