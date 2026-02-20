// src/pages/Home.tsx
import { useState } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";
import EventRegistrationForm from "@/components/EventRegistrationForm";

// ✅ Default import – matches `export default HomepageRenderer` in the component file
import HomepageRenderer from "@/components/sections/HomepageRenderer";

import homepage from "@/content/homepage.json";
import { heroImageMap } from "@/lib/heroImageMap";

const Home = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // homepage.json shape: { hero, sections, ... }
  const { hero, sections } = homepage as any;

  const handleOpenRegister = () => setIsFormOpen(true);

  // ✅ Resolve hero background from JSON imageKey with a safe fallback
  const heroBackground =
    (hero as any).imageKey && heroImageMap[(hero as any).imageKey]
      ? heroImageMap[(hero as any).imageKey]
      : heroImageMap.defaultHero;

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
          backgroundImage={heroBackground}
          overlayStrength={hero.overlayStrength ?? 0.5}
          // 👇 hero.theme comes straight from homepage.json (dark/light)
          theme={hero.theme ?? "dark"}
        />

        {/* JSON-driven homepage sections (order = order in homepage.json) */}
        <HomepageRenderer sections={sections} onRegister={handleOpenRegister} />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
