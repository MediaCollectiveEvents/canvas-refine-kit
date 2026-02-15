// src/components/sections/EventsSection.tsx

import React from "react";
import { MapPin, ArrowRight, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";

import broadcasterImg from "@/assets/events/broadcaster.png";
import handandflowerImg from "@/assets/events/handandflower.png";
import travellerImg from "@/assets/events/traveller.png";

// 🚨 Ensure tsconfig has: "resolveJsonModule": true
import rawEventsFile from "@/content/events.json";

interface Event {
  id: number;
  title: string;
  location: string;
  venue: string;
  image: string;
  date?: string; // recommended ISO: "YYYY-MM-DD"
}

interface RawEvent {
  id?: number;
  title: string;
  location: string;
  venue: string;
  imageKey?: string;
  date?: string; // recommended ISO
}

type RawEventsShape = RawEvent[] | { events: RawEvent[] };

// Map imageKey -> local asset import
function getImageForKey(key: string | undefined, venue: string, title: string) {
  const value = (key || venue || title).toLowerCase();

  if (value.includes("broadcaster")) return broadcasterImg;
  if (value.includes("hand") && value.includes("flower"))
    return handandflowerImg;
  if (value.includes("traveller") || value.includes("traveler"))
    return travellerImg;

  // Fallback
  return broadcasterImg;
}

// Read either a flat array or { events: [...] }
function normalizeRawEvents(raw: RawEventsShape): RawEvent[] {
  const maybeWrapped = raw as { events?: RawEvent[] };
  if (maybeWrapped && Array.isArray(maybeWrapped.events)) {
    return maybeWrapped.events!;
  }
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

/** Aspect helpers */
function padTopPercent(aspect: "3:2" | "16:9" | "1:1"): string {
  switch (aspect) {
    case "3:2":
      return "66.6667%";
    case "16:9":
      return "56.25%";
    case "1:1":
      return "100%";
    default:
      return "66.6667%";
  }
}

/** Ordinal suffix: 1 -> 1st, 2 -> 2nd, 3 -> 3rd, others -> nth */
function ordinal(n: number) {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

/** Format to "13th May 2026"; accepts ISO or Date-parsable strings */
function formatEventDate(input?: string) {
  if (!input) return undefined;
  const d = new Date(input);
  if (isNaN(d.getTime())) return input; // fallback to raw if unparsable

  const day = d.getDate();
  const year = d.getFullYear();
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
  const month = months[d.getMonth()];
  return `${ordinal(day)} ${month} ${year}`;
}

interface EventsSectionProps {
  onRegisterClick: () => void;

  /** Optional text block that appears directly under the section header */
  underHeader?: string;

  /** Uniform image controls (defaults maintain a clean layout) */
  imageAspect?: "3:2" | "16:9" | "1:1";
  imagePadding?: boolean; // inner padding inside aspect box
  imageFit?: "cover" | "contain"; // default 'contain' to avoid cropping
}

const EventsSection: React.FC<EventsSectionProps> = ({
  onRegisterClick,
  underHeader,
  imageAspect = "3:2",
  imagePadding = true,
  imageFit = "contain",
}) => {
  if (!events.length) return null;

  const padTop = padTopPercent(imageAspect);
  const imgFitClass = imageFit === "cover" ? "object-cover" : "object-contain";

  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <SectionHeader title="Upcoming " accentWord="Events" />

        {/* Optional supporting copy */}
        {underHeader && (
          <motion.div
            className="max-w-3xl mx-auto text-center mt-3"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <p className="text-white/80 font-body text-base md:text-lg leading-relaxed">
              {underHeader}
            </p>
          </motion.div>
        )}

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
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden group hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 h-full flex flex-col">
                  {/* Aspect-ratio image area */}
                  <div className="relative w-full flex-shrink-0">
                    {/* Ratio spacer */}
                    <div style={{ paddingTop: padTop }} />
                    <div
                      className={[
                        "absolute inset-0 flex items-center justify-center",
                        imagePadding ? "p-4 md:p-5" : "",
                        "bg-gradient-to-br from-muted/30 to-muted/10",
                      ].join(" ")}
                    >
                      <div className="relative h-full w-full rounded-xl overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className={`h-full w-full ${imgFitClass} transition-transform duration-700 ease-out`}
                          loading="lazy"
                        />
                      </div>
                      {/* Gentle overlay on hover */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>

                  <CardContent className="p-8 space-y-4 flex flex-col flex-1 text-center items-center">
                    {/* Date row */}
                    {formattedDate && (
                      <div className="flex items-center gap-2 text-white/70">
                        <CalendarDays className="h-4 w-4 text-primary/80" />
                        <span className="font-medium text-white/85 text-sm">
                          {formattedDate}
                        </span>
                      </div>
                    )}

                    {/* Venue + Title */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium tracking-wider uppercase text-primary/80">
                        {event.venue}
                      </p>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                        {event.title}
                      </h3>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary/70 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">
                        {event.location}
                      </span>
                    </div>

                    {/* CTA */}
                    <Button
                      onClick={onRegisterClick}
                      className="w-full mt-auto rounded-full font-body uppercase tracking-wider text-sm bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/30 hover:border-primary transition-all duration-300"
                    >
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
