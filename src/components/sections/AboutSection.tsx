// src/components/sections/AboutIntroSection.tsx

import React from "react";
import SectionWrapper from "../layout/SectionWrapper";
import { motion } from "framer-motion";

interface AboutIntroSectionProps {
  section: {
    title?: string;
    body?: string;
  };
}

export default function AboutIntroSection({ section }: AboutIntroSectionProps) {
  const bodyText =
    section?.body ??
    "We bring people together who are passionate about the future of the media industry. Our events take place at key moments across the media calendar. We create opportunities for people to connect, exchange ideas and build relationships. They range from panel discussions and screenings to informal gatherings, often aligned with major conferences. Supported by selected sponsors, each event is independently curated and complimentary to attend.";

  const sentences = bodyText
    .split(".")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return (
    <SectionWrapper
      variant="light"
      padding="lux"
      noise={true}
      grid={false}
      withFades={false}
      align="left"
      className="relative"
    >
      {/* Smooth depth transition from hero → section */}
      <div className="absolute -top-10 left-0 right-0 h-10 pointer-events-none z-[1]">
        <div className="absolute inset-0 shadow-[0_-22px_38px_rgba(0,0,0,0.45)]" />
      </div>

      <div
        className="
          relative z-[2]
          grid
          md:grid-cols-[minmax(0,1.4fr)_1px_minmax(0,4fr)]
          gap-12 md:gap-20
          items-start
        "
      >
        {/* LEFT — Heading + brand accents */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="pt-1"
        >
          <h2
            className="
              font-sans font-light
              text-[2rem] sm:text-[2.3rem] md:text-[2.6rem]
              leading-[1.16]
              tracking-tight
              text-[#0F172A]
            "
          >
            About{" "}
            <span className="text-[#27CDBA] font-medium">
              Us
            </span>
          </h2>

          {/* Accent underline */}
          <div className="mt-4 h-[2px] w-20 bg-[#27CDBA]/70 rounded-full" />

          {/* Soft sub-intro line (fills empty left space) */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="
              text-[1.05rem]
              text-slate-600
              mt-6
              leading-[1.65]
              max-w-[440px]
            "
          >
            Independent gatherings designed to connect people shaping the
            future of media.
          </motion.p>
        </motion.div>

        {/* MIDDLE — vertical divider */}
        <div
          aria-hidden="true"
          className="
            hidden md:block
            h-full w-px
            bg-slate-300/40
            mt-2
          "
        />

        {/* RIGHT — Paragraph column */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="pr-2 max-w-[900px]"
        >
          <div className="space-y-7">
            {sentences.map((sentence, i) => (
              <p
                key={i}
                className="
                  text-[1.18rem]
                  leading-[1.75]
                  font-light
                  tracking-[0.003em]
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