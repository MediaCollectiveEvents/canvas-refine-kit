// Shared listing content for the public events page and Decap draft preview.
import React, { useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import EventExperienceFilters from "@/components/shared/EventExperienceFilters";
import PageHero from "@/components/shared/PageHero";

import { getEventContent, getUpcomingEvents, getPastEvents, getAttendanceRegistrationId, isPastEvent, filterEventsByExperience, type EventExperienceFilter, type EventItem } from "@/lib/events";

// Event artwork from assets
import greenline from "@/assets/events/greenline.png";
import broadcaster from "@/assets/events/broadcaster.png";
import handandflower from "@/assets/events/handandflower.png";
import traveller from "@/assets/events/traveller.png";

const eventImages: Record<string, string> = {
  "off-air": "/uploads/off-air.png",
  greenline,
  broadcaster,
  handandflower,
  traveller,
};

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
  event: EventItem;
  index: number;
  isOpen: boolean;
  onToggleDetails: () => void;
  onRegisterClick?: () => void;
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
            className={`flex flex-wrap items-center gap-x-3 gap-y-2 text-muted-foreground font-body text-sm uppercase tracking-widest ${
              index % 2 === 1 ? "lg:justify-end" : ""
            }`}
          >
            <span>{formattedDate}</span>
            {isPastEvent(event) && <span className="normal-case tracking-normal">Past event</span>}
            {event.time && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>{event.time}</span>
              </>
            )}
          </div>

          {/* Title – Montserrat via font-display */}
          <h3 className="font-display text-[30px] font-light md:text-4xl text-white leading-tight">
            <a href={`/events/${event.id}`}>{event.title}</a>
          </h3>

          {/* Venue / Location */}
          <div
            className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-white/65 font-body uppercase tracking-wider text-sm ${
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
            className={`flex flex-wrap gap-4 items-center ${
              index % 2 === 1 ? "lg:justify-end" : ""
            }`}
          >
            {/* View details (expands in-page) */}
            <Button
              variant="ghost"
              className="rounded-full font-body uppercase tracking-wider text-xs px-4"
              onClick={onToggleDetails}
            >
              {isOpen ? "Hide Details" : "View Details"}
            </Button>

            {onRegisterClick ? <Button variant="brand" onClick={onRegisterClick}>
              Register Interest <ArrowRight className="ml-2 h-4 w-4" />
            </Button> : <Button asChild variant="textcta" size="text">
              <a href={`/events/${event.id}`}>View event <ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>}
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

export default function EventsListing({ content, onRegisterClick }: {
  content?: unknown;
  onRegisterClick?: (registrationId: string) => void;
}) {
  const [openEventId, setOpenEventId] = useState<number | null>(null);
  const [experience, setExperience] = useState<EventExperienceFilter>("all");
  const { hero, intro } = getEventContent(content);
  const upcomingEvents = filterEventsByExperience(getUpcomingEvents(undefined, content), experience);
  const pastEvents = filterEventsByExperience(getPastEvents(content), experience);
  const handleToggleDetails = (id: number) => setOpenEventId(previous => previous === id ? null : id);
  return (
      <main className="bg-[#101d24] pt-[88px] sm:pt-[96px] lg:pt-[104px]">
        {/* HERO */}
        <div className="[&>header]:min-h-[440px] [&>header]:pb-8 [&>header]:lg:min-h-[560px]">
        <PageHero
          presentation="business"
          eyebrow={hero.eyebrow}
          title={hero.title}
          description={hero.description}
          image={hero.image}
          primaryCtaText={hero.cta?.label}
          primaryCtaHref={hero.cta?.url}
        />
        </div>

        {/* INTRO SECTION */}
        {intro?.title && (
          <section className="py-12 md:py-16 px-6">
            <div className="container mx-auto max-w-6xl">
              <h2 className="font-display text-[30px] font-light leading-tight text-white md:text-4xl">{intro.title}</h2>
              {intro.body && (
                <p className="mt-4 text-muted-foreground font-body text-base leading-relaxed">
                  {intro.body}
                </p>
              )}
            </div>
          </section>
        )}

        <section aria-label="Filter events by experience" className="px-6 pt-8 md:pt-12">
          <div className="container mx-auto max-w-6xl">
            <p className="mb-4 font-body text-sm text-muted-foreground">Explore by experience</p>
            <EventExperienceFilters value={experience} onChange={setExperience} resultsId="event-results" />
            <Button asChild variant="textcta" size="text" className="mt-6">
              <a href="/events/calendar">View year planner →</a>
            </Button>
            <p role="status" className="mt-4 font-body text-sm text-muted-foreground">
              {upcomingEvents.length + pastEvents.length === 0
                ? "No events match this experience yet. Explore all events."
                : `${upcomingEvents.length + pastEvents.length} events`}
            </p>
          </div>
        </section>

        <div id="event-results">
        {/* UPCOMING EVENTS */}
        {upcomingEvents.length > 0 && <section className="pt-12 pb-16 md:pt-16 md:pb-20 px-6 relative">
          <div className="container mx-auto max-w-6xl relative z-10">
            <h2 className="mb-8 font-display text-[30px] font-light leading-tight text-white md:mb-12 md:text-4xl">Upcoming Events</h2>
            <div className="space-y-24">
              {upcomingEvents.map((event, index) => {
                const registrationId = getAttendanceRegistrationId(event, content);
                return (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                  isOpen={openEventId === event.id}
                  onToggleDetails={() => handleToggleDetails(event.id)}
                  onRegisterClick={registrationId && onRegisterClick ? () => onRegisterClick(registrationId) : undefined}
                />
              );})}
            </div>
          </div>
        </section>}

        {/* PAST EVENTS */}

        {pastEvents.length > 0 && (
          <section className={`pb-16 md:pb-20 px-6 border-t border-white/10 ${upcomingEvents.length ? "pt-16 md:pt-20" : "pt-12 md:pt-16"}`}>
            <div className="container mx-auto max-w-6xl">
              <h2 className="mb-8 font-display text-[30px] font-light leading-tight text-white md:mb-12 md:text-4xl">Past Events</h2>
              <div className="space-y-24">
                {pastEvents.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index}
                    isOpen={openEventId === event.id}
                    onToggleDetails={() => handleToggleDetails(event.id)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        </div>

        {/* CTA */}
        <section className="border-t border-white/10 bg-[#172b31] px-6 py-12 md:py-16">
          <div className="container mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h2 className="font-display text-[30px] font-light leading-tight text-white md:text-4xl">Want to attend our next event?</h2>
              <p className="mt-5 max-w-2xl text-base leading-[1.8] text-slate-300">Anyone can request an invitation. Attendance is subject to The Media Collective’s event curation. All events are free to attend; membership is not required.</p>
            </div>
            <div className="lg:col-span-4 lg:justify-self-end">
              <Button variant="brand" size="lg" onClick={() => onRegisterClick?.("")}>Register Interest</Button>
            </div>
          </div>
        </section>
      </main>
  );
}
