import React from "react";
import SectionWrapper from "../layout/SectionWrapper";
import SectionTitle from "../layout/SectionTitle";

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
    <SectionWrapper
      variant="light"
      align="left"
      padding="lux"
      noise={false}
      grid={false}
      withFades={false}
      className="relative"
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_18%_28%,rgba(54,224,198,0.04),transparent_40%)]
        "
      />

      <div className="grid items-start gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,4fr)] md:gap-20">
        <div className="pt-[0.75rem]">
          <SectionTitle align="left" tone="dark">
            What <span className="text-[#36e0c6]">We Do</span>
          </SectionTitle>

          <div
            aria-hidden="true"
            className="mt-4 h-px w-full max-w-[320px]"
            style={{
              background:
                "linear-gradient(to right, rgba(100,116,139,0.6), rgba(100,116,139,0))",
            }}
          />

          <p
            className="
              mt-6
              max-w-[26ch]
              font-body
              text-[1rem] md:text-[1.0625rem]
              leading-[1.65]
              text-slate-600
            "
          >
            We host unmissable events at key moments in the global media
            calendar.
          </p>
        </div>

        <div className="max-w-[900px]">
          {leadParagraph && (
            <p
              className="
                font-body
                text-[1.16rem] md:text-[1.25rem]
                leading-[1.58]
                tracking-[-0.012em]
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
                text-[1rem] md:text-[1.0625rem]
                leading-[1.78]
                text-slate-600
              "
            >
              {remainingParagraphs.map((paragraph: string, i: number) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}

          <div className="mt-8">
            <a
              href="/events"
              className="
                inline-flex items-center gap-2
                font-body
                text-[0.875rem]
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
    </SectionWrapper>
  );
}