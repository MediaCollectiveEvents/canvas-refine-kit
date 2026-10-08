// Shared listing content for the public events page and Decap draft preview.
import React, { useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import PageHero from "@/components/shared/PageHero";

import { getEventContent, getUpcomingEvents, getPastEvents, formatEventDate, isPastEvent, type EventItem } from "@/lib/events";

// Event artwork from assets
import broadcaster from "@/assets/events/broadcaster.png";
import handandflower from "@/assets/events/handandflower.png";
import traveller from "@/assets/events/traveller.png";

const eventImages: Record<string, string> = {
  "off-air": "/uploads/off-air.png",
  "mpts-networking-reception-2027": "/uploads/Venue tiles/Handandflower.png",
  "ibc-networking-breakfast-2027": "/uploads/Venue tiles/RAI.png",
  "ibc-decompression-party-2027": "/uploads/Venue tiles/Livepiano.png",
  greenline: "/uploads/Venue tiles/Eurostar.png",
  broadcaster,
  handandflower,
  traveller,
};

interface EventCardProps {
  event: EventItem;
  index: number;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  index,
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
        <figure className={index % 2 === 1 ? "lg:order-2" : ""}>
          <div className="relative overflow-hidden rounded-none">
            {imageSrc && (
              <img
                src={imageSrc}
                alt={event.title}
                className="w-full h-auto object-contain"
              />
            )}
          </div>
          {["mpts-networking-reception-2027", "ibc-networking-breakfast-2027", "ibc-decompression-party-2027", "greenline"].includes(event.imageKey || "") && (
            <figcaption className="pt-3 text-sm leading-[1.5] text-muted-foreground">
              <span className="block font-body">Illustrative artwork. Event location:</span>
              <span className="block font-display font-medium">{event.venue}</span>
              <span className="block font-body">{event.location}</span>
            </figcaption>
          )}
        </figure>

        {/* Content */}
        <div
          className={`space-y-6 ${
            index % 2 === 1 ? "lg:order-1" : ""
          }`}
        >
          {/* Date / Time */}
          <div
            className={`flex flex-wrap items-center gap-x-3 gap-y-2 text-muted-foreground font-display text-sm uppercase tracking-widest ${
              index % 2 === 1 ? "" : ""
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
            {event.title}
          </h3>

          {/* Venue / Location */}
          <div
            className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-white/65 font-display uppercase tracking-wider text-sm ${
              index % 2 === 1 ? "" : ""
            }`}
          >
            <span>{event.venue}</span>
            {event.venue && event.location && <span>·</span>}
            <span>{event.location}</span>
          </div>

          {/* Short Description */}
          <p className="text-muted-foreground font-body text-base leading-relaxed max-w-lg">
            {event.summary || event.description || "Programme details will be announced."}
          </p>

          {/* CTA Row */}
          <div
            className={`flex flex-wrap gap-4 items-center ${
              index % 2 === 1 ? "" : ""
            }`}
          >
            <Button asChild variant="textcta" size="text">
              <a href={`/events/${event.id}`}>Learn more</a>
            </Button>
          </div>
        </div>
      </div>


    </motion.div>
  );
};

export default function EventsListing({ content, showPastEventsInitially = false }: {
  content?: unknown;
  // Editors must still see historical records in the draft preview.
  showPastEventsInitially?: boolean;
}) {
  const [showPastEvents, setShowPastEvents] = useState(showPastEventsInitially);
  const { hero, intro } = getEventContent(content);
  const upcomingEvents = getUpcomingEvents(undefined, content);
  const pastEvents = getPastEvents(content);
  return (
      <main className="bg-[#101d24] site-header-clearance">
        {/* HERO */}
        <PageHero
          presentation="business"
          editorialCoherence
          eyebrow={hero.eyebrow}
          title={hero.title}
          description={hero.description}
          image={hero.image}
          primaryCtaText={hero.cta?.label}
          primaryCtaHref={hero.cta?.url}
        />

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

        <div id="event-results">
        {/* UPCOMING EVENTS */}
        {upcomingEvents.length > 0 && <section className="pt-12 pb-16 md:pt-16 md:pb-20 px-6 relative">
          <div className="container mx-auto max-w-6xl relative z-10">
            <h2 className="mb-8 font-display text-[30px] font-light leading-tight text-white md:mb-12 md:text-4xl">Upcoming Events</h2>
            <div className="space-y-24">
              {upcomingEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </div>
        </section>}

        {pastEvents.length > 0 && <div className="px-6 pb-12">
          <div className="container mx-auto max-w-6xl">
            <button
              type="button"
              aria-expanded={showPastEvents}
              aria-controls="past-events"
              onClick={() => setShowPastEvents(previous => !previous)}
              className="inline-block py-3 font-display text-sm font-medium text-[#35C5BB] underline-offset-[6px] transition-opacity hover:underline hover:opacity-80 focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {showPastEvents ? "Hide past events" : "View past events"}
            </button>
          </div>
        </div>}

        {/* PAST EVENTS */}

        {showPastEvents && pastEvents.length > 0 && (
          <section id="past-events" className={`pb-16 md:pb-20 px-6 border-t border-white/10 ${upcomingEvents.length ? "pt-16 md:pt-20" : "pt-12 md:pt-16"}`}>
            <div className="container mx-auto max-w-6xl">
              <h2 className="mb-8 font-display text-[30px] font-light leading-tight text-white md:mb-12 md:text-4xl">Past Events</h2>
              <div className="space-y-24">
                {pastEvents.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        </div>

      </main>
  );
}
