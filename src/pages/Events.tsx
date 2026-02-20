// src/pages/Events.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import SectionDivider from "@/components/shared/SectionDivider";
import SectionHeader from "@/components/shared/SectionHeader";
import PageCTA from "@/components/shared/PageCTA";

import eventsData from "@/content/events.json";
import { heroImageMap } from "@/lib/heroImageMap";

// Event artwork from assets
import greenline from "@/assets/events/greenline.png";
import broadcaster from "@/assets/events/broadcaster.png";
import handandflower from "@/assets/events/handandflower.png";
import traveller from "@/assets/events/traveller.png";

const eventImages: Record<string, string> = {
  greenline,
  broadcaster,
  handandflower,
  traveller,
};

interface Event {
  id: number | string;
  title: string;
  venue: string;
  location: string;
  imageKey?: string;
  date: string;
  time?: string;
  description: string;
  details?: string;
  type: "upcoming" | "past";
}

// Format "2026-03-12" -> "12 March 2026"
const formatEventDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

interface EventCardProps {
  event: Event;
  index: number;
  isOpen: boolean;
  onToggleDetails: () => void;
  onRegisterClick: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  index,
  isOpen,
  onToggleDetails,
  onRegisterClick,
}) => {
  const imageSrc = event.imageKey ? eventImages[event.imageKey] : undefined;
  const formattedDate = formatEventDate(event.date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      viewport={{ once: true }}
      className="group"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Image */}
        <div
          className={`relative overflow-hidden rounded-2xl ${
            index % 2 === 1 ? "lg:order-2" : ""
          }`}
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt={event.title}
              className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div
          className={`space-y-6 ${
            index % 2 === 1 ? "lg:order-1 lg:text-right" : ""
          }`}
        >
          {/* Date / Time */}
          <div
            className={`flex items-center gap-3 text-muted-foreground font-body text-sm uppercase tracking-widest ${
              index % 2 === 1 ? "lg:justify-end" : ""
            }`}
          >
            <span>{formattedDate}</span>
            {event.time && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>{event.time}</span>
              </>
            )}
          </div>

          {/* Title – Montserrat via font-display */}
          <h3 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
            {event.title}
          </h3>

          {/* Venue / Location */}
          <div
            className={`flex items-center gap-2 text-primary font-body uppercase tracking-wider text-sm ${
              index % 2 === 1 ? "lg:justify-end" : ""
            }`}
          >
            <span>{event.venue}</span>
            <span>—</span>
            <span>{event.location}</span>
          </div>

          {/* Short Description */}
          <p className="text-muted-foreground font-body text-base leading-relaxed max-w-lg">
            {event.description}
          </p>

          {/* CTA Row */}
          <div
            className={`flex gap-4 items-center ${
              index % 2 === 1 ? "lg:justify-end" : ""
            }`}
          >
            {/* View details (expands in-page) */}
            <Button
              variant="outline"
              className="rounded-full font-body uppercase tracking-wider text-xs px-4"
              onClick={onToggleDetails}
            >
              {isOpen ? "Hide Details" : "View Details"}
            </Button>

            {/* Register Interest (still opens form) */}
            <Button
              onClick={() =>
                onRegisterClick(
                  event.id === 1
                    ? "nab-review"
                    : event.id === 2
                      ? "mpts-reception"
                      : "ibc-breakfast",
                )
              }
              className="rounded-full font-body uppercase tracking-wider text-sm bg-primary text-primary-foreground hover:bg-primary/90 px-6"
            >
              Register Interest
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded details section */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 border border-border rounded-2xl bg-background/70 px-6 py-5 md:px-8 md:py-6"
        >
          <h4 className="font-display text-lg mb-3 text-foreground">
            Full event description
          </h4>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {event.details || event.description}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

const Events: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [openEventId, setOpenEventId] = useState<number | string | null>(null);

  // JSON-driven hero & intro
  const hero = (eventsData as any).hero || {};
  const intro = (eventsData as any).intro || {};

  // ✅ Resolve hero background from JSON imageKey with a safe fallback
  const heroBackground =
    (hero as any).imageKey && heroImageMap[(hero as any).imageKey]
      ? heroImageMap[(hero as any).imageKey]
      : heroImageMap.defaultHero;

  // JSON-driven events
  const allEvents: Event[] = (eventsData as any).events || [];
  const upcomingEvents = allEvents.filter((e) => e.type === "upcoming");
  const pastEvents = allEvents.filter((e) => e.type === "past");

  const handleRegisterClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsFormOpen(true);
  };

  const handleToggleDetails = (id: number | string) => {
    setOpenEventId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Registration Modal */}
      <EventRegistrationForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        preselectedEvent={selectedEventId}
      />

      <main className="pt-20 sm:pt-24 lg:pt-28">
        {/* HERO */}
        <PageHero
          eyebrow={hero.eyebrow}
          title={hero.title}
          description={hero.description}
          variant="image"
          backgroundImage={heroBackground}
          overlayStrength={hero.overlayStrength ?? 0.5}
          theme={hero.theme ?? "dark"}
        />

        {/* INTRO SECTION */}
        {intro?.title && (
          <section className="py-12 md:py-16 px-6 bg-gradient-to-b from-background via-secondary/10 to-background">
            <div className="container mx-auto max-w-3xl text-center">
              <SectionHeader title={intro.title} accentWord="" />
              {intro.body && (
                <p className="mt-4 text-muted-foreground font-body text-base leading-relaxed">
                  {intro.body}
                </p>
              )}
            </div>
          </section>
        )}

        {/* UPCOMING EVENTS */}
        <section className="py-24 md:py-32 px-6 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
          {/* background blobs */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <SectionHeader title="Upcoming " accentWord="Events" />
            <div className="space-y-24">
              {upcomingEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                  isOpen={openEventId === event.id}
                  onToggleDetails={() => handleToggleDetails(event.id)}
                  onRegisterClick={handleRegisterClick}
                />
              ))}
            </div>
          </div>
        </section>

        {/* PAST EVENTS */}
        {pastEvents.length > 0 && <SectionDivider />}

        {pastEvents.length > 0 && (
          <section className="py-20 px-6 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
            <div className="container mx-auto max-w-6xl">
              <SectionHeader title="Past " accentWord="Events" />
              <div className="space-y-24">
                {pastEvents.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index}
                    isOpen={openEventId === event.id}
                    onToggleDetails={() => handleToggleDetails(event.id)}
                    onRegisterClick={handleRegisterClick}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <SectionDivider className="py-12" />
        <PageCTA
          title="Want to attend our next"
          accentWord="event?"
          description="Become a member of The Media Collective and get exclusive access to all our events and networking opportunities."
          buttonLabel="Register Interest"
          onClick={() => setIsFormOpen(true)}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Events;
