
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ValuePillarsSection from "@/components/sections/ValuePillarsSection";
import EventsSection from "@/components/sections/EventsSection";
import EventRegistrationForm from "@/components/EventRegistrationForm";

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
        <HeroSection onRegisterClick={() => setIsFormOpen(true)} />

        {/* Decorative Divider */}
        <div className="relative py-8">
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex justify-center">
            <div className="w-3 h-3 rounded-full bg-primary/60 ring-4 ring-primary/20" />
          </div>
        </div>

        {/* ABOUT SECTION */}
        <AboutSection />

        {/* Decorative Divider */}
        <div className="relative py-8">
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--icon-lime))]" />
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--icon-cyan))]" />
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--icon-red))]" />
          </div>
        </div>

        {/* UPCOMING EVENTS */}
        <EventsSection onRegisterClick={() => setIsFormOpen(true)} />

        {/* Decorative Divider */}
        <div className="relative py-8">
          <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex justify-center">
            <div className="w-3 h-3 rounded-full bg-primary/60 ring-4 ring-primary/20" />
          </div>
        </div>

        {/* VALUE PILLARS */}
        <ValuePillarsSection onRegisterClick={() => setIsFormOpen(true)} />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
