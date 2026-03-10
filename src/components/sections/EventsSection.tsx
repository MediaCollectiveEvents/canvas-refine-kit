// src/components/sections/EventsSection.tsx

import React, { useState } from "react";
import { MapPin, ArrowRight, CalendarDays, Mail, MessageCircle } from "lucide-react";
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
  section?: any;
  onRegisterClick?: () => void;
  underHeader?: boolean;
  imageAspect?: string;
  imageFit?: string;
  imagePadding?: boolean;
}

const EventsSection: React.FC<EventsSectionProps> = ({
  section,
  onRegisterClick,
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
    summary:
      e.summary ??
      "Placeholder summary describing this event in twelve simple words.",
    image: getImageForKey(e.imageKey, e.venue, e.title),
  }));

  const [openShareId, setOpenShareId] = useState<number | null>(null);

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
        {/* HEADER */}
        <div className="max-w-3xl mb-10">
          <h2
            className="
              font-[Montserrat]
              font-light
              text-[2rem] sm:text-[2.2rem] md:text-[2.35rem]
              leading-[1.15]
              tracking-tight
              text-[#0F172A]
            "
          >
            Upcoming{" "}
            <span className="font-normal text-[#21BFA8] drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]">
              Events
            </span>
          </h2>

          {/* Underline divider to match other sections */}
          <div
            aria-hidden="true"
            className="mt-4 h-px w-full"
            style={{
              background:
                "linear-gradient(to right, rgba(15,23,42,0.35), rgba(15,23,42,0))",
            }}
          />

          {/* Lead-in line */}
          <p
            className="
              mt-4
              text-[#475569]
              font-body
              text-base md:text-[1.05rem]
            "
          >
            Don&apos;t miss.
          </p>
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

            const baseUrl = "/events"; // could be event-specific later
            const rawSummary = event.summary ?? "";
            const summaryParts = rawSummary.split(". ");
            const firstSentence = summaryParts.shift();
            const remainingSummary = summaryParts.join(". ");
            const shareText = encodeURIComponent(
              `${event.title}${date ? ` – ${date}` : ""} at ${
                event.venue
              }, ${event.location}. ${rawSummary} Find out more: ${baseUrl}`
            );
            const mailHref = `mailto:?subject=${encodeURIComponent(
              `Event: ${event.title}`
            )}&body=${shareText}`;
            const whatsappHref = `https://wa.me/?text=${shareText}`;
            const isShareOpen = openShareId === event.id;

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
                      bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_70%)]
                      opacity-20
                    "
                  />

                  <CardContent className="relative z-10 flex flex-col p-7 h-full text-center items-center">
                    {/* TITLE */}
                    <h3
                      className="
                        font-[Montserrat]
                        text-[1.35rem] sm:text-[1.45rem]
                        font-semibold
                        text-white
                        leading-tight
                        mb-3
                      "
                    >
                      {event.title}
                    </h3>

                    {/* DATE */}
                    {date && (
                      <div
                        className="
                          mb-4 flex items-center justify-center gap-1.5
                          text-[0.95rem] font-medium text-white/90
                        "
                      >
                        <CalendarDays size={18} />
                        <span>{date}</span>
                      </div>
                    )}

                    {/* IMAGE */}
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-[280px] mb-5 object-contain opacity-95"
                    />

                    {/* VENUE + LOCATION */}
                    <p
                      className="
                        text-[0.9rem] text-white/85 font-medium tracking-tight
                        leading-[1.5] mb-1
                        flex items-center justify-center gap-2
                      "
                    >
                      <MapPin className="h-4 w-4" />
                      <span>{event.venue}</span>
                    </p>
                    <p className="text-[0.85rem] text-white/60 leading-[1.5] mb-4">
                      {event.location}
                    </p>

                    {/* SUMMARY – first sentence stands out */}
                    <div className="text-[1rem] leading-[1.65] mb-6">
                      {firstSentence && (
                        <p className="font-semibold text-white mb-2">
                          {firstSentence.endsWith(".")
                            ? firstSentence
                            : `${firstSentence}.`}
                        </p>
                      )}
                      {remainingSummary && (
                        <p className="text-white/80">
                          {remainingSummary}
                        </p>
                      )}
                    </div>

                    {/* TAGS */}
                    {chips.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {chips.slice(0, 2).map((chip, i) => (
                          <div
                            key={`${event.id}-chip-${i}`}
                            className="
                              px-3 py-1 rounded-full
                              text-[0.7rem] uppercase tracking-wide
                              bg-white/10 border border-white/20 text-white/90
                            "
                          >
                            {chip}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTA CLUSTER */}
                    <div className="mt-auto flex flex-col items-center gap-2 pt-4 w-full">
                      {/* Divider above CTAs */}
                      <div className="w-full h-px bg-white/10 mb-2" />

                      {/* Primary CTA */}
                      <button
                        onClick={() => onRegisterClick?.()}
                        className="
                          inline-flex items-center gap-2
                          font-[Montserrat] text-[0.95rem] font-semibold
                          bg-[#21BFA8] text-[#0F172A]
                          px-5 py-2.5 rounded-full
                          shadow-[0_0_12px_rgba(33,191,168,0.35)]
                          transition-all duration-200
                          hover:bg-[#1EB79F]
                          hover:shadow-[0_0_16px_rgba(33,191,168,0.45)]
                          hover:scale-[1.03]
                        "
                      >
                        Register interest
                        <ArrowRight size={16} />
                      </button>

                      {/* Secondary CTA */}
                      <button
                        className="
                          text-white/70 text-[13px]
                          hover:text-white hover:underline underline-offset-2
                          transition
                        "
                      >
                        Details
                      </button>

                      {/* Share: opens inline popover */}
                      <button
                        type="button"
                        onClick={() =>
                          setOpenShareId(openShareId === event.id ? null : event.id)
                        }
                        className="
                          mt-1 text-white/60 text-[12px]
                          hover:text-white hover:underline underline-offset-2
                          transition
                        "
                      >
                        {openShareId === event.id
                          ? "Close share options"
                          : "Share"}
                      </button>

                      {openShareId === event.id && (
                        <div
                          className="
                            mt-2 w-full
                            rounded-lg border border-white/15
                            bg-white/5
                            px-3 py-2
                            flex flex-col gap-2
                            text-[12px] text-white/70
                          "
                        >
                          <span className="text-xs mb-1 text-white/75">
                            Share this event
                          </span>
                          <div className="flex items-center justify-center gap-3">
                            <a
                              href={mailHref}
                              className="
                                inline-flex items-center justify-center gap-1.5
                                px-3 py-1.5 rounded-full
                                bg-white/10 border border-white/20
                                hover:bg-white/15 hover:text-white
                                transition
                              "
                              aria-label={`Share ${event.title} via email`}
                            >
                              <Mail size={14} />
                              <span>Email</span>
                            </a>
                            <a
                              href={whatsappHref}
                              target="_blank"
                              rel="noreferrer"
                              className="
                                inline-flex items-center justify-center gap-1.5
                                px-3 py-1.5 rounded-full
                                bg-white/10 border border-white/20
                                hover:bg-white/15 hover:text-white
                                transition
                              "
                              aria-label={`Share ${event.title} via WhatsApp`}
                            >
                              <MessageCircle size={14} />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      )}
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