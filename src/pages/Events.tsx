// src/pages/Events.tsx
import { useState } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import PageHero from "@/components/shared/PageHero";

import EventsPageRenderer from "@/components/sections/EventsPageRenderer";

import heroImage from "@/assets/hero-people.jpg";
import eventsPage from "@/content/eventsPage.json";

const Events = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { hero, sections } = eventsPage as any;

  const openRegister = () => setIsFormOpen(true);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      <main className="pt-20 sm:pt-24 lg:pt-28">
        <PageHero
          eyebrow={hero.eyebrow}
          title={hero.title}
          description={hero.description}
          primaryCtaText={hero.primaryCta?.label}
          onPrimaryClick={openRegister}
          variant="image"
          backgroundImage={heroImage}
          overlayStrength={hero.overlayStrength ?? 0.5}
          theme={hero.theme ?? "dark"}
        />

        <EventsPageRenderer sections={sections} onRegister={openRegister} />
      </main>

      <Footer />
    </div>
  );
};

export default Events;
