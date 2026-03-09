// src/components/sections/UpcomingEventsIntroSection.tsx

import React from "react";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/layout/SectionWrapper";
import SectionTitle from "@/components/layout/SectionTitle";
import type { AnySection } from "@/lib/sections";

type UpcomingEventsIntroSectionData = Extract<
  AnySection,
  { type: "upcomingEventsIntro" }
>;

function isUpcomingEventsIntro(
  section: AnySection
): section is UpcomingEventsIntroSectionData {
  return section.type === "upcomingEventsIntro";
}

interface UpcomingEventsIntroSectionProps {
  section?: AnySection;
  onRegister?: () => void;
}

const UpcomingEventsIntroSection: React.FC<
  UpcomingEventsIntroSectionProps
> = ({ section, onRegister }) => {
  const data = section && isUpcomingEventsIntro(section) ? section : undefined;

  const heading = data?.heading ?? "Upcoming Events";
  const description =
    data?.description ??
    "Discover upcoming events bringing together senior leaders from across media, entertainment, and technology.";
  const note =
    data?.note ??
    "Spaces are limited to keep events focused and conversational.";
  const underHeader = data?.underHeader ?? "";

  const primaryLabel = data?.cta?.label ?? "Learn More";
  const primaryUrl = data?.cta?.url ?? "/events";

  const secondaryLabel = data?.secondaryCta?.label ?? "";
  const secondaryUrl = data?.secondaryCta?.url ?? "/events";
  const showSecondary =
    Boolean(data?.secondaryCta?.label) ||
    Boolean(data?.secondaryCta?.url);

  const t = data?.styleTitle ?? {};
  const w = data?.styleWrapper ?? {};

  const handlePrimaryClick = (
    e: React.MouseEvent<HTMLAnchorElement>
  ) => {
    if (onRegister) {
      e.preventDefault();
      onRegister();
    }
  };

  const [first, ...rest] = heading.split(" ");
  const highlight = rest.join(" ");

  return (
    <SectionWrapper
      variant={w.variant ?? "light"}
      padding={w.padding ?? "lux"}
      noise={false}
      grid={false}
      withFades={false}
      align="center"
      className="bg-[#ECEFF1]"
    >
      <div className="max-w-3xl mx-auto text-center px-6">

        {/* TITLE */}
        <SectionTitle
          align={t.align ?? "center"}
          tone="dark"
          disableEmphasis
        >
          {first} <span className="text-[#27CDBA]">{highlight}</span>
        </SectionTitle>

        {/* UNDER HEADER */}
        {underHeader && (
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <p className="text-[#1E293B] font-body text-base md:text-lg leading-relaxed">
              {underHeader}
            </p>
          </motion.div>
        )}

        {/* DESCRIPTION */}
        <motion.div
          className="mt-2 space-y-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <p className="text-[#1E293B] font-body text-lg md:text-xl leading-relaxed">
            {description}
          </p>

          <p className="text-sm font-body text-[#475569]">
            {note}
          </p>
        </motion.div>

        {/* BUTTONS */}
        <motion.div
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: "easeOut" }}
        >
          <a
            href={primaryUrl}
            onClick={onRegister ? handlePrimaryClick : undefined}
          >
            <button
              className="
                inline-flex items-center rounded-full bg-primary px-6 py-2.5 
                text-sm font-medium text-black shadow-md shadow-primary/25
                hover:bg-primary/90 transition-colors
              "
            >
              {primaryLabel}
            </button>
          </a>

          {showSecondary && (
            <a href={secondaryUrl}>
              <button
                className="
                  inline-flex items-center rounded-full border border-[#0F172A33]
                  px-6 py-2.5 text-sm font-medium text-[#0F172A]
                  hover:bg-black/5 transition-colors
                "
              >
                {secondaryLabel || "View All Events"}
              </button>
            </a>
          )}
        </motion.div>
      </div>
    </SectionWrapper>
  );
};

export default UpcomingEventsIntroSection;