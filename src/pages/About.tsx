import { useState } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import WhoAttendsSection from "@/components/sections/WhoAttendsSection";
import MissionValuesSection from "@/components/sections/MissionValuesSection";
import EventFormatsSection from "@/components/sections/EventFormatsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import FAQSection from "@/components/sections/FAQSection";

import EventRegistrationForm from "@/components/EventRegistrationForm";
import PageHero from "@/components/shared/PageHero";
import PageSection from "@/components/shared/PageSection";
import PageCTA from "@/components/shared/PageCTA";

import heroImage from "@/assets/hero-placeholder.jpg";

const About = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Header />
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      {/* Hero */}
      <PageHero
        eyebrow="Our Community"
        title="Our Story"
        description="Born during a period of limited in‑person interaction, The Media Collective was created to reconnect the industry."
        variant="image"
        backgroundImage={heroImage}
      />

      <main>
        <PageSection variant="default">
          <WhoAttendsSection />
        </PageSection>

        <PageSection variant="accent">
          <MissionValuesSection />
        </PageSection>

        <PageSection variant="darker">
          <EventFormatsSection />
        </PageSection>

        <PageSection variant="default">
          <TestimonialsSection />
        </PageSection>

        <PageSection variant="darker">
          <FAQSection />
        </PageSection>

        <PageSection variant="accent" className="py-20">
          <PageCTA onClick={() => setIsFormOpen(true)} />
        </PageSection>
      </main>

      <Footer />
    </div>
  );
};

export default About;
