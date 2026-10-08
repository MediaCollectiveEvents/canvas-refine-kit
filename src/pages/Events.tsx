import Seo from "@/components/shared/Seo";
import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EventsListing from "@/components/sections/EventsListing";

import { getEventContent } from "@/lib/events";

const Events: React.FC = () => {
  const eventContent = getEventContent();
  return (
    <div className="min-h-screen bg-background">
      <Seo title={`${eventContent.hero.title} — The Media Collective`} description={eventContent.hero.description} />
      <Header />
      <EventsListing />
      <Footer />
    </div>
  );
};

export default Events;
