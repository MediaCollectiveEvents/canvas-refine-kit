import React from "react";
import { MapPin, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

import PageSection from "@/components/shared/PageSection";
import SectionHeader from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";

// === Events Data (same logic as homepage EventsSection) ===
import broadcasterImg from "@/assets/events/broadcaster.png";
import handandflowerImg from "@/assets/events/handandflower.png";
import travellerImg from "@/assets/events/traveller.png";

import rawEventsFile from "@/content/events.json";

interface RawEvent {
  id?: number;
  title: string;
  location: string;
  venue: string;
  imageKey?: string;
  date?: string;
}

type RawEventsShape = RawEvent[] | { events: RawEvent[] };

interface Event {
  id: number;
  title: string;
  location: string;
  venue: string;
  date?: string;
  image: string;
}

function getImageForKey(key?: string, venue?: string, title?: string) {
  const value = (key || venue || title || "").toLowerCase();

  if (value.includes("broadcaster")) return broadcasterImg;
  if (value.includes("hand") && value.includes("flower"))
    return handandflowerImg;
  if (value.includes("traveller") || value.includes("traveler"))
    return travellerImg;

  // fallback
  return broadcasterImg;
}

function normalizeRawEvents(raw: RawEventsShape): RawEvent[] {
  const maybe = raw as { events?: RawEvent[] };
  if (maybe && Array.isArray(maybe.events)) return maybe.events;
  return raw as RawEvent[];
}

const events: Event[] = normalizeRawEvents(rawEventsFile as RawEventsShape).map(
  (e, index) => ({
    id: e.id ?? index + 1,
    title: e.title,
    location: e.location,
    venue: e.venue,
    date: e.date,
    image: getImageForKey(e.imageKey, e.venue, e.title),
  }),
);

// === Formatting functions (match homepage style) ===
function ordinal(n: number) {
  const j = n % 10,
    k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

function formatEventDate(input?: string) {
  if (!input) return undefined;
  const d = new Date(input);
  if (isNaN(d.getTime())) return input;

  const day = ordinal(d.getDate());
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// === Section types from eventsPage.json ===
interface EventsIntroSection {
  id: string;
  type: "eventsIntro";
  hidden?: boolean;
  title: string;
  accentWord?: string;
  body: string;
}

interface EventsListSection {
  id: string;
  type: "eventsList";
  hidden?: boolean;
}

interface JoinUsSection {
  id: string;
  type: "joinUs";
  hidden?: boolean;
  title: string;
  accentWord?: string;
  body: string;
  cta?: { label?: string; url?: string };
}

type EventsSection = EventsIntroSection | EventsListSection | JoinUsSection;

interface EventsPageRendererProps {
  sections: EventsSection[];
  onRegister?: () => void;
}

// === Blocks ===
const EventsIntroBlock = ({ title, accentWord, body }: EventsIntroSection) => (
  <section className="py-16 md:py-24">
    <div className="container mx-auto max-w-3xl text-center">
      <SectionHeader title={title} accentWord={accentWord} />
      <p className="mt-4 text-muted-foreground font-body text-base leading-relaxed">
        {body}
      </p>
    </div>
  </section>
);

// === FULL EVENT CARD GRID (matching HOMEPAGE STYLE) ===
const EventsListBlock = () => {
  if (!events.length)
    return (
      <section className="py-16 md:py-24 text-center">
        <p className="text-muted-foreground">No upcoming events found.</p>
      </section>
    );

  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <SectionHeader title="All " accentWord="Events" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-6">
          {events.map((event, index) => {
            const formattedDate = formatEventDate(event.date);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card/60 backdrop-blur-sm border border-border/60 rounded-2xl overflow-hidden group hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 flex flex-col"
              >
                {/* IMAGE */}
                <div className="relative w-full">
                  <div style={{ paddingTop: "66.6667%" }} />
                  <div className="absolute inset-0 flex items-center justify-center p-4 md:p-5 bg-gradient-to-br from-muted/30 to-muted/10">
                    <div className="relative h-full w-full rounded-xl overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    </div>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-8 space-y-4 flex flex-col flex-1 text-center items-center">
                  {formattedDate && (
                    <div className="flex items-center gap-2 text-white/70">
                      <CalendarDays className="h-4 w-4 text-primary/80" />
                      <span className="text-sm font-medium">
                        {formattedDate}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-medium tracking-wider uppercase text-primary/80">
                      {event.venue}
                    </p>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      {event.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary/70 flex-shrink-0" />
                    <span className="text-sm">{event.location}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const JoinUsBlock = ({
  title,
  accentWord,
  body,
  cta,
  onRegister,
}: JoinUsSection & { onRegister?: () => void }) => {
  const handleClick = () => {
    if (onRegister) onRegister();
    else if (cta?.url) window.location.href = cta.url;
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-3xl text-center">
        <SectionHeader title={title} accentWord={accentWord} />
        <p className="mt-4 text-muted-foreground font-body text-base">{body}</p>

        {cta?.label && (
          <Button
            size="lg"
            className="mt-8 rounded-full px-8"
            onClick={handleClick}
          >
            {cta.label}
          </Button>
        )}
      </div>
    </section>
  );
};

// === MAIN ===
const EventsPageRenderer = ({
  sections,
  onRegister,
}: EventsPageRendererProps) => {
  const visible = sections.filter((s) => !s.hidden);

  return (
    <>
      {visible.map((section) => {
        switch (section.type) {
          case "eventsIntro":
            return (
              <PageSection key={section.id}>
                <EventsIntroBlock {...section} />
              </PageSection>
            );

          case "eventsList":
            return (
              <PageSection key={section.id}>
                <EventsListBlock />
              </PageSection>
            );

          case "joinUs":
            return (
              <PageSection key={section.id}>
                <JoinUsBlock {...section} onRegister={onRegister} />
              </PageSection>
            );

          default:
            return null;
        }
      })}
    </>
  );
};

export default EventsPageRenderer;
