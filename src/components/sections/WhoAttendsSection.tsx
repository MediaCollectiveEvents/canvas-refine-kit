// src/components/sections/WhoAttendsSection.tsx

import React from "react";
import SectionWrapper from "../layout/SectionWrapper";

interface WhoAttendsSectionProps {
  section: {
    heading?: string;
    statistics?: {
      companies?: string;
      boardLevel?: string;
      founders?: string;
    };
  };
}

const WhoAttendsSection: React.FC<WhoAttendsSectionProps> = ({ section }) => {
  const heading = section.heading ?? "In The Room";

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
      className="bg-[#0B1117] text-white py-[120px]"
    >
      <div className="relative z-10 w-full">
        {/* HEADER BLOCK */}
        <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-10 md:gap-16 items-start">
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-white/60 mb-4">
              Attendees
            </p>

            <h2
              className="
                text-[2.75rem] sm:text-[3rem] md:text-[3.1rem]
                font-serif font-normal
                leading-[1.18]
              "
            >
              In The <span className="text-teal-400">Room</span>
            </h2>
          </div>

          <div className="max-w-[580px]">
            <p className="text-[1.05rem] leading-[1.65] text-white/80">
              {intro}
            </p>

            <div className="mt-8 mb-12">
              <div className="h-[2px] w-[160px] bg-white/20" />
            </div>
          </div>
        </div>

        {/* PERFECTLY ALIGNED GRID WITH EVENTS */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">

          {/* -------- 3 / Top -------- */}
          <div className="flex justify-center">
            <div className="max-w-[340px]">
              <div className="flex items-baseline gap-3">
                <span className="text-[80px] font-semibold leading-none">
                  3
                </span>
                <span className="text-[1.2rem] font-semibold text-teal-400">
                  Top
                </span>
              </div>

              <p className="text-[1rem] text-white/75 mt-3 leading-relaxed">
                Global Technology Giants
              </p>
            </div>
          </div>

          {/* -------- 5 / Major -------- */}
          <div className="flex justify-center">
            <div className="max-w-[340px]">
              <div className="flex items-baseline gap-3">
                <span className="text-[88px] font-semibold leading-none">
                  5
                </span>
                <span className="text-[1.2rem] font-semibold text-teal-400">
                  Major
                </span>
              </div>

              <p className="text-[1rem] text-white/75 mt-3 leading-relaxed">
                Hollywood Studios
              </p>
            </div>
          </div>

          {/* -------- 8 / Leading -------- */}
          <div className="flex justify-center">
            <div className="max-w-[340px]">
              <div className="flex items-baseline gap-3">
                <span className="text-[96px] font-semibold leading-none">
                  8
                </span>
                <span className="text-[1.2rem] font-semibold text-teal-400">
                  Leading
                </span>
              </div>

              <p className="text-[1rem] text-white/75 mt-3 leading-relaxed">
                Streaming Platforms
              </p>
            </div>
          </div>

        </div>
      </div>
    </SectionWrapper>
  );
};

export default WhoAttendsSection;
