import React, { useState } from "react";
import {
  MapPin,
  CalendarDays,
  Mail,
  MessageCircle,
  Share2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import SectionWrapper from "../layout/SectionWrapper";

import broadcasterImg from "@/assets/events/broadcaster.png";
import handandflowerImg from "@/assets/events/handandflower.png";
import travellerImg from "@/assets/events/traveller.png";
import greenlineImg from "@/assets/events/greenline.png";

import rawEventsFile from "@/content/events.json";

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

interface EventsSectionProps {
  section?: any;
  onRegisterClick?: () => void;
  underHeader?: boolean;
  imageAspect?: string;
  imageFit?: string;
  imagePadding?: boolean;
}

const EventsSection: React.FC<EventsSectionProps> = () => {
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
        <div className="max-w-[680px] mb-6 md:mb-8">
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

          <div
            aria-hidden="true"
            className="mt-4 h-px w-full max-w-[620px]"
            style={{
              background:
                "linear-gradient(to right, rgba(15,23,42,0.35), rgba(15,23,42,0))",
            }}
          />

          <p
            className="
              mt-4
              max-w-[560px]
              text-[#475569]
              font-body
              text-[0.98rem] md:text-[1rem]
              leading-[1.6]
            "
          >
            Bringing peers together across media and technology.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 md:gap-10 xl:grid-cols-3 xl:gap-12">
          {events.map((event, index) => {
            const date = formatInternationalDate(event.date);

            const chips: string[] = [];
            if (event.inviteOnly ?? true) chips.push("Invite-only");
            if (event.complimentary ?? true) chips.push("Complimentary");
            if (event.format) chips.push(event.format);
            if (event.conferenceAligned) chips.push("Conference week");

            const baseUrl = "/events";
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
                    group relative flex h-full w-full max-w-[340px] flex-col
                    overflow-hidden rounded-[18px]
                    border border-white/12
                    bg-[#0F172A]
                    shadow-[0_14px_32px_rgba(0,0,0,0.36)]
                    transition-transform duration-200
                    hover:-translate-y-[6px]
                    xl:max-w-[350px]
                  "
                >
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none absolute inset-0
                      bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_70%)]
                      opacity-20
                    "
                  />

                  <CardContent className="relative z-10 flex h-full flex-col items-center p-6 text-center md:p-7">
                    <h3
                      className="
                        mb-3
                        font-[Montserrat]
                        text-[1.3rem] font-semibold leading-tight text-white
                        sm:text-[1.4rem]
                      "
                    >
                      {event.title}
                    </h3>

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

                    <img
                      src={event.image}
                      alt={event.title}
                      className="mb-4 w-[240px] object-contain opacity-95 md:w-[250px]"
                    />

                    <div className="mb-5 min-h-[44px]">
                      <p
                        className="
                          flex items-center justify-center gap-2
                          text-[0.9rem] font-medium leading-[1.5] tracking-tight text-white/85
                        "
                      >
                        <MapPin className="h-4 w-4" />
                        <span>{event.venue}</span>
                      </p>
                      <p className="mt-1 text-[0.85rem] leading-[1.5] text-white/60">
                        {event.location}
                      </p>
                    </div>

                    <div className="mb-5 min-h-[88px] max-w-[26ch] text-[0.98rem] leading-[1.65]">
                      {firstSentence && (
                        <p className="mb-2 font-semibold text-white">
                          {firstSentence.endsWith(".")
                            ? firstSentence
                            : `${firstSentence}.`}
                        </p>
                      )}
                      {remainingSummary && (
                        <p className="text-white/80">{remainingSummary}</p>
                      )}
                    </div>

                    <div className="mb-5 flex min-h-[32px] flex-wrap justify-center gap-2">
                      {chips.slice(0, 2).map((chip, i) => (
                        <div
                          key={`${event.id}-chip-${i}`}
                          className="
                            rounded-full border border-white/20 bg-white/10
                            px-3 py-1
                            text-[0.7rem] uppercase tracking-wide text-white/90
                          "
                        >
                          {chip}
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto w-full pt-4">
                      <div className="mb-4 h-px w-full bg-white/10" />

                      <div className="flex items-center justify-center text-[13px]">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenShareId(isShareOpen ? null : event.id)
                          }
                          className="
                            group/share
                            inline-flex items-center gap-1.5
                            text-white/70
                            transition-colors
                            hover:text-white
                          "
                        >
                          <Share2
                            size={15}
                            className="
                              transition-transform duration-200
                              group-hover/share:-translate-y-[1px]
                              group-hover/share:rotate-6
                            "
                          />
                          <span>{isShareOpen ? "Close" : "Share"}</span>
                        </button>
                      </div>

                      {isShareOpen && (
                        <div
                          className="
                            mt-4 flex w-full flex-col gap-2
                            rounded-lg border border-white/10
                            bg-white/5 px-3 py-2 text-[12px] text-white/70
                            backdrop-blur-md
                          "
                        >
                          <span className="mb-1 text-xs text-white/80">
                            Share this event
                          </span>

                          <div className="flex items-center justify-center gap-3">
                            <a
                              href={mailHref}
                              className="
                                group/email
                                inline-flex items-center gap-1.5
                                rounded-full border border-white/20 bg-white/10
                                px-3 py-1.5
                                transition
                                hover:bg-white/15 hover:text-white
                              "
                              aria-label={`Share ${event.title} via email`}
                            >
                              <Mail
                                size={14}
                                className="
                                  transition-transform duration-200
                                  group-hover/email:-translate-y-[1px]
                                "
                              />
                              <span>Email</span>
                            </a>

                            <a
                              href={whatsappHref}
                              target="_blank"
                              rel="noreferrer"
                              className="
                                group/wa
                                inline-flex items-center gap-1.5
                                rounded-full border border-white/20 bg-white/10
                                px-3 py-1.5
                                transition
                                hover:bg-white/15 hover:text-white
                              "
                              aria-label={`Share ${event.title} via WhatsApp`}
                            >
                              <MessageCircle
                                size={14}
                                className="
                                  transition-transform duration-200
                                  group-hover/wa:-translate-y-[1px]
                                "
                              />
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