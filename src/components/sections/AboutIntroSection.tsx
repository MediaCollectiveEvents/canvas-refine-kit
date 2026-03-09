// src/components/sections/AboutIntroSection.tsx

import React from "react";
import { motion } from "framer-motion";
import SectionWrapper from "../layout/SectionWrapper";
import SectionTitle from "../layout/SectionTitle";

interface AboutIntroSectionProps {
  section: {
    body?: string;
  };
}

export default function AboutIntroSection({ section }: AboutIntroSectionProps) {
  const bodyText = section?.body ?? "";

  const sentences = bodyText
    .split(".")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <SectionWrapper
      variant="light"
      align="left"
      padding="lux"
      noise={true}
      grid={false}
      withFades={false}
      className="relative bg-[#ECEFF1]"
    >
      <div
        className="
          relative
          grid
          md:grid-cols-[minmax(0,1.3fr)_minmax(0,4fr)]
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
          {/* Use SectionTitle, but pass custom children so we keep the teal “Us” */}
          <SectionTitle
            align="left"
            tone="muted"          // tells SectionTitle this is on a light background
            disableEmphasis={true} // we control the accent ourselves
            className="!text-[#0F172A]" // ensure dark navy on this section
          >
            About <span className="text-[#27CDBA]">Us</span>
          </SectionTitle>

          {/* Horizontal divider under the title */}
          <div
            aria-hidden="true"
            className="mt-4 h-px w-full"
            style={{
              background:
                "linear-gradient(to right, rgba(15,23,42,0.35), rgba(15,23,42,0))",
            }}
          />
        </motion.div>

        {/* RIGHT — Wider text column (aligned to Who Attends) */}
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