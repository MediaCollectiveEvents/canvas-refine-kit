import Seo from "@/components/shared/Seo";
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

  const { hero, sections } = partnersContent;

  const openRegister = () => setIsFormOpen(true);

  return (
    <div className="min-h-screen bg-background">
      <Seo title={`${hero.title} — The Media Collective`} description={hero.description} />
      <Header />

      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      {/* Match header clearance with other pages */}
      <main className="pt-[88px] sm:pt-[96px] lg:pt-[104px]">
        <PageHero
          /* TEXT CONTENT */
          eyebrow={hero?.eyebrow}
          title={hero?.title}
          description={hero?.description}

          presentation="business"
          editorialCoherence
          primaryCtaText={hero?.primaryCta?.label ?? hero?.cta?.label}
          primaryCtaHref={(hero?.primaryCta ?? hero?.cta)?.url === "/register" ? undefined : (hero?.primaryCta ?? hero?.cta)?.url}
          onPrimaryClick={(hero?.primaryCta ?? hero?.cta)?.url === "/register" ? openRegister : undefined}
          image={hero?.image}
        />

        <PartnersPageRenderer sections={sections} onRegister={openRegister} />
      </main>

      <Footer />
    </div>
  );
};

export default Partners;
