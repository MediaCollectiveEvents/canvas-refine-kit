import React from "react";
import { Globe, Film, Play } from "lucide-react";

type WhoAttendsSectionData = {
  type: "whoAttends";
  heading?: string;
  statistics?: {
    companies?: string;
    boardLevel?: string;
    founders?: string;
  };
  highlights?: string[];
};

interface WhoAttendsSectionProps {
  section: WhoAttendsSectionData;
}

const WhoAttendsSection: React.FC<WhoAttendsSectionProps> = ({ section }) => {
  const { heading = "Who Attends", statistics = {}, highlights = [] } = section;

  const { companies, boardLevel, founders } = statistics;

  // Intro paragraphs based on statistics
  const intro: string[] = [
    `${companies ?? "Over 300 companies"} across media, entertainment and technology have attended our events.`,
    `Our events are free, invite-only and curated for a maximum of 120 guests, attracting industry leaders and innovators. This includes ${boardLevel ?? "over 100 board-level executives"} and ${founders ?? "34 startup founders"}.`,
  ];

  // Default cards (matches About page styling)
  const defaultCards = [
    {
      title: "The Top 3",
      subtitle: "Global Tech Giants",
      Icon: Globe,
    },
    {
      title: "The Major 5",
      subtitle: "Hollywood Studios",
      Icon: Film,
    },
    {
      title: "The Leading 8",
      subtitle: "Streaming Platforms",
      Icon: Play,
    },
  ];

  // Convert highlights if present in CMS
  const cards = defaultCards.map((card, index) => {
    const raw = highlights[index];
    if (!raw) return card;

    const [rawTitle, rawSubtitle] = raw.split("—").map((s) => s.trim());
    return {
      title: rawTitle || card.title,
      subtitle: rawSubtitle || card.subtitle,
      Icon: card.Icon,
    };
  });

  return (
    <section className="py-24 md:py-32 bg-background border-t border-white/5">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        {/* Correct heading styling */}
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-8">
          {heading.toLowerCase().includes("attends") ? (
            <>
              {heading.replace(/attends/i, "").trim()}{" "}
              <span className="text-primary">Attends</span>
            </>
          ) : (
            <>
              {heading} <span className="text-primary">Attends</span>
            </>
          )}
        </h2>

        {/* Intro copy */}
        <div className="space-y-4 text-foreground/80 text-lg leading-relaxed mb-14">
          {intro.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Highlight cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {cards.map(({ title, subtitle, Icon }, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-10 shadow-sm 
                         flex flex-col items-center text-center hover:bg-white/10 transition"
            >
              <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mb-5">
                <Icon className="w-7 h-7 text-primary" />
              </div>

              <h3 className="text-xl font-semibold text-white">{title}</h3>

              <p className="text-sm text-foreground/70 mt-1">{subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoAttendsSection;
