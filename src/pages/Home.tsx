import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";
import SectionDivider from "@/components/shared/SectionDivider";
import AboutSection from "@/components/sections/AboutSection";
import FAQSection from "@/components/sections/FAQSection";
import ValuePillarsSection from "@/components/sections/ValuePillarsSection";
import EventsSection from "@/components/sections/EventsSection";
import EventRegistrationForm from "@/components/EventRegistrationForm";

import heroImage from "@/assets/hero-placeholder.jpg";
import homepage from "@/content/homepage.json";

const Home = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Shared registration modal */}
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      <main>
        {/* HERO */}
        <PageHero
          eyebrow="The Media Collective"
          title={homepage.heroTitle}
          description={homepage.heroSubtitle}
          variant="image"
          backgroundImage={heroImage}
          // no CTA on hero now
          ctaText={undefined}
          onCtaClick={undefined}
        />

        {/* ⛔️ SectionDivider under hero REMOVED */}

        {/* ABOUT SECTION */}
        <AboutSection />

        {/* FAQ SECTION */}
        <FAQSection />

        <SectionDivider />

        {/* UPCOMING EVENTS */}
        <EventsSection onRegisterClick={() => setIsFormOpen(true)} />

        <SectionDivider />

        {/* VALUE PILLARS */}
        <ValuePillarsSection onRegisterClick={() => setIsFormOpen(true)} />

        {/* bottom divider was already removed earlier */}
      </main>

      <Footer />
    </div>
  );
};

export default Home;
