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

const AboutIntroSection: React.FC<AboutIntroSectionProps> = ({ section }) => {
  const bodyText =
    section?.body ??
    "We bring people together at key moments across the media calendar. Our events range from panel discussions and screenings to informal gatherings, often aligned with major conferences. Supported by selected sponsors, each event is independently curated and complimentary to attend.";

  const paragraphs = bodyText
    .split(". ")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

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
          md:grid-cols-[minmax(0,1.5fr)_1px_minmax(0,3.5fr)]
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
              font-serif
              text-[2.2rem] sm:text-[2.4rem] md:text-[2.6rem]
              leading-[1.16]
              tracking-tight
              text-[#0F172A]
            "
          >
            About <span className="text-[#27CDBA]">Us</span>
          </h2>
        </motion.div>

        {/* MIDDLE — Divider */}
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

        {/* RIGHT — Text Block */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="pr-10"
        >
          <div className="space-y-10">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="
                  text-[1.3rem]
                  leading-[2.1]
                  font-normal
                  tracking-[0.005em]
                  text-[#1E293B]
                "
                style={{ wordSpacing: "0.02em" }}
              >
                {p.endsWith(".") ? p : p + "."}
              </p>
            ))}
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
};

export default AboutIntroSection;