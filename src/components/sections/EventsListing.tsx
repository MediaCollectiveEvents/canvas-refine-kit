// Shared listing content for the public events page and Decap draft preview.
import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

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

const EventCard: React.FC<EventCardProps> = ({ event, index }) => {
  const reducedMotion = useReducedMotion();
  const imageSrc = event.imageKey ? eventImages[event.imageKey] : undefined;
  const imageOnRight = index % 2 === 1;
  const textColumn = imageOnRight ? "lg:col-start-1" : "lg:col-start-2";
  return (
    <motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.6 }}
      viewport={{ once: true }}
      className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-start gap-x-5 gap-y-4 border-b border-white/10 pb-8 last:border-0 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-5 lg:pb-12"
    >
      <div className={`col-span-2 lg:col-span-1 lg:row-start-1 ${textColumn}`}>
        <p className="mb-3 font-display text-base font-medium text-primary"><time dateTime={event.date}>{formatEventDate(event.date)}</time>{isPastEvent(event) && <span className="ml-3 text-muted-foreground">Past event</span>}</p>
        <h4 className="font-display text-2xl font-light leading-tight text-white md:text-3xl lg:text-4xl">{event.title}</h4>
      </div>
      <figure className={`col-start-1 row-start-2 lg:row-start-1 lg:row-span-2 ${imageOnRight ? "lg:col-start-2" : "lg:col-start-1"}`}>
        {imageSrc && <img src={imageSrc} alt="" loading="lazy" width={1080} height={1080} className="aspect-square w-full rounded-xl object-contain" />}
      </figure>
      <div className={`min-w-0 space-y-4 lg:row-start-2 ${textColumn}`}>
        <p className="font-body text-base leading-relaxed text-white/75">{event.time && <span className="block">{event.time}</span>}{event.venue}{event.venue && event.location && " · "}{event.location}</p>
        <p className="max-w-lg font-body text-base leading-relaxed text-muted-foreground">{event.summary || event.description || "Programme details will be announced."}</p>
        <Button asChild variant="textcta" size="text" className="min-h-11"><a href={`/events/${event.id}`}>Learn more</a></Button>
      </div>
    </motion.article>
  );
};

function ChronologicalGroups({ events }: { events: EventItem[] }) {
  const years = [...new Set(events.map(event => event.date.slice(0, 4)))];
  return <div className="space-y-12 lg:space-y-16">{years.map(year => <section key={year} aria-labelledby={`events-year-${year}-${isPastEvent(events[0]) ? "past" : "upcoming"}`}>
    <h3 id={`events-year-${year}-${isPastEvent(events[0]) ? "past" : "upcoming"}`} className="mb-6 border-b border-white/10 pb-3 font-display text-xl font-medium text-primary">{year}</h3>
    <div className="space-y-8 lg:space-y-16">{events.filter(event => event.date.startsWith(year)).map((event, index) => <EventCard key={event.id} event={event} index={index} />)}</div>
  </section>)}</div>;
}

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
          homepageTextAlignment
          compactMobile
          eyebrow={hero.eyebrow}
          title={hero.title}
          description={hero.description}
          image={hero.image}
          primaryCtaText={hero.cta?.label}
          primaryCtaHref={hero.cta?.url}
        />

        {/* INTRO SECTION */}
        {intro?.title && (
          <section className="site-section border-b border-white/10">
            <div className="site-container">
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
        {upcomingEvents.length > 0 && <section className="site-section relative">
          <div className="site-container relative z-10">
            <h2 className="mb-8 font-display text-[30px] font-light leading-tight text-white md:mb-12 md:text-4xl">Upcoming Events</h2>
            <ChronologicalGroups events={upcomingEvents} />
          </div>
        </section>}

        {pastEvents.length > 0 && <div className="site-gutter pb-12">
          <div className="site-container">
            <button
              type="button"
              aria-expanded={showPastEvents}
              aria-controls="past-events"
              onClick={() => setShowPastEvents(previous => !previous)}
              className="inline-block py-3 font-display text-base font-medium text-[#35C5BB] underline-offset-[6px] transition-opacity hover:underline hover:opacity-80 focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {showPastEvents ? "Hide past events" : "View past events"}
            </button>
          </div>
        </div>}

        {/* PAST EVENTS */}

        {showPastEvents && pastEvents.length > 0 && (
          <section id="past-events" className="site-section border-b border-white/10">
            <div className="site-container">
              <h2 className="mb-8 font-display text-[30px] font-light leading-tight text-white md:mb-12 md:text-4xl">Past Events</h2>
              <ChronologicalGroups events={pastEvents} />
            </div>
          </section>
        )}

        </div>

      </main>
  );
}
