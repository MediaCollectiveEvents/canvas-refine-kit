import SectionWrapper from "../layout/SectionWrapper";
import type { AboutIntroSection as AboutIntroSectionType } from "@/lib/homepage";

interface Props {
  section: AboutIntroSectionType & {
    themeMode?: "light" | "dark";
    styleTitle?: {
      eyebrow?: string;
      sub?: string;
    };
    styleWrapper?: {
      padding?: "lux" | "regular";
    };
  };
}

export function AboutIntroSection({ section }: Props) {
  const w = section.styleWrapper ?? {};

  const theme = section.themeMode ?? "light";
  const isDark = theme === "dark";

  // Accent last word
  const heading = section.heading ?? "About Us";
  const parts = heading.split(" ");
  const last = parts.pop();
  const first = parts.join(" ");

  return (
    <SectionWrapper
      variant="clean"
      padding={w.padding ?? "regular"}
      noise={false}
      grid={false}
      withFades={false}
      align="left"
      className={`
        relative overflow-hidden
        ${isDark ? "bg-[#0C1117]" : "bg-[#F7F9FA]"}
      `}
    >
      <div className="relative z-10 w-full text-left">

        {/* =============================== */}
        {/* 40 / 60 GRID (same as In The Room) */}
        {/* =============================== */}
        <div className="
          grid grid-cols-1 
          md:grid-cols-[40%_60%]
          gap-10 md:gap-16
          items-start
          relative
        ">

          {/* -------- LEFT COLUMN -------- */}
          <div className="pt-0">
            <h2
              className={`
                text-[2.4rem] sm:text-[2.6rem] md:text-[2.75rem]
                font-serif font-normal leading-[1.18]
                ${isDark ? "text-white" : "text-[#1A1C1E]"}
              `}
            >
              {first}{" "}
              <span className="text-teal-500">{last}</span>
            </h2>
          </div>

          {/* -------- RIGHT COLUMN -------- */}
          <div className="max-w-[620px]">
            {section.body && (
              <p
                className={`
                  text-[1.0625rem]
                  leading-[1.65]
                  mb-6
                  ${isDark ? "text-white/90" : "text-zinc-700"}
                `}
              >
                {section.body}
              </p>
            )}

            {section.extended && (
              <p
                className={`
                  text-[1.0625rem]
                  leading-[1.65]
                  mb-6
                  ${isDark ? "text-white/80" : "text-zinc-700"}
                `}
              >
                {section.extended}
              </p>
            )}
          </div>

          {/* =============================== */}
          {/* VERTICAL DIVIDER BETWEEN COLUMNS */}
          {/* =============================== */}
          <div
            className={`
              hidden md:block absolute 
              left-[40%] top-0 bottom-0 
              w-[2px]
              ${isDark ? "bg-white/25" : "bg-zinc-800/25"}
            `}
          />

        </div>
      </div>
    </SectionWrapper>
  );
}