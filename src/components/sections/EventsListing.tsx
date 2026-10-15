// Shared listing content for the public events page and Decap draft preview.
import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import PageHero from "@/components/shared/PageHero";
import EventTags from "@/components/shared/EventTags";
import OurEventsSection from "./OurEventsSection";
import EventCategoriesSection from "./EventCategoriesSection";
import eventsPageContent from "@/content/eventsPage.json";

import { getEventCapacity, getEventContent, getUpcomingEvents, getPastEvents, formatEventDate, isPastEvent, type EventItem } from "@/lib/events";

import { getEventImage } from "@/lib/eventImages";

interface EventCardProps {
  event: EventItem;
  index: number;
}

const EventCard: React.FC<EventCardProps> = ({ event, index }) => {
  const reducedMotion = useReducedMotion();
  const imageSrc = getEventImage(event, false);
  const imageOnRight = index % 2 === 1;
  const textColumn = imageOnRight ? "lg:col-start-1" : "lg:col-start-2";
  const capacity = getEventCapacity(event);
  return (
    <motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.6 }}
      viewport={{ once: true }}
      className={`grid items-start gap-y-4 border-b border-white/10 pb-8 last:border-0 site-event-grid ${imageOnRight ? "site-event-grid-reversed" : ""} lg:gap-y-5 lg:pb-12`}
    >
      <div className={`col-span-2 lg:col-span-1 lg:row-start-1 ${textColumn}`}>
        <p className="mb-3 font-display text-base font-medium text-primary"><time dateTime={event.date}>{formatEventDate(event.date)}</time>{isPastEvent(event) && <span className="ml-3 text-muted-foreground">Past event</span>}</p>
        <h4 className="font-display text-2xl font-light leading-tight text-white md:text-3xl lg:text-4xl">{event.title}</h4>
        {event.historyLabel && <p className="mt-3 font-body text-sm text-white/65">{event.historyLabel}</p>}
      </div>
      <figure className={`col-start-1 row-start-2 lg:row-start-1 lg:row-span-2 ${imageOnRight ? "lg:col-start-2" : "lg:col-start-1"}`}>
        {imageSrc && <img src={imageSrc} alt="" loading="lazy" width={1080} height={1080} className="aspect-square w-full rounded-xl object-contain" />}
      </figure>
      <div className={`min-w-0 space-y-4 lg:row-start-2 ${textColumn}`}>
        <p className="font-body text-base leading-relaxed text-white/75">{event.time && <span className="block">{event.time}</span>}{event.venue}{event.venue && event.location && " · "}{event.location}</p>
        {capacity !== undefined && <p className="font-body text-base leading-relaxed text-white/75">Capacity: {capacity}{event.capacity_label ? ` ${event.capacity_label.toLowerCase()}` : ""}</p>}
        {event.partnerEvent && event.attendanceStatement && <p className="font-body text-base leading-[1.6] text-white/65">{event.attendanceStatement}</p>}
        <EventTags event={event} />
        <p className="max-w-[75ch] font-body text-base leading-[1.7] text-muted-foreground">{event.summary || event.description || "Programme details will be announced."}</p>
        <a href={`/events/${event.id}`} className="site-secondary-action">Learn more</a>
      </div>
    </motion.article>
  );
};

function ChronologicalGroups({ events }: { events: EventItem[] }) {
  const years = [...new Set(events.map(event => event.date.slice(0, 4)))];
  return <div className="space-y-12 lg:space-y-16">{years.map(year => <section key={year} aria-labelledby={`events-year-${year}-${isPastEvent(events[0]) ? "past" : "upcoming"}`}>
    <h3 id={`events-year-${year}-${isPastEvent(events[0]) ? "past" : "upcoming"}`} className="mb-6 border-b border-white/10 pb-3 font-display text-xl font-medium text-primary">{year}</h3>
    <div className="space-y-8 lg:space-y-16">{events.map((event, index) => event.date.startsWith(year) ? <EventCard key={event.id} event={event} index={index} /> : null)}</div>
  </section>)}</div>;
}

export default function EventsListing({ content, layoutContent = eventsPageContent, showPastEventsInitially = false }: {
  content?: unknown;
  layoutContent?: typeof eventsPageContent;
  // Editors must still see historical records in the draft preview.
  showPastEventsInitially?: boolean;
}) {
  const [showPastEvents, setShowPastEvents] = useState(showPastEventsInitially);
  const { hero, intro } = getEventContent(content);
  const layoutIntro = layoutContent.sections.find(section => section.type === "eventsIntro" && !section.hidden);
  const displayedIntro = intro.title ? intro : layoutIntro;
  const upcomingEvents = getUpcomingEvents(undefined, content);
  const pastEvents = getPastEvents(content);
  return (
      <main className="bg-[#101d24] site-header-clearance">
        {/* HERO */}
        <PageHero
          presentation="public"
          eyebrow={hero.eyebrow}
          title={hero.title}
          description={hero.description}
          descriptionClassName="!text-[#9bd3c8] min-h-[4.875em]"
          image={hero.image}
          primaryCtaText={hero.cta?.label}
          primaryCtaHref={hero.cta?.url}
        />

        {/* INTRO SECTION */}
        {displayedIntro?.title && (
          <section className="site-section border-b border-white/10 !pb-8 md:!pb-10">
            <div className="site-container">
              <h2 className="site-heading text-[#f7f3eb]">{displayedIntro.title}{"accentWord" in displayedIntro && displayedIntro.accentWord && ` ${displayedIntro.accentWord}`}</h2>
              {displayedIntro.body && (
                <p className="mt-4 text-muted-foreground font-body text-base leading-[1.6] md:text-lg">
                  {displayedIntro.body}
                </p>
              )}
            </div>
          </section>
        )}

        <div id="event-results">
        {/* UPCOMING EVENTS */}
        {upcomingEvents.length > 0 && <section aria-label="Upcoming event listings" className={`site-section relative ${displayedIntro?.title ? "!pt-8 md:!pt-10" : ""}`}>
          <div className="site-container relative z-10">
            {!displayedIntro?.title && <h2 className="mb-8 font-display text-[30px] font-light leading-tight text-white md:mb-12 md:text-4xl">Upcoming Events</h2>}
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
              className="site-secondary-action"
            >
              {showPastEvents ? "Hide past events" : "View past events"}
            </button>
          </div>
        </div>}

        {/* PAST EVENTS */}

        {pastEvents.length > 0 && (
          <section id="past-events" hidden={!showPastEvents} className="site-section border-b border-white/10">
            <div className="site-container">
              <h2 className="mb-8 font-display text-[30px] font-light leading-tight text-white md:mb-12 md:text-4xl">Past Events</h2>
              <ChronologicalGroups events={pastEvents} />
            </div>
          </section>
        )}

        </div>

        {/* OPTIONAL PROGRAMME REFERENCES FOLLOW THE DATED LISTINGS */}
        {layoutContent.sections.filter(section => section.type === "eventFormats" && !section.hidden).map(section => <OurEventsSection key={section.id} section={section} content={content} />)}
        {layoutContent.sections.filter(section => section.type === "eventCategories" && !section.hidden).map(section => <EventCategoriesSection key={section.id} section={section} content={content} />)}
      </main>
  );
}
