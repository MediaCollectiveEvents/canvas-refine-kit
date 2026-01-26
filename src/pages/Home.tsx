
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ValuePillarsSection from "@/components/sections/ValuePillarsSection";
import EventsSection from "@/components/sections/EventsSection";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import SectionDivider from "@/components/shared/SectionDivider";

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
        <SectionDivider variant="single" />

        {/* ABOUT SECTION */}
        <AboutSection />

        {/* Decorative Divider */}
        <SectionDivider variant="triple" />

        {/* UPCOMING EVENTS */}
        <EventsSection onRegisterClick={() => setIsFormOpen(true)} />

        {/* Decorative Divider */}
        <SectionDivider variant="single" />

        {/* VALUE PILLARS */}
        <ValuePillarsSection onRegisterClick={() => setIsFormOpen(true)} />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
