// src/components/sections/AboutIntroSection.tsx

import React from "react";
import SectionWrapper from "../layout/SectionWrapper";
import { motion } from "framer-motion";

interface AboutIntroSectionProps {
  section: {
    title?: string;
    body?: string;
    texture?: "none" | "noise" | "vignette";
    motif?: "none" | "corner-square";
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

  const enableNoise = texture === "noise";
  const enableVignette = texture === "vignette";

  return (
    <SectionWrapper
      variant="light"
      align="left"
      padding="lux"
      noise={enableNoise}
      grid={false}
      withFades={false}
      className="relative bg-[#f7f7f7]"
    >
      {/* Optional vignette texture behind content */}
      {enableVignette && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(15,23,42,0.06), transparent 55%)",
          }}
        />
      )}

      {/* Main content grid */}
      <div
        className="
          relative z-[1]
          grid
          md:grid-cols-[minmax(0,1.3fr)_1px_minmax(0,4fr)]
          gap-12 md:gap-20
          items-start
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
              font-sans
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

        {/* MIDDLE — subtle vertical divider */}
        <div
          aria-hidden="true"
          className="
            hidden md:block
            h-full
            w-px
            bg-slate-300/60
            mt-[0.75rem]
          "
        />

        {/* RIGHT — text column */}
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

          {/* Optional motif in bottom right */}
          {motif === "corner-square" && (
            <div
              aria-hidden="true"
              className="
                mt-10
                w-24 h-24
                opacity-[0.04]
                bg-gradient-to-br from-slate-400 to-transparent
                rotate-6
                rounded-2xl
                blur-[8px]
                ml-auto
              "
            />
          )}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}