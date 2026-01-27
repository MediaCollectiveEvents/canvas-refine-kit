
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";
import AboutSection from "@/components/sections/AboutSection";
import ValuePillarsSection from "@/components/sections/ValuePillarsSection";
import EventsSection from "@/components/sections/EventsSection";
import EventRegistrationForm from "@/components/EventRegistrationForm";

import heroImage from "@/assets/hero-placeholder.jpg";

const Home = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Shared registration modal */}
      <EventRegistrationForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />

      <main>
        {/* HERO */}
        <PageHero
          eyebrow="The Media Collective"
          title="Curated Events"
          description="Exclusive networking events for senior executives and innovators across the global media landscape."
          variant="image"
          backgroundImage={heroImage}
          ctaText="Register Your Interest"
          onCtaClick={() => setIsFormOpen(true)}
        />

        {/* Gradient transition divider */}
        <div className="relative h-24 bg-gradient-to-b from-black/60 to-background overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        {/* ABOUT SECTION */}
        <AboutSection />


        {/* UPCOMING EVENTS */}
        <EventsSection onRegisterClick={() => setIsFormOpen(true)} />


        {/* VALUE PILLARS */}
        <ValuePillarsSection onRegisterClick={() => setIsFormOpen(true)} />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
