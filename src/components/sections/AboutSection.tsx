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

  // Split into sentences and trim them
  const sentences = bodyText
    .split(".")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return (
    <SectionWrapper
      variant="light"
      align="left"
      padding="lux"
      noise={true}
      grid={false}
      withFades={false}
      className="bg-[#ECEFF1]"
    >
      <div
        className="
          relative
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
              signature-underline
              inline-block
              font-sans
              font-light
              text-[2rem] sm:text-[2.2rem] md:text-[2.35rem]
              leading-[1.16]
              tracking-tight
              text-[#0F172A]
            "
          >
            About <span className="text-[#27CDBA]">Us</span>
          </h2>
        </motion.div>

        {/* MIDDLE — vertical divider */}
        <div
          aria-hidden="true"
          className="
            hidden md:block
            h-full
            w-px
            bg-black/15
            mt-[0.75rem]
            mb-[0.75rem]
          "
        />

        {/* RIGHT — wider text column */}
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
                  text-[1.28rem]
                  leading-[2]
                  font-normal
                  tracking-[0.005em]
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