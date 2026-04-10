import React from "react";

interface AboutIntroSectionProps {
  section: any;
}

export default function AboutIntroSection({
  section,
}: AboutIntroSectionProps) {
  return (
    <section className="relative overflow-hidden py-16 md:py-20 bg-[var(--background-light)]">
      
      {/* subtle background glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0
          bg-[radial-gradient(circle_at_20%_40%,rgba(54,224,198,0.08),transparent_60%)]
        "
      />

      <div className="relative max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-start">

        {/* LEFT COLUMN — heading + accent */}
        <div className="relative">

          {/* accent bar */}
          <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-[#36e0c6]/50" />

          <div className="pl-6">
            <h2
              className="
                font-body
                text-[2rem] md:text-[2.4rem]
                tracking-[-0.01em]
                text-slate-900
              "
            >
              About{" "}
              <span className="text-[#36e0c6]">
                Us
              </span>
            </h2>

            <div className="mt-4 w-16 h-px bg-slate-300" />
          </div>
        </div>

        {/* RIGHT COLUMN — body text */}
        <div
          className="
            font-body
            text-[1.05rem]
            leading-[1.75]
            text-slate-600
            max-w-[54ch]
          "
        >
          {section.body
            ?.split("\n\n")
            .map((paragraph: string, i: number) => (
              <p key={i} className="mb-6 last:mb-0">
                {paragraph}
              </p>
            ))}
        </div>
      </div>
    </section>
  );
}