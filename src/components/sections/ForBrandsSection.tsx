// src/components/sections/ForBrandsSection.tsx
import React from "react";

interface ForBrandsSectionProps {
  section: {
    type: "forBrands";
    heading: string;
    body?: string;
    cta?: {
      label: string;
      url?: string;
    };
  };
}

const ForBrandsSection: React.FC<ForBrandsSectionProps> = ({ section }) => {
  const { heading, body, cta } = section;

  return (
    <section className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-background via-background to-muted/60 px-6 py-10 sm:px-10 md:px-12 md:py-12 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80">
              For brands & partners
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {heading}
            </h2>
            {body && (
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {body}
              </p>
            )}
          </div>

          {cta && (
            <div className="mt-6 lg:mt-0 lg:flex-shrink-0">
              <a
                href={cta.url || "/partners"}
                className="inline-flex items-center justify-center rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-sm transition hover:bg-foreground/90"
              >
                {cta.label}
              </a>
              <p className="mt-3 text-xs text-muted-foreground">
                Explore ways to host, collaborate, or support curated media
                industry experiences.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ForBrandsSection;
