import React from "react";
import SectionWrapper from "@/components/layout/SectionWrapper";
import SectionTitle from "@/components/layout/SectionTitle";
import { Globe, Film, Play } from "lucide-react";

// Optional shared styles (only if you created them; otherwise keep inline types below)
// import type { StyleTitle, StyleWrapper } from "@/lib/sectionStyles";

type IconName = "globe" | "film" | "play";

type WhoAttendsHighlight = {
  title?: string;
  subtitle?: string;
  icon?: IconName;
};

type WhoAttendsSectionData = {
  type: "whoAttends";
  heading?: string;
  statistics?: {
    companies?: string;
    boardLevel?: string;
    founders?: string;
  };
  highlights?: WhoAttendsHighlight[];

  // Admin-driven styling (from Decap)
  styleTitle?: {
    eyebrow?: string;
    sub?: string;
    align?: "center" | "left" | "right";
    tone?: "default" | "muted";
    disableEmphasis?: boolean;
  };
  styleWrapper?: {
    variant?: "clean" | "tint" | "glow";
    padding?: "lux" | "regular";
    noise?: boolean;
    grid?: boolean;
    withFades?: boolean;
  };
};

interface WhoAttendsSectionProps {
  section: WhoAttendsSectionData;
}

const iconMap: Record<IconName, React.FC<any>> = {
  globe: Globe,
  film: Film,
  play: Play,
};

const WhoAttendsSection: React.FC<WhoAttendsSectionProps> = ({ section }) => {
  const {
    heading = "Who Attends",
    statistics = {},
    highlights = [],
    styleTitle,
    styleWrapper,
  } = section;

  const { companies, boardLevel, founders } = statistics;

  // Intro paragraphs (safe fallbacks)
  const intro: string[] = [
    `${companies ?? "Over 300 companies"} across media, entertainment and technology have attended our events.`,
    `Our events are free‑invite only and curated for a maximum of 120 guests, attracting industry leaders and innovators. This includes ${boardLevel ?? "over 100 board-level executives"} and ${founders ?? "34 startup founders"}.`,
  ];

  // Defaults if CMS list is empty
  const defaultHighlights: WhoAttendsHighlight[] = [
    { title: "The Top 3", subtitle: "Global Tech Giants", icon: "globe" },
    { title: "The Major 5", subtitle: "Hollywood Studios", icon: "film" },
    { title: "The Leading 8", subtitle: "Streaming Platforms", icon: "play" },
  ];

  const effectiveHighlights =
    highlights && highlights.length > 0 ? highlights : defaultHighlights;

  // Subtle, premium palette per card
  const iconColorClasses = [
    "text-teal-300",
    "text-violet-300",
    "text-amber-300",
  ];
  const circleBgClasses = [
    "bg-teal-300/15",
    "bg-violet-300/15",
    "bg-amber-300/15",
  ];

  // Title styling defaults (admins can override in CMS)
  const t = styleTitle ?? {};
  const w = styleWrapper ?? {};

  return (
    <SectionWrapper
      variant={w.variant ?? "tint"}
      padding={w.padding ?? "lux"}
      noise={w.noise ?? false}
      grid={w.grid ?? true}
      withFades={w.withFades ?? true}
      className="overflow-hidden"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <SectionTitle
          eyebrow={t.eyebrow}
          sub={t.sub ?? "A snapshot of our community"}
          align={t.align ?? "center"}
          tone={t.tone ?? "default"}
          disableEmphasis={t.disableEmphasis ?? false}
        >
          {heading}
        </SectionTitle>

        {/* Intro paragraphs */}
        <div className="mx-auto max-w-3xl text-center space-y-4 text-white/80 font-body text-lg leading-relaxed mb-12">
          {intro.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Highlight cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
          {effectiveHighlights.map(({ title, subtitle, icon }, idx) => {
            const Icon = iconMap[(icon ?? "globe") as IconName];
            const iconColor =
              iconColorClasses[idx] ??
              iconColorClasses[iconColorClasses.length - 1];
            const circleBg =
              circleBgClasses[idx] ??
              circleBgClasses[circleBgClasses.length - 1];

            return (
              <div
                key={`${title}-${idx}`}
                className="
                  group rounded-2xl border border-white/10 bg-white/[0.02] 
                  p-6 md:p-7 text-center transition
                  hover:bg-white/[0.04]
                "
              >
                {/* Icon circle */}
                <div
                  className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${circleBg}`}
                >
                  <Icon className={`w-7 h-7 ${iconColor}`} />
                </div>

                <h3 className="text-white/90 font-sans text-lg md:text-xl font-medium">
                  {title ?? "Highlight"}
                </h3>

                {subtitle && (
                  <p className="text-white/60 font-body text-sm mt-1">
                    {subtitle}
                  </p>
                )}

                {/* Subtle divider line on hover */}
                <div className="mt-4 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition" />
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default WhoAttendsSection;
``;
