// src/components/sections/WhoAttendsSection.tsx

import React from "react";
import SectionWrapper from "../layout/SectionWrapper";
import SectionTitle from "../layout/SectionTitle";
import { motion } from "framer-motion";

interface WhoAttendsSectionProps {
  section?: any;
}

const intro =
  "Executives from more than 300 companies have attended our events, including leaders from the world's most influential technology companies, film studios and streaming platforms.";

const STATS = [
  { num: "3", smallLabel: "TOP", mainLabel: "Global Technology Giants", size: 52 },
  { num: "5", smallLabel: "MAJOR", mainLabel: "Hollywood Studios", size: 90 },
  { num: "8", smallLabel: "DOMINANT", mainLabel: "Streaming Platforms", size: 120 },
];

export default function WhoAttendsSection({ section }: WhoAttendsSectionProps) {
  return (
    <SectionWrapper
      variant="dark"
      align="left"
      padding="lux"
      noise={true}
      grid={false}
      withFades={false}
      // ⬇ base is now a slightly softer dark instead of #0F172A
      className="relative bg-[#111827] text-white"
    >
      {/* Subtle radial highlight to echo event cards */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0
          bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_70%)]
          opacity-25
        "
      />

      {/* CONTENT GRID */}
      <div
        className="
          relative z-10
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
          className="pt-[0.75rem]"
        >
          <SectionTitle
            align="left"
            tone="default"
            disableEmphasis={true}
            className="text-white"
          >
            Who <span className="text-[#27CDBA]">Attends</span>
          </SectionTitle>

          {/* Divider – light grey gradient, referencing events surface */}
          <div
            aria-hidden="true"
            className="mt-4 h-px w-full"
            style={{
              background:
                "linear-gradient(to right, rgba(236,239,241,0.9), rgba(236,239,241,0))",
            }}
          />
        </motion.div>

        {/* RIGHT — Intro text */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="pr-10 max-w-[900px]"
        >
          <p
            className="
              text-[1.28rem]
              leading-[2]
              tracking-[0.005em]
              text-white/85
            "
          >
            {intro}
          </p>
        </motion.div>
      </div>

      {/* SPACING BEFORE STATS */}
      <div className="relative z-10 mt-16 md:mt-20" />

      {/* STATS GRID */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 place-items-center">
        {STATS.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.07 }}
            className="text-center max-w-[360px]"
          >
            {/* NUMBER */}
            <div className="flex flex-col items-center justify-end h-[130px]">
              <span
                className="font-bold text-white leading-none"
                style={{ fontSize: `${s.size}px` }}
              >
                {s.num}
              </span>
              <span className="mt-3 text-[0.95rem] tracking-[0.10em] uppercase text-[#27CDBA]">
                {s.smallLabel}
              </span>
            </div>

            {/* LABEL */}
            <p className="mt-2 text-[1.35rem] leading-[1.45] font-semibold text-white/90">
              {s.mainLabel}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}