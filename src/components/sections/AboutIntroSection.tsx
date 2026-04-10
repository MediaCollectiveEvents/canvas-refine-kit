import React from "react";

interface AboutIntroSectionProps {
  section: any;
}

export default function AboutIntroSection({
  section,
}: AboutIntroSectionProps) {
  const paragraphs =
    section.body
      ?.split("\n\n")
      .map((paragraph: string) => paragraph.trim())
      .filter(Boolean) ?? [];

  const leadParagraph = paragraphs[0] ?? "";
  const remainingParagraphs = paragraphs.slice(1);

  return (
    <section className="relative overflow-hidden bg-[var(--background-light)] py-14 md:py-16">
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_18%_28%,rgba(54,224,198,0.04),transparent_40%)]
        "
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid items-start gap-10 md:grid-cols-[0.8fr_1.4fr] md:gap-14">
          
          {/* LEFT COLUMN */}
          <div>
            <h2
              className="
                font-body
                text-[2.2rem] md:text-[2.5rem]
                tracking-[-0.03em]
                leading-[1.02]
                text-slate-900
              "
            >
              Curated{" "}
              <span className="text-[#36e0c6]">
                gatherings
              </span>
            </h2>

            {/* divider */}
            <div className="mt-5 w-36 h-px bg-slate-300" />

            {/* strapline */}
            <p
              className="
                mt-6
                max-w-[26ch]
                font-body
                text-[1.02rem]
                leading-[1.65]
                text-slate-600
              "
            >
              We host unmissable events at key moments in the global media calendar.
            </p>
          </div>

          {/* RIGHT COLUMN */}
          <div className="max-w-[64ch]">
            {leadParagraph && (
              <p
                className="
                  font-body
                  text-[1.28rem] md:text-[1.42rem]
                  leading-[1.52]
                  tracking-[-0.015em]
                  text-slate-700
                "
              >
                {leadParagraph}
              </p>
            )}

            {remainingParagraphs.length > 0 && (
              <div
                className="
                  mt-7 space-y-6
                  font-body
                  text-[1.04rem]
                  leading-[1.78]
                  text-slate-600
                "
              >
                {remainingParagraphs.map((paragraph: string, i: number) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}

            {/* CTA aligned with text column */}
            <div className="mt-8">
              <a
                href="/events"
                className="
                  inline-flex items-center gap-2
                  font-body
                  text-[0.82rem]
                  uppercase
                  tracking-[0.16em]
                  text-[#36e0c6]
                  transition hover:opacity-80
                "
              >
                Explore upcoming events
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}