import React from "react";
import SectionWrapper from "@/components/layout/SectionWrapper";

type WhoAttendsSectionData = {
  type: "whoAttends";
  heading?: string;
  statistics?: {
    companies?: string;
    boardLevel?: string;
    founders?: string;
  };
};

interface WhoAttendsSectionProps {
  section: WhoAttendsSectionData;
}

const WhoAttendsSection: React.FC<WhoAttendsSectionProps> = ({ section }) => {
  const { heading } = section;

  // Allow CMS heading, but accent last word in teal (e.g. "In The Room")
  const rawHeading = heading ?? "In The Room";
  const words = rawHeading.trim().split(" ");
  const lastWord = words.pop() ?? "";
  const firstPart = words.join(" ");

  const intro =
    "Executives from more than 300 companies have attended our events, including leaders from the world’s most influential technology companies, film studios and streaming platforms.";

  return (
    <SectionWrapper
      variant="clean"
      align="left"
      padding="lux"
      noise={false}
      grid={false}
      withFades={false}
      className="
        relative overflow-hidden
        pt-[120px] pb-[130px]
        bg-gradient-to-b from-[#0B1015] to-[#0E1A1D]
      "
    >
      {/* Very soft glow */}
      <div
        className="
          absolute inset-0 pointer-events-none
          bg-[radial-gradient(circle_at_center,rgba(0,200,170,0.025)_0%,rgba(0,0,0,0)_60%)]
        "
      />

      <div className="relative z-10 w-full text-left">
        {/* 2-COLUMN INTRO – SAME GRID AS ABOUT */}
        <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-10 md:gap-16 items-start mb-[72px]">
          {/* LEFT COLUMN – eyebrow + heading */}
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-white/60 mb-4">
              Attendees
            </p>
            <h2
              className="
                text-[2.75rem] sm:text-[3rem] md:text-[3.1rem]
                font-serif font-normal
                leading-[1.18]
                text-white
              "
            >
              {firstPart}{" "}
              <span className="text-teal-400">{lastWord}</span>
            </h2>
          </div>

          {/* RIGHT COLUMN – paragraph + divider */}
          <div className="max-w-[620px]">
            <p className="text-[1.15rem] leading-[1.65] text-white/80">
              {intro}
            </p>

            {/* Divider aligned to paragraph start */}
            <div className="mt-7 mb-12">
              <div
                className="
                  h-[2px] w-[160px]
                  bg-gradient-to-r from-white/30 to-white/0
                "
              />
            </div>
          </div>
        </div>

        {/* 3–5–8 GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[64px] md:gap-[80px] items-start">
          {/* 3 */}
          <div className="flex flex-col">
            <span className="text-[64px] sm:text-[68px] md:text-[72px] font-semibold text-white leading-none">
              3
            </span>
            <span className="text-[1.1rem] mt-3 font-semibold text-teal-400">
              Top
            </span>
            <span className="text-[0.95rem] text-white/75 mt-[6px] leading-relaxed">
              Global Technology Giants
            </span>
          </div>

          {/* 5 */}
          <div className="flex flex-col">
            <span className="text-[64px] sm:text-[68px] md:text-[72px] font-semibold text-white leading-none">
              5
            </span>
            <span className="text-[1.1rem] mt-3 font-semibold text-teal-400">
              Major
            </span>
            <span className="text-[0.95rem] text-white/75 mt-[6px] leading-relaxed">
              Hollywood Studios
            </span>
          </div>

          {/* 8 */}
          <div className="flex flex-col">
            <span className="text-[64px] sm:text-[68px] md:text-[72px] font-semibold text-white leading-none">
              8
            </span>
            <span className="text-[1.1rem] mt-3 font-semibold text-teal-400">
              Leading
            </span>
            <span className="text-[0.95rem] text-white/75 mt-[6px] leading-relaxed">
              Streaming Platforms
            </span>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default WhoAttendsSection;