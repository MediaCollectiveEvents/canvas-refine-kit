// src/pages/About.tsx
import React, { useState } from "react";

import PageLayout from "@/components/layout/PageLayout";
import PageHero from "@/components/shared/PageHero";
import PageSection from "@/components/shared/PageSection";
import PageCTA from "@/components/shared/PageCTA";

import WhoAttendsSection from "@/components/sections/WhoAttendsSection";
import MissionValuesSection from "@/components/sections/MissionValuesSection";
import EventFormatsSection from "@/components/sections/EventFormatsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import FAQSection from "@/components/sections/FAQSection";

import EventRegistrationForm from "@/components/EventRegistrationForm";

// Use the same hero artwork as the homepage.
// Make sure this file exists in src/assets:
import homeHeroImage from "@/assets/home-hero.png";

const About: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <PageLayout>
      {/* Registration modal */}
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      {/* HERO – unified with homepage */}
      <PageHero
        eyebrow="OUR COMMUNITY"
        title="Our Story"
        description="Born during a period of limited in-person interaction, The Media Collective was created to reconnect the industry."
        image={homeHeroImage}
        variant="image"
      />

      {/* WHO ATTENDS */}
      <PageSection variant="default">
        <WhoAttendsSection />
      </PageSection>

      {/* MISSION & VALUES */}
      <PageSection variant="accent">
        <MissionValuesSection />
      </PageSection>

      {/* EVENT FORMATS */}
      <PageSection variant="darker">
        <EventFormatsSection />
      </PageSection>

      {/* TESTIMONIALS */}
      <PageSection variant="default">
        <TestimonialsSection />
      </PageSection>

      {/* FAQ */}
      <PageSection variant="darker">
        <FAQSection />
      </PageSection>

      {/* CALL TO ACTION */}
      <PageSection variant="accent" className="py-20">
        <PageCTA onClick={() => setIsFormOpen(true)} />
      </PageSection>
    </PageLayout>
  );
};

export default About;
