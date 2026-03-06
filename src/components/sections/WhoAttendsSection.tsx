// src/components/sections/WhoAttendsSection.tsx

import React from "react";
import SectionWrapper from "../layout/SectionWrapper";
import { motion } from "framer-motion";

interface WhoAttendsSectionProps {
  onRegisterClick?: () => void;
  section?: any;
}

const intro =
  "Executives from more than 300 companies have attended our events, including leaders from the world's most influential technology companies, film studios and streaming platforms.";

const STATS = [
  {
    num: "3",
    smallLabel: "TOP",
    mainLabel: "Global Technology Giants",
    size: 52,
  },
  {
    num: "5",
    smallLabel: "MAJOR",
    mainLabel: "Hollywood Studios",
    size: 90,
  },
  {
    num: "8",
    smallLabel: "DOMINANT",
    mainLabel: "Streaming Platforms",
    size: 120,
  },
];

export default function WhoAttendsSection(props: WhoAttendsSectionProps) {
  return (
    <SectionWrapper
      variant="dark"
      align="left"
      padding="lux"
      noise={true}
      grid={false}
      withFades={false}
      className="bg-[#0F172A] text-white"
    >
      {/* HEADER GRID – heading | intro (divider is a border on intro column) */}
      <div
        className="
          relative
          grid
          md:grid-cols-[minmax(0,1.5fr)_minmax(0,3.5fr)]
          gap-12 md:gap-20
          items-start
        "
      >
        {/* LEFT — HEADING (weight you liked) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="pt-[0.75rem] max-w-fit"
        >
          <h2
            className="
              font-[Montserrat]
              text-[2.1rem] sm:text-[2.25rem] md:text-[2.4rem]
              leading-[1.16]
              tracking-tight
              font-light
              text-white
              whitespace-nowrap
            "
          >
            Who{" "}
            <span className="text-[#27CDBA] font-normal">
              Attends
            </span>
          </h2>
        </motion.div>

        {/* RIGHT — INTRO TEXT WITH DIVIDER */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="
            md:border-l md:border-white/30   /* vertical divider */
            md:pl-10                          /* space between divider & text */
            pr-10
          "
        >
          <p
            className="
              text-[1.3rem]
              leading-[2.1]
              font-normal
              tracking-[0.005em]
              text-white/80
              max-w-none
            "
            style={{ wordSpacing: "0.02em" }}
          >
            {intro}
          </p>
        </motion.div>
      </div>

      {/* SPACING BEFORE STATS */}
      <div className="mt-16 md:mt-20" />

      {/* STATS – with emphasised 5 and 8 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 place-items-center">
        {STATS.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.07 }}
            className="text-center max-w-[360px]"
          >
            {/* NUMBER + SMALL LABEL — normalised baseline */}
            <div className="flex flex-col items-center justify-end h-[130px]">
              <span
                className="font-bold text-white leading-none"
                style={{ fontSize: `${s.size}px` }}
              >
                {s.num}
              </span>

              <span
                className="
                  mt-3
                  text-[0.95rem]
                  tracking-[0.10em]
                  uppercase
                  text-[#27CDBA]
                "
              >
                {s.smallLabel}
              </span>
            </div>

            {/* MAIN LABEL */}
            <p
              className="
                mt-2
                text-[1.35rem]
                leading-[1.45]
                font-semibold
                text-white/90
              "
            >
              {s.mainLabel}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}