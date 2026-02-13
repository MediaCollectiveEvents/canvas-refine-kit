import React from "react";
import { Globe, Film, Play } from "lucide-react";

type WhoAttendsHighlight = {
  title?: string;
  subtitle?: string;
  icon?: "globe" | "film" | "play";
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
};

interface WhoAttendsSectionProps {
  section: WhoAttendsSectionData;
}

const iconMap: Record<string, React.FC<any>> = {
  globe: Globe,
  film: Film,
  play: Play,
};

const WhoAttendsSection: React.FC<WhoAttendsSectionProps> = ({ section }) => {
  const { heading = "Who Attends", statistics = {}, highlights = [] } = section;

  const { companies, boardLevel, founders } = statistics;

  // Intro paragraphs from CMS statistics (with safe fallbacks)
  const intro: string[] = [
    `${companies ?? "Over 300 companies"} across media, entertainment and technology have attended our events.`,
    `Our events are free‑invite only and curated for a maximum of 120 guests, attracting industry leaders and innovators. This includes ${boardLevel ?? "over 100 board-level executives"} and ${founders ?? "34 startup founders"}.`,
  ];

  // Default highlights used if CMS list is empty
  const defaultHighlights: WhoAttendsHighlight[] = [
    { title: "The Top 3", subtitle: "Global Tech Giants", icon: "globe" },
    { title: "The Major 5", subtitle: "Hollywood Studios", icon: "film" },
    { title: "The Leading 8", subtitle: "Streaming Platforms", icon: "play" },
  ];

  const effectiveHighlights =
    highlights.length > 0 ? highlights : defaultHighlights;

  // Colour sets per card (icon + circle bg)
  const iconColorClasses = [
    "text-teal-400",
    "text-violet-400",
    "text-amber-400",
  ];
  const circleBgClasses = [
    "bg-teal-400/15",
    "bg-violet-400/15",
    "bg-amber-400/15",
  ];

  return (
    <section className="py-24 md:py-32 bg-background border-t border-white/5">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        {/* Heading with italic “Attends” */}
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-8">
          {heading.toLowerCase().includes("attends") ? (
            <>
              {heading.replace(/attends/i, "").trim()}{" "}
              <span className="text-primary italic">Attends</span>
            </>
          ) : (
            <>
              {heading} <span className="text-primary italic">Attends</span>
            </>
          )}
        </h2>

        {/* Intro paragraphs */}
        <div className="space-y-4 text-foreground/80 text-lg leading-relaxed mb-14">
          {intro.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Highlight cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {effectiveHighlights.map(({ title, subtitle, icon }, idx) => {
            const Icon = iconMap[icon ?? "globe"];
            const iconColor =
              iconColorClasses[idx] ??
              iconColorClasses[iconColorClasses.length - 1];
            const circleBg =
              circleBgClasses[idx] ??
              circleBgClasses[circleBgClasses.length - 1];

            return (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-10 
                           shadow-sm flex flex-col items-center text-center hover:bg-white/10 transition"
              >
                {/* Icon circle with different colour per card */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-5 shadow-sm ${circleBg}`}
                >
                  <Icon className={`w-7 h-7 drop-shadow ${iconColor}`} />
                </div>

                <h3 className="text-xl font-semibold text-white">
                  {title ?? "Highlight"}
                </h3>

                <p className="text-sm text-foreground/70 mt-1">
                  {subtitle ?? ""}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhoAttendsSection;
