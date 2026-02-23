// src/pages/Partners.tsx
import { useState } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import PageHero from "@/components/shared/PageHero";
import PartnersPageRenderer from "@/components/sections/PartnersPageRenderer";

import partnersContent from "@/content/partners.json";

const Partners = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { hero, sections } = partnersContent as any;

  const openRegister = () => setIsFormOpen(true);

  // ✅ Resolve hero background from JSON imageKey with a safe fallback
  // Expecting something like hero.imageKey = "partners-hero.jpg" and the file living in /public/images/
  const heroBackgroundImage: string | undefined = (hero as any)?.imageKey
    ? `/images/${(hero as any).imageKey}`
    : (hero as any)?.image; // optional fallback if your JSON already has a direct URL/path

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      <main className="pt-20 sm:pt-24 lg:pt-28">
        <PageHero
          eyebrow={hero?.eyebrow ?? "Partnership Opportunities"}
          title={hero?.title ?? "Become a Partner"}
          description={
            hero?.description ??
            "Partner with The Media Collective and connect your brand with the most influential voices in media and entertainment."
          }
          primaryCtaText={hero?.primaryCta?.label}
          onPrimaryClick={openRegister}
          variant="image"
          backgroundImage={heroBackgroundImage}
          overlayStrength={hero?.overlayStrength ?? 0.5}
          theme={hero?.theme ?? "dark"}
        />

        <PartnersPageRenderer sections={sections} onRegister={openRegister} />
      </main>

      <Footer />
    </div>
  );
};

export default Partners;
