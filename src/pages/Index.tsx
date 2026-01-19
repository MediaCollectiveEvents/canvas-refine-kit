import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ValuePillarsSection from "@/components/sections/ValuePillarsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import EventsSection from "@/components/sections/EventsSection";
import EventRegistrationForm from "@/components/EventRegistrationForm";

const Index = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />
      <main>
        <HeroSection onRegisterClick={() => setIsFormOpen(true)} />
        <AboutSection />
        <EventsSection onRegisterClick={() => setIsFormOpen(true)} />
        <ValuePillarsSection onRegisterClick={() => setIsFormOpen(true)} />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
