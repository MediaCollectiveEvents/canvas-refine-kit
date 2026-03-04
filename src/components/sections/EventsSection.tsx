// src/components/sections/EventsSection.tsx

import React from "react";
import { MapPin, ArrowRight, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import SectionWrapper from "../layout/SectionWrapper";

import broadcasterImg from "@/assets/events/broadcaster.png";
import handandflowerImg from "@/assets/events/handandflower.png";
import travellerImg from "@/assets/events/traveller.png";

import rawEventsFile from "@/content/events.json";

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
}

type RawEventsShape = RawEvent[] | { events: RawEvent[] };

// Resolve image from key / venue / title
function getImageForKey(key?: string, venue?: string, title?: string) {
  const val = (key || venue || title || "").toLowerCase();
  if (val.includes("broadcaster")) return broadcasterImg;
  if (val.includes("hand") && val.includes("flower")) return handandflowerImg;
  if (val.includes("traveller") || val.includes("traveler")) return travellerImg;
  return broadcasterImg;
}

function normalizeRawEvents(raw: RawEventsShape): RawEvent[] {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray((raw as any).events)) return (raw as any).events;
  return [];
}

const events: Event[] = normalizeRawEvents(
  rawEventsFile as RawEventsShape
).map((e, i) => ({
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

function ordinal(n: number) {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

function formatEventDate(input?: string) {
  if (!input) return;
  const d = new Date(input);
  if (isNaN(d.getTime())) return input;
  const months = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December",
  ];
  return `${ordinal(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

interface EventsSectionProps {
  onRegisterClick: () => void;
  underHeader?: string;
}

const EventsSection: React.FC<EventsSectionProps> = ({
  onRegisterClick,
  underHeader,
}) => {
  if (!events.length) return null;

  const subline =
    underHeader ??
    "Invitation-only. Complimentary for invited guests.";

  return (
    <SectionWrapper
      variant="clean"
      align="left"
      padding="lux"
      noise={false}
      grid={false}
      withFades={false}
      className="events-section bg-[#FBFBFA]"
    >
      <div className="relative z-10 w-full">
        {/* HEADER */}
        <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-6 md:gap-16">
          <div className="space-y-3">
            <h2
              className="
                text-[2.4rem] sm:text-[2.7rem] md:text-[2.9rem]
                font-serif font-normal
                leading-[1.16]
                text-[#111]
              "
            >
              Next <span className="text-teal-500">Gatherings</span>
            </h2>
            <p className="text-sm sm:text-[0.95rem] text-[#555] max-w-[480px]">
              {subline}
            </p>
          </div>
        </div>

        {/* CARDS GRID */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {events.map((event, index) => {
            const date = formatEventDate(event.date);
            const isFeatured = index === 1; // optional subtle emphasis for middle card

            // Build chip set (Invite-only, Complimentary, etc.)
            const allChips: { label: string; primary: boolean }[] = [];
            if (event.inviteOnly ?? true) {
              allChips.push({ label: "Invite-only", primary: true });
            }
            if (event.complimentary ?? true) {
              allChips.push({ label: "Complimentary", primary: false });
            }
            if (event.format) {
              allChips.push({ label: event.format, primary: false });
            }
            if (event.conferenceAligned) {
              allChips.push({ label: "Conference week", primary: false });
            }
            const chips = allChips.slice(0, 2); // fewer, stronger

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
                  className={`
                    event-card
                    group
                    flex flex-col h-full overflow-hidden
                    max-w-[340px]
                    rounded-[16px]
                    border border-[rgba(0,0,0,0.08)]
                    bg-[#FFFFFF]
                    shadow-[0_10px_26px_rgba(0,0,0,0.08)]
                    transition-transform duration-200
                    ${isFeatured ? "md:-translate-y-[6px]" : ""}
                    hover:-translate-y-[4px]
                    hover:shadow-[0_18px_40px_rgba(0,0,0,0.14)]
                    hover:border-[rgba(0,255,225,0.35)]
                  `}
                >
                  {/* DATE STRIP */}
                  {date && (
                    <div className="bg-[#F5F6F6] border-b border-black/[0.06] px-4 py-[10px]">
                      <div className="flex items-center gap-2 text-[13px] text-[#555]">
                        <span className="h-2 w-2 rounded-full bg-teal-500/65" />
                        <CalendarDays className="h-4 w-4 text-zinc-400" />
                        <span>{date}</span>
                      </div>
                    </div>
                  )}

                  {/* ILLUSTRATION STAGE – dark 3:2 neon stage */}
                  <div
                    className="
                      event-card__media
                      aspect-[3/2]
                      bg-[radial-gradient(120%_120%_at_50%_30%,rgba(0,255,225,0.12),rgba(5,12,18,0.98))]
                      px-[18px] py-[18px]
                      border-b border-black/[0.06]
                      flex items-center justify-center
                    "
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      className="
                        w-full h-full
                        object-contain
                        transition-transform duration-200
                        drop-shadow-[0_10px_26px_rgba(0,0,0,0.35)]
                        group-hover:-translate-y-[3px]
                      "
                      loading="lazy"
                    />
                  </div>

                  {/* BODY */}
                  <CardContent className="flex flex-col flex-1 p-6">
                    {/* Title + venue/city */}
                    <div className="text-left mt-[18px] space-y-[6px]">
                      <h3
                        className="
                          event-title
                          text-[19px]
                          font-semibold
                          leading-[1.3]
                          text-[#111]
                        "
                      >
                        {event.title}
                      </h3>
                      <p className="event-meta text-sm text-zinc-600">
                        {event.venue}
                        {event.location ? ` • ${event.location}` : ""}
                      </p>
                    </div>

                    {/* CHIPS */}
                    {chips.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-[14px]">
                        {chips.map((chip, idx) => (
                          <div
                            key={`${event.id}-chip-${idx}`}
                            className={`
                              chip
                              inline-flex items-center
                              rounded-[16px]
                              px-[10px] py-[4px]
                              text-[12px]
                              bg-[#f6f7f8]
                              border border-[rgba(0,0,0,0.10)]
                              text-[#444]
                              ${chip.primary ? "chip-primary text-teal-700" : ""}
                            `}
                          >
                            {chip.primary && (
                              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-teal-500" />
                            )}
                            {chip.label}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTA + Details */}
                    <div className="mt-[12px] pt-4 flex flex-col gap-2">
                      <Button
                        onClick={onRegisterClick}
                        className="
                          cta
                          w-full rounded-full
                          text-sm font-medium
                          border border-[rgba(0,200,170,0.60)]
                          bg-[rgba(0,200,170,0.08)]
                          text-zinc-900
                          hover:bg-teal-500
                          hover:text-white
                        "
                        variant="outline"
                      >
                        Register interest
                      </Button>

                      <button
                        type="button"
                        className="
                          details-link
                          self-start
                          text-[13px]
                          text-[#777]
                          inline-flex items-center gap-1
                          hover:text-teal-500
                        "
                      >
                        <span>Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* VIEW ALL EVENTS – aligned to card grid */}
        <div className="mt-10 flex justify-end">
          <a
            href="/events"
            className="
              inline-flex items-center gap-1
              text-[14px] text-[#555]
              hover:text-teal-500
            "
          >
            <span>View all events</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default EventsSection;