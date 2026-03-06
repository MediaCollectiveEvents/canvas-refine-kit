// src/components/sections/EventsSection.tsx

import React from "react";
import { MapPin, ArrowRight, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import SectionWrapper from "../layout/SectionWrapper";

import broadcasterImg from "@/assets/events/broadcaster.png";
import handandflowerImg from "@/assets/events/handandflower.png";
import travellerImg from "@/assets/events/traveller.png";
import greenlineImg from "@/assets/events/greenline.png";

import rawEventsFile from "@/content/events.json";

/* ------------------ Types & Utilities ------------------ */

interface RawEvent {
  id?: number;
  title: string;
  location: string;
  venue: string;
  imageKey?: string;
  date?: string;
  format?: string;
  conferenceAligned?: boolean;
  inviteOnly?: boolean;
  complimentary?: boolean;
  summary?: string;
}

type RawEventsShape = RawEvent[] | { events: RawEvent[] };

interface Event {
  id: number;
  title: string;
  location: string;
  venue: string;
  image: string;
  date?: string;
  format?: string;
  conferenceAligned?: boolean;
  inviteOnly?: boolean;
  complimentary?: boolean;
  summary?: string;
}

/* Resolve image */
function getImageForKey(key?: string, venue?: string, title?: string) {
  const val = (key || venue || title || "").toLowerCase();

  if (val.includes("greenline")) return greenlineImg;
  if (val.includes("broadcaster")) return broadcasterImg;
  if (val.includes("hand") && val.includes("flower")) return handandflowerImg;
  if (val.includes("traveller") || val.includes("traveler")) return travellerImg;

  return broadcasterImg;
}

/* Normalize events JSON */
function normalizeRawEvents(raw: RawEventsShape): RawEvent[] {
  if (Array.isArray(raw)) return raw;
  if ("events" in raw && Array.isArray((raw as any).events)) {
    return (raw as any).events;
  }
  return [];
}

/** Format: 8 April 2026 */
function formatInternationalDate(input?: string) {
  if (!input) return "";
  const d = new Date(input);
  if (isNaN(d.getTime())) return input;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ------------------ Component ------------------ */

interface EventsSectionProps {
  onRegisterClick: () => void;
  underHeader?: string;
  section?: any;
}

const EventsSection: React.FC<EventsSectionProps> = ({ onRegisterClick }) => {
  const rawEvents = normalizeRawEvents(rawEventsFile as any);

  const events: Event[] = rawEvents.map((e, i) => ({
    id: e.id ?? i + 1,
    title: e.title,
    location: e.location,
    venue: e.venue,
    date: e.date,
    format: e.format,
    conferenceAligned: e.conferenceAligned,
    inviteOnly: e.inviteOnly,
    complimentary: e.complimentary,
    summary:
      e.summary ??
      "Placeholder summary describing this event in twelve simple words.",
    image: getImageForKey(e.imageKey, e.venue, e.title),
  }));

  if (!events.length) return null;

  return (
    <SectionWrapper
      variant="light"
      align="left"
      padding="lux"
      noise={false}
      grid={false}
      withFades={false}
      className="relative bg-[#E8E9EA]"
    >
      <div className="relative">
        {/* HEADER — match Who Attends typography */}
        <div className="max-w-3xl mb-14">
          <h2
            className="
              font-[Montserrat]
              font-light
              text-[2.6rem] sm:text-[2.8rem] md:text-[3rem]
              leading-[1.16]
              tracking-tight
              text-[#0F172A]
            "
          >
            Upcoming{" "}
            <span className="font-semibold text-[#21BFA8] drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]">
              Events
            </span>
          </h2>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 items-stretch">
          {events.map((event, index) => {
            const date = formatInternationalDate(event.date);

            const chips: string[] = [];
            if (event.inviteOnly ?? true) chips.push("Invite-only");
            if (event.complimentary ?? true) chips.push("Complimentary");
            if (event.format) chips.push(event.format);
            if (event.conferenceAligned) chips.push("Conference week");

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="flex justify-center"
              >
                <Card
                  className="
                    group relative flex flex-col h-full
                    max-w-[360px] w-full
                    rounded-[18px]
                    border border-white/12
                    bg-[#0F172A]
                    shadow-[0_14px_32px_rgba(0,0,0,0.4)]
                    overflow-hidden
                    transition-transform duration-200
                    hover:-translate-y-[6px]
                  "
                >
                  {/* Subtle card texture */}
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none absolute inset-0
                      bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_65%)]
                      opacity-20
                    "
                  />

                  <CardContent className="relative z-10 flex flex-col p-7 h-full text-center items-center">

                    {/* TITLE */}
                    <h3 className="font-[Montserrat] text-[21px] font-semibold text-white mb-3">
                      {event.title}
                    </h3>

                    {/* DATE */}
                    {date && (
                      <div className="mb-5 flex items-center justify-center gap-2 text-[1rem] font-medium text-white/85">
                        <CalendarDays size={18} />
                        <span>{date}</span>
                      </div>
                    )}

                    {/* IMAGE — ALL 280px SIZE */}
                    <img
                      src={event.image}
                      alt={event.title}
                      className="
                        w-[280px]
                        mb-6
                        object-contain
                        opacity-95
                      "
                    />

                    {/* VENUE + LOCATION */}
                    <p className="text-sm text-white/75 leading-[1.5] mb-1 flex items-center justify-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.venue}</span>
                    </p>
                    <p className="text-sm text-white/70 leading-[1.5] mb-4">
                      {event.location}
                    </p>

                    {/* SUMMARY */}
                    <p className="text-white/80 text-[0.95rem] leading-[1.65] mb-5">
                      {event.summary}
                    </p>

                    {/* TAGS */}
                    {chips.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mb-5">
                        {chips.slice(0, 2).map((chip, i) => (
                          <div
                            key={`${event.id}-chip-${i}`}
                            className="
                              px-3 py-1 rounded-full text-[11px]
                              bg-white/8 border border-white/24 text-white/85
                            "
                          >
                            {chip}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <div className="mt-auto flex flex-col items-center gap-2">
                      <button
                        onClick={onRegisterClick}
                        className="
                          inline-flex items-center gap-2
                          font-[Montserrat] text-[0.95rem]
                          text-white hover:text-[#27CDBA]
                          transition
                        "
                      >
                        Register interest
                        <ArrowRight size={16} />
                      </button>

                      <button className="text-white/60 text-[13px] hover:text-white transition">
                        Details
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default EventsSection;