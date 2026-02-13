import React from "react";

type WhoAttendsSectionData = {
  type: "whoAttends";
  heading?: string;
  audienceGroups?: string[];
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
  const {
    heading = "Who Attends",
    audienceGroups = [],
    statistics = {},
    highlights = [],
  } = section;

  const {
    companies = "Over 300 companies",
    boardLevel = "Over 100 board-level executives",
    founders = "34 startup founders",
  } = statistics;

  return (
    <section className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-start">
          {/* Left: audience groups */}
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
              {heading}
            </h2>

            {audienceGroups.length > 0 && (
              <ul className="mt-6 space-y-2 text-sm md:text-base text-muted-foreground">
                {audienceGroups.map((group, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{group}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right: stats + highlights */}
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Companies
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {companies}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Board-level
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {boardLevel}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Founders
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {founders}
                </p>
              </div>
            </div>

            {/* Highlights */}
            {highlights.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                  Highlights
                </p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/70" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoAttendsSection;
