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
  section: AnySection,
): section is UpcomingEventsIntroSectionData {
  return section.type === "upcomingEventsIntro";
}

interface UpcomingEventsIntroSectionProps {
  section?: AnySection;
  onRegister?: () => void;
}

const UpcomingEventsIntroSection: React.FC<UpcomingEventsIntroSectionProps> = ({
  section,
  onRegister,
}) => {
  const data = section && isUpcomingEventsIntro(section) ? section : undefined;

  // Content fallbacks
  const heading = data?.heading ?? "Upcoming Events";
  const description =
    data?.description ??
    "Discover upcoming events bringing together senior leaders from across media, entertainment, and technology.";
  const note =
    data?.note ??
    "Spaces are limited to keep events focused and conversational.";

  // NEW: optional text block directly under header
  const underHeader = data?.underHeader ?? "";

  const primaryLabel = data?.cta?.label ?? "Learn More";
  const primaryUrl = data?.cta?.url ?? "/events";

  const secondaryLabel = data?.secondaryCta?.label ?? "";
  const secondaryUrl = data?.secondaryCta?.url ?? "/events";
  const showSecondary = Boolean(
    data?.secondaryCta?.label || data?.secondaryCta?.url,
  );

  // Admin-driven styling
  const t = data?.styleTitle ?? {};
  const w = data?.styleWrapper ?? {};

  const handlePrimaryClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onRegister) {
      e.preventDefault();
      onRegister();
    }
  };

  return (
    <SectionWrapper
      variant={w.variant ?? "glow"}
      padding={w.padding ?? "lux"}
      noise={w.noise ?? false}
      grid={w.grid ?? false}
      withFades={w.withFades ?? true}
    >
      <div className="max-w-3xl mx-auto text-center px-6">
        <SectionTitle
          eyebrow={t.eyebrow}
          sub={t.sub ?? "What’s next"}
          align={t.align ?? "center"}
          tone={t.tone ?? "default"}
          disableEmphasis={t.disableEmphasis ?? false}
        >
          {heading}
        </SectionTitle>

        {/* NEW: under-header text block */}
        {underHeader && (
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <p className="text-white/80 font-body text-base md:text-lg leading-relaxed">
              {underHeader}
            </p>
          </motion.div>
        )}

        <motion.div
          className="mt-2 space-y-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {description && (
            <p className="text-white/85 font-body text-lg md:text-xl leading-relaxed">
              {description}
            </p>
          )}
          {note && <p className="text-sm font-body text-white/60">{note}</p>}
        </motion.div>

        <motion.div
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, delay: 0.05, ease: "easeOut" }}
        >
          <a
            href={primaryUrl}
            onClick={onRegister ? handlePrimaryClick : undefined}
          >
            <button
              className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-black shadow-md shadow-primary/25 hover:bg-primary/90 transition-colors"
              type="button"
            >
              {primaryLabel}
            </button>
          </a>

          {showSecondary && (
            <a href={secondaryUrl}>
              <button
                className="inline-flex items-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/5 transition-colors"
                type="button"
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
