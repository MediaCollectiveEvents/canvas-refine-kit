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
  const title = section?.title ?? "About Us";
  const body =
    section?.body ??
    "We bring people together at key moments across the media calendar. Our events range from panel discussions and screenings to informal gatherings, often aligned with major conferences. Supported by selected sponsors, each event is independently curated and complimentary to attend.";

  return (
    <SectionWrapper
      variant="light"
      align="left"
      padding="lux"
      noise={false}
      grid={false}
      withFades={false}
      className="bg-[#ECEFF1]"
    >
      <div
        className="
          relative
          grid
          grid-cols-1
          md:grid-cols-[2fr_3fr]   /* 40% title / 60% text */
          gap-12 md:gap-16
          items-start
        "
      >
        {/* Divider positioned exactly at the 40% split */}
        <div
          aria-hidden="true"
          className="
            hidden md:block
            absolute
            left-[40%]
            top-0
            h-full
            w-px
            bg-[#D1D5DB]
          "
        />

        {/* LEFT COLUMN — Heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="
              font-serif
              text-[2.6rem] sm:text-[2.8rem] md:text-[3rem]
              leading-[1.16]
              tracking-tight
              text-[#0F172A]
            "
          >
            About <span className="text-[#27CDBA]">Us</span>
          </h2>
        </motion.div>

        {/* RIGHT COLUMN — Text */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          <div
            className="
              text-[1.05rem]
              leading-[1.65]
              text-[#4B5563]
              max-w-none
            "
            dangerouslySetInnerHTML={{ __html: body }}
          />
        </motion.div>
      </div>
    </SectionWrapper>
  );
};

export default AboutIntroSection;