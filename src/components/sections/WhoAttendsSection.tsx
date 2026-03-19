// src/components/sections/WhoAttendsSection.tsx

import React from "react";
import SectionWrapper from "../layout/SectionWrapper";
import SectionTitle from "../layout/SectionTitle";
import { motion } from "framer-motion";

interface WhoAttendsSectionProps {
  section?: any;
}

/* 
   Intro text with subtle white glows behind:
   - "300 companies"
   - "world's most influential"
*/
const intro = (
  <>
    Executives from more than{" "}
    <span className="relative inline-block">
      {/* White glow behind “300 companies” */}
      <span
        className="
          absolute inset-0 
          bg-white/10 
          blur-[10px] 
          rounded-md 
          pointer-events-none
        "
      />
      <span className="relative text-white font-semibold">300 companies</span>
    </span>{" "}
    have attended our events, including leaders from the{" "}
    <span className="relative inline-block">
      {/* White glow behind “world’s most influential” */}
      <span
        className="
          absolute inset-0
          bg-white/10
          blur-[10px]
          rounded-md
          pointer-events-none
        "
      />
      <span className="relative text-white font-semibold">
        world&apos;s most influential
      </span>
    </span>{" "}
    technology companies, film studios and streaming platforms.
  </>
);

/*
  EXACT number sizes (derived from screenshot)
*/
const STATS = [
  { num: "3", sizeRem: 3.15, smallLabel: "TOP", mainLabel: "Global Technology Giants" },
  { num: "5", sizeRem: 4.55, smallLabel: "MAJOR", mainLabel: "Hollywood Studios" },
  { num: "8", sizeRem: 5.85, smallLabel: "DOMINANT", mainLabel: "Streaming Platforms" },
];

export default function WhoAttendsSection({}: WhoAttendsSectionProps) {
  return (
    <SectionWrapper
      variant="dark"
      align="left"
      padding="lux"
      noise={true}
      grid={false}
      withFades={false}
      className="relative bg-[#111827] text-white"
    >
      {/* Soft center-based vignette (fixes the hard line issue) */}
      <div
        aria-hidden="true"
        className="
          absolute inset-0 pointer-events-none
          bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_85%)]
        "
      />

      {/* HEADER GRID */}
      <div className="relative z-10 grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,4fr)] gap-12 md:gap-20 items-start">

        {/* LEFT TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="pt-[0.75rem]"
        >
          <SectionTitle align="left" disableEmphasis className="text-white">
            Who <span className="text-[#27CDBA]">Attends</span>
          </SectionTitle>

          {/* Divider */}
          <div
            aria-hidden="true"
            className="mt-4 h-px w-full"
            style={{
              background:
                "linear-gradient(to right, rgba(236,239,241,0.9), rgba(236,239,241,0))",
            }}
          />
        </motion.div>

        {/* INTRO TEXT WITH WHITE GLOWS */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="pr-10 max-w-[900px]"
        >
          <p className="text-[1.28rem] leading-[2] tracking-[0.005em] text-white/85">
            {intro}
          </p>
        </motion.div>
      </div>

      {/* SPACING */}
      <div className="relative z-10 mt-16 md:mt-20" />

      {/* STATS GRID */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 place-items-center">

        {STATS.map((s, i) => {
          const px = s.sizeRem * 16;          // convert rem to px
          const glowSize = px * 1.18;         // tight halo around number

          return (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="text-center max-w-[360px]"
            >
              <div className="relative flex flex-col items-center justify-end h-[130px]">

                {/* TIGHT TEAL HALO */}
                <span
                  className="absolute rounded-full pointer-events-none -z-10"
                  style={{
                    width: `${glowSize}px`,
                    height: `${glowSize}px`,
                    background: "rgba(39,205,186,0.18)",
                    filter: "blur(18px)",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />

                {/* NUMBER */}
                <span
                  className="relative z-10 font-bold text-white leading-none"
                  style={{ fontSize: `${s.sizeRem}rem` }}
                >
                  {s.num}
                </span>

                {/* SUBLABEL */}
                <span className="mt-3 text-[0.95rem] tracking-[0.10em] uppercase text-[#27CDBA]">
                  {s.smallLabel}
                </span>

              </div>

              {/* MAIN LABEL */}
              <p className="mt-2 text-[1.35rem] leading-[1.45] font-semibold text-white/90">
                {s.mainLabel}
              </p>

            </motion.div>
          );
        })}

      </div>
    </SectionWrapper>
  );
}