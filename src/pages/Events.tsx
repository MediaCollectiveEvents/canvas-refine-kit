import Seo from "@/components/shared/Seo";
import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import EventsListing from "@/components/sections/EventsListing";

import { getEventContent } from "@/lib/events";

const Events: React.FC = () => {
  const eventContent = getEventContent();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const handleRegisterClick = (id: string) => {
    setSelectedEventId(id);
    setIsFormOpen(true);
  };
  return (
    <div className="min-h-screen bg-background">
      <Seo title={`${eventContent.hero.title} — The Media Collective`} description={eventContent.hero.description} />
      <Header />
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} preselectedEvent={selectedEventId} />
      <EventsListing onRegisterClick={handleRegisterClick} />
      <Footer />
    </div>
  );
};

export default Events;
