import React from "react";
import SectionWrapper from "../layout/SectionWrapper";
import SectionTitle from "../layout/SectionTitle";
import { motion } from "framer-motion";

interface WhoAttendsSectionProps {
  section?: any;
}

const intro = (
  <>
    Executives from more than{" "}
    <span className="relative inline-block">
      <span
        className="
          pointer-events-none absolute inset-0 rounded-md
          bg-white/8 blur-[8px]
        "
      />
      <span className="relative font-semibold text-white">300 companies</span>
    </span>{" "}
    have attended our events, including leaders from the{" "}
    <span className="relative inline-block">
      <span
        className="
          pointer-events-none absolute inset-0 rounded-md
          bg-white/8 blur-[8px]
        "
      />
      <span className="relative font-semibold text-white">
        world&apos;s most influential
      </span>
    </span>{" "}
    technology companies, film studios and streaming platforms.
  </>
);

const STATS = [
  {
    num: "3",
    sizeRem: 2.9,
    smallLabel: "TOP",
    mainLabel: "Global Technology Giants",
  },
  {
    num: "5",
    sizeRem: 3.8,
    smallLabel: "MAJOR",
    mainLabel: "Hollywood Studios",
  },
  {
    num: "8",
    sizeRem: 4.6,
    smallLabel: "LEADING",
    mainLabel: "Streaming Platforms",
  },
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
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_85%)]
        "
      />

      <div className="relative z-10 grid items-start gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,4fr)] md:gap-16">
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

          <div
            aria-hidden="true"
            className="mt-4 h-px w-full max-w-[320px]"
            style={{
              background:
                "linear-gradient(to right, rgba(236,239,241,0.8), rgba(236,239,241,0))",
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="max-w-[820px] pr-0 md:pr-6"
        >
          <p className="text-[1.16rem] md:text-[1.25rem] leading-[1.7] tracking-[-0.01em] text-white/85">
            {intro}
          </p>
        </motion.div>
      </div>

      <div className="relative z-10 mt-14 md:mt-16" />

      <div className="relative z-10 grid grid-cols-1 place-items-center gap-10 md:grid-cols-3 md:gap-8">
        {STATS.map((s, i) => {
          const px = s.sizeRem * 16;
          const glowSize = px * 1.08;

          return (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="max-w-[320px] text-center"
            >
              <div className="relative flex h-[112px] flex-col items-center justify-end">
                <span
                  className="pointer-events-none absolute -z-10 rounded-full"
                  style={{
                    width: `${glowSize}px`,
                    height: `${glowSize}px`,
                    background: "rgba(39,205,186,0.14)",
                    filter: "blur(16px)",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />

                <span
                  className="relative z-10 font-bold leading-none text-white"
                  style={{ fontSize: `${s.sizeRem}rem` }}
                >
                  {s.num}
                </span>

                <span className="mt-2 text-[0.82rem] uppercase tracking-[0.14em] text-[#27CDBA]">
                  {s.smallLabel}
                </span>
              </div>

              <p className="mt-2 text-[1.15rem] md:text-[1.2rem] font-semibold leading-[1.45] text-white/90">
                {s.mainLabel}
              </p>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}