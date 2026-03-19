// src/components/sections/AboutIntroSection.tsx

import React from "react";
import { motion } from "framer-motion";
import SectionWrapper from "../layout/SectionWrapper";
import SeedlingMotif from "../motifs/SeedlingMotif";

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
    "We bring together people who are passionate about the future of the media industry. Our events take place at key moments across the media calendar. We create opportunities for people to connect, exchange ideas and build relationships. Supported by selected sponsors, each event is independently curated and complimentary to attend.";

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
      {/* Soft left gutter gradient – editorial look */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-y-0 left-0
          w-[140px] md:w-[160px]
          bg-gradient-to-r from-white/100 via-white/90 to-transparent
          z-0
        "
      />

      {/* Very subtle personal vignette texture */}
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

      {/* ----------------------------------------------- */}
      {/* EDITORIAL SEEDLING PNG MOTIF */}
      {/* ----------------------------------------------- */}
      {motif === "seedling-image" && (
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-[8px]
            top-[140px]
            md:left-[16px]
            md:top-[160px]
            z-0
            opacity-[0.10]
            rotate-[6deg]
            mix-blend-multiply
          "
        >
          /uploads/seedling-motif.png
        </div>
      )}

      {/* (Optional) SVG version */}
      {motif === "seedling" && (
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-[8px] md:left-[16px]
            top-[140px] md:top-[160px]
            z-0
            opacity-[0.10]
            rotate-[6deg]
          "
        >
          <SeedlingMotif className="w-48 md:w-64 text-teal-400/10" />
        </div>
      )}

      {/* ----------------------------------------------- */}
      {/* MAIN CONTENT GRID */}
      {/* ----------------------------------------------- */}
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
          className="pt-[0.25rem] relative"
        >
          <h2
            className="
              inline-block
              font-sans
              font-light
              text-[2rem] sm:text-[2.2rem] md:text-[2.35rem]
              tracking-tight
              leading-[1.16]
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

        {/* Center Divider */}
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
                  font-normal
                  tracking-[0.005em]
                  text-[#1E293B]
                "
              >
                {sentence}.
              </p>
            ))}
          </div>

          {/* Optional corner motif support */}
          {motif === "corner-square" && (
            <div
              aria-hidden="true"
              className="
                mt-10
                w-24 h-24
                opacity-[0.04]
                bg-gradient-to-br from-slate-400 to-transparent
                rotate-6 rounded-2xl blur-[8px]
                ml-auto
              "
            />
          )}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}