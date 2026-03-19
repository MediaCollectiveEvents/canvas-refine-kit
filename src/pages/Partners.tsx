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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      {/* Match header clearance with other pages */}
      <main className="pt-[160px] sm:pt-[180px] lg:pt-[200px]">
        <PageHero
          /* TEXT CONTENT */
          eyebrow={hero?.eyebrow}
          title={hero?.title}
          description={hero?.description}

          /* CTA */
          primaryCtaText={hero?.cta?.label}
          onPrimaryClick={hero?.cta?.label ? openRegister : undefined}

          /* HERO IMAGE CONTROLS */
          image={hero?.image}
          theme={hero?.theme ?? "dark"}
          overlayStrength={hero?.overlayStrength}
          mobileCrop={hero?.mobileCrop}
          imagePosition={hero?.imagePosition}
          imageOffset={hero?.imageOffset}

          /* NEW — PER PAGE FONT COLOUR OVERRIDES */
          eyebrowColor={hero?.eyebrowColor}
          titleColor={hero?.titleColor}
          textColor={hero?.textColor}

          /* NEW — PER PAGE GLOW OVERRIDES */
          backdropStrength={hero?.backdropStrength}
          backdropColor={hero?.backdropColor}
          backdropSize={hero?.backdropSize}
        />

        <PartnersPageRenderer sections={sections} onRegister={openRegister} />
      </main>

      <Footer />
    </div>
  );
};

export default Partners;