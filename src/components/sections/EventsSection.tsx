// src/components/sections/EventsSection.tsx

import React from "react";
import { MapPin, ArrowRight, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import SectionWrapper from "../layout/SectionWrapper";

// ICONS
import broadcasterImg from "@/assets/events/broadcaster.png";
import handandflowerImg from "@/assets/events/handandflower.png";
import travellerImg from "@/assets/events/traveller.png";
import greenlineImg from "@/assets/events/greenline.png";

// CONTENT
import rawEventsFile from "@/content/events.json";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

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
  type?: string;
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
}

/* ------------------------------------------------------------------ */
/* Image resolver (includes greenline.png)                            */
/* ------------------------------------------------------------------ */

function getImageForKey(key?: string, venue?: string, title?: string) {
  const val = (key || venue || title || "").toLowerCase();

  if (val.includes("greenline")) return greenlineImg;
  if (val.includes("broadcaster")) return broadcasterImg;
  if (val.includes("hand") && val.includes("flower")) return handandflowerImg;
  if (val.includes("traveller") || val.includes("traveler")) return travellerImg;

  return broadcasterImg;
}

function normalizeRawEvents(raw: RawEventsShape): RawEvent[] {
  if (Array.isArray(raw)) return raw;
  if ("events" in raw && Array.isArray((raw as any).events)) {
    return (raw as any).events;
  }
  return [];
}

/* ------------------------------------------------------------------ */
/* Date formatting (editorial uppercase)                              */
/* ------------------------------------------------------------------ */

function ordinal(n: number) {
  const j = n % 10;
  const k = n % 100;

  if (j === 1 && k !== 11) return `${n}ST`;
  if (j === 2 && k !== 12) return `${n}ND`;
  if (j === 3 && k !== 13) return `${n}RD`;
  return `${n}TH`;
}

function formatEventDate(input?: string) {
  if (!input) return "";
  const d = new Date(input);
  if (isNaN(d.getTime())) return input.toUpperCase();

  const months = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];

  return `${ordinal(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

interface EventsSectionProps {
  onRegisterClick: () => void;
  underHeader?: string;
}

const EventsSection: React.FC<EventsSectionProps> = ({
  onRegisterClick,
  underHeader,
}) => {
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
    image: getImageForKey(e.imageKey, e.venue, e.title),
  }));

  if (!events.length) return null;

  const subline =
    underHeader ?? "Invitation-only. Complimentary for invited guests.";

  return (
    <SectionWrapper
      variant="clean"
      align="left"
      padding="lux"
      noise={false}
      grid={false}
      withFades={false}
      className="bg-[#F6F7F7]"
    >
      <div className="relative z-10 w-full">
        {/* ------------------------------------------------------------------ */}
        {/* Header: title + view all                                           */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:justify-between">
          <h2
            className="
              font-serif
              text-[2.75rem] sm:text-[2.9rem] md:text-[3rem]
              font-semibold
              leading-[1.15]
              text-[#0F172A]
            "
          >
            Next{" "}
            <span className="text-[#27CDBA]">
              Gatherings
            </span>
          </h2>

          <a
            href="/events"
            className="
              text-[0.95rem]
              text-[#6B7280]
              inline-flex items-center gap-2
              hover:text-[#0F172A]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[rgba(58,231,213,0.6)]
              focus-visible:ring-offset-2
              transition-colors
            "
          >
            <span>View all events</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-[4px]" />
          </a>
        </div>

        {/* Subline */}
        <p className="mt-3 text-sm sm:text-[0.95rem] text-[#6B7280] max-w-[480px] leading-[1.55]">
          {subline}
        </p>

        {/* ------------------------------------------------------------------ */}
        {/* Grid of cards                                                      */}
        {/* ------------------------------------------------------------------ */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {events.map((event, index) => {
            const date = formatEventDate(event.date);

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
                className="flex justify-center h-full"
              >
                <Card
                  className="
                    group
                    flex flex-col h-full
                    w-full max-w-[360px]
                    rounded-[18px]
                    border border-[rgba(15,23,42,0.08)]
                    bg-[#050B12]
                    shadow-[0_14px_32px_rgba(0,0,0,0.35)]
                    transition-all duration-200
                    hover:-translate-y-[6px]
                    hover:shadow-[0_20px_48px_rgba(0,0,0,0.45)]
                    hover:border-[rgba(148,163,184,0.45)]
                  "
                >
                  <CardContent className="flex flex-col flex-1 p-6">
                    {/* DATE */}
                    {date && (
                      <div className="mb-4 flex items-center gap-2 text-[12px] tracking-[0.12em] uppercase text-[#9CA3AF]">
                        <CalendarDays className="h-4 w-4 text-[#9CA3AF]" />
                        <span>{date}</span>
                      </div>
                    )}

                    {/* ILLUSTRATION – dark card, neon glow */}
                    <div className="flex justify-center mb-5">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="
                          w-[190px]
                          h-auto
                          object-contain
                          filter drop-shadow-[0_10px_24px_rgba(58,231,213,0.6)]
                          transition-[filter,transform] duration-200
                          group-hover:drop-shadow-[0_14px_30px_rgba(58,231,213,0.8)]
                          group-hover:-translate-y-[2px]
                        "
                        loading="lazy"
                      />
                    </div>

                    {/* TITLE + VENUE/LOCATION */}
                    <div className="text-left space-y-[6px] mb-4">
                      <h3
                        className="
                          text-[21px]
                          font-semibold
                          leading-[1.25]
                          tracking-[-0.01em]
                          text-[#F9FAFB]
                        "
                      >
                        {event.title}
                      </h3>

                      <p className="text-sm text-[#9CA3AF] leading-[1.5] flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-[#9CA3AF]" />
                        {event.venue}
                        {event.location ? ` — ${event.location}` : ""}
                      </p>
                    </div>

                    {/* CHIPS (neutral paper labels) */}
                    {chips.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {chips.slice(0, 2).map((chip, idx) => (
                          <div
                            key={`${event.id}-chip-${idx}`}
                            className="
                              inline-flex items-center
                              rounded-[6px]
                              bg-[rgba(15,23,42,0.18)]
                              border border-[rgba(148,163,184,0.35)]
                              text-[#E5E7EB]
                              text-[12px]
                              px-[10px] py-[4px]
                              transition-colors duration-200
                              group-hover:border-[rgba(58,231,213,0.4)]
                            "
                          >
                            {chip}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTA + DETAILS anchored to bottom */}
                    <div className="mt-auto flex flex-col gap-3">
                      {/* Primary text-style CTA (dark → teal on hover) */}
                      <button
                        type="button"
                        onClick={onRegisterClick}
                        className="
                          inline-flex items-center gap-2
                          text-[0.95rem]
                          font-medium
                          text-[#E5E7EB]
                          hover:text-[#3AE7D5]
                          focus:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-[rgba(58,231,213,0.6)]
                          focus-visible:ring-offset-2
                          focus-visible:ring-offset-[#050B12]
                          transition-all duration-200
                        "
                      >
                        <span>Register interest</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-[4px]" />
                      </button>

                      {/* Secondary details link */}
                      <button
                        type="button"
                        className="
                          self-start
                          text-[13px]
                          text-[#9CA3AF]
                          inline-flex items-center gap-1
                          hover:text-[#F9FAFB]
                          focus:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-[rgba(58,231,213,0.6)]
                          focus-visible:ring-offset-2
                          focus-visible:ring-offset-[#050B12]
                          transition-all duration-200
                        "
                      >
                        <span>Details</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-[3px]" />
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
``