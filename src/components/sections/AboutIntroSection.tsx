// src/components/sections/AboutIntroSection.tsx

import React from "react";
import { motion } from "framer-motion";
import SectionWrapper from "../layout/SectionWrapper";
import SeedlingMotif from "../motifs/SeedlingMotif"; // optional SVG fallback

interface AboutIntroSectionProps {
  section: {
    title?: string;
    body?: string;
    texture?: "none" | "noise" | "vignette";
    motif?: "none" | "corner-square" | "seedling" | "seedling-image";
  };
}

export default function AboutIntroSection({ section }: AboutIntroSectionProps) {
  const {
    title = "About Us",
    body,
    texture = "none",
    motif = "none",
  } = section;

  const bodyText =
    body ??
    "We bring together people who are passionate about the future of the media industry. Our events take place at key moments across the media calendar. We create opportunities for people to connect, exchange ideas and build relationships. They range from panel discussions and screenings to informal gatherings, often aligned with major conferences. Supported by selected sponsors, each event is independently curated and complimentary to attend.";

  const sentences = bodyText
    .split(".")
    .map((s) => s.trim())
    .filter(Boolean);

  const enableVignette = texture === "vignette";

  return (
    <SectionWrapper
      variant="light"
      align="left"
      padding="lux"
      noise={texture === "noise"}
      grid={false}
      withFades={false}
      className="relative bg-[#f7f7f7]"
    >
      {/* Left editorial gutter */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-y-0 left-0
          w-[150px] md:w-[180px]
          bg-gradient-to-r from-white via-white/90 to-transparent
          z-0
        "
      />

      {/* Optional vignette */}
      {enableVignette && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(0,0,0,0.03), transparent 55%)",
          }}
        />
      )}

      {/* ----------------------------- */}
      {/* 🌱 REAL SEEDLING PNG MOTIF    */}
      {/* ----------------------------- */}
      {motif === "seedling-image" && (
        <img
          src="/uploads/seedling-motif.png"
          alt=""
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            z-0
            left-[20px] md:left-[28px]
            top-[140px] md:top-[180px]
            w-[160px] md:w-[220px] lg:w-[260px]
            opacity-[0.12]
            rotate-[4deg]
            select-none
          "
        />
      )}

      {/* (Optional SVG motif fallback) */}
      {motif === "seedling" && (
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-[20px] md:left-[28px]
            top-[140px] md:top-[180px]
            z-0
          "
        >
          <SeedlingMotif className="w-[220px] text-teal-400/10 rotate-[4deg]" />
        </div>
      )}

      {/* ----------------------------- */}
      {/* Main Content Grid             */}
      {/* ----------------------------- */}
      <div
        className="
          relative z-[1]
          grid
          md:grid-cols-[minmax(0,1.2fr)_1px_minmax(0,4fr)]
          gap-12 md:gap-20
        "
      >
        {/* LEFT — Heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="pt-[0.25rem]"
        >
          <h2
            className="
              inline-block
              font-light
              text-[2rem] sm:text-[2.2rem] md:text-[2.35rem]
              leading-[1.16]
              tracking-tight
              text-[#0F172A]
            "
          >
            {title.split(" ")[0]}{" "}
            <span className="text-[#27CDBA]">
              {title.split(" ").slice(1).join(" ") || "Us"}
            </span>
          </h2>

          <div className="mt-4 h-px w-16 bg-slate-300" />
        </motion.div>

        {/* Divider */}
        <div
          aria-hidden="true"
          className="
            hidden md:block
            h-full
            w-px
            bg-slate-300/50
            mt-[0.75rem]
          "
        />

        {/* RIGHT — Body */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="pr-10 max-w-[900px]"
        >
          <div className="space-y-8">
            {sentences.map((sentence, i) => (
              <p
                key={i}
                className="
                  text-[1.18rem]
                  leading-[1.75]
                  text-[#1E293B]
                "
              >
                {sentence}.
              </p>
            ))}
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}