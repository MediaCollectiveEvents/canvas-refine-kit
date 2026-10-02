import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import EventsListing from "@/components/sections/EventsListing";

const Events: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const handleRegisterClick = (id: string) => {
    setSelectedEventId(id);
    setIsFormOpen(true);
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} preselectedEvent={selectedEventId} />
      <EventsListing onRegisterClick={handleRegisterClick} />
      <Footer />
    </div>
  );
};

export default Events;
