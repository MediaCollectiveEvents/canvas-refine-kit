import React from "react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/shared/SectionHeader";
import type { AnySection } from "@/lib/sections";

// Take the 'upcomingEventsIntro' member from your AnySection union
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

  const heading = data?.heading ?? "Upcoming Events";
  const description =
    data?.description ??
    "Discover upcoming events bringing together senior leaders from across media, entertainment, and technology.";
  const note =
    data?.note ??
    "Spaces are limited to keep events focused and conversational.";

  const primaryLabel = data?.cta?.label ?? "Learn More";
  const primaryUrl = data?.cta?.url ?? "/events";

  const secondaryLabel = data?.secondaryCta?.label ?? "";
  const secondaryUrl = data?.secondaryCta?.url ?? "/events";

  const showSecondary = !!(
    data?.secondaryCta?.label || data?.secondaryCta?.url
  );

  const handlePrimaryClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onRegister) {
      e.preventDefault();
      onRegister();
    }
  };

  return (
    <section className="py-20 md:py-24 px-6 bg-background">
      <div className="container mx-auto max-w-5xl">
        <SectionHeader title="" accentWord={heading} />

        <motion.div
          className="mt-6 space-y-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          {description && (
            <p className="text-muted-foreground font-body text-lg">
              {description}
            </p>
          )}

          {note && (
            <p className="text-sm font-body text-muted-foreground/80">{note}</p>
          )}
        </motion.div>

        <motion.div
          className="mt-8 flex flex-wrap gap-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <a
            href={primaryUrl}
            onClick={onRegister ? handlePrimaryClick : undefined}
          >
            <button className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              {primaryLabel}
            </button>
          </a>

          {showSecondary && (
            <a href={secondaryUrl}>
              <button className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
                {secondaryLabel || "View All Events"}
              </button>
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default UpcomingEventsIntroSection;
