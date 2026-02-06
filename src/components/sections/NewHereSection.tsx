// src/components/sections/NewHereSection.tsx
import React from "react";

interface NewHereSectionProps {
  section: {
    type: "newHere";
    heading: string;
    body?: string;
    cta?: {
      label: string;
      url?: string;
    };
  };
  onRegisterClick?: () => void;
}

const NewHereSection: React.FC<NewHereSectionProps> = ({
  section,
  onRegisterClick,
}) => {
  const { heading, body, cta } = section;

  return (
    <section className="border-t border-border bg-muted/20">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80">
            First time?
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {heading}
          </h2>
          {body && (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {body}
            </p>
          )}

          {cta && (
            <div className="mt-6">
              {onRegisterClick ? (
                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  {cta.label}
                </button>
              ) : (
                <a
                  href={cta.url || "#"}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  {cta.label}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewHereSection;
``;
