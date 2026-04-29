import React from "react";
import SectionWrapper from "../layout/SectionWrapper";
import SectionTitle from "../layout/SectionTitle";
import { Button } from "../ui/button";

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

  const handleClick = () => {
    if (cta?.url) {
      window.location.href = cta.url;
    }
  };

  return (
    <SectionWrapper
      variant="light"
      align="left"
      padding="lux"
      noise={false}
      grid={false}
      withFades={false}
      className="relative bg-[#E8E9EA]"
    >
      <div className="max-w-4xl">
        {/* eyebrow */}
        <p
          className="
            font-body
            text-[0.72rem]
            uppercase
            tracking-[0.22em]
            text-[#64748B]
            mb-3
          "
        >
          For brands & partners
        </p>

        {/* heading */}
        <SectionTitle align="left" tone="dark">
          {heading.split(" ")[0]}{" "}
          <span className="text-[#27CDBA]">
            {heading.split(" ").slice(1).join(" ")}
          </span>
        </SectionTitle>

        {/* body */}
        {body && (
          <p
            className="
              mt-4
              max-w-[60ch]
              font-body
              text-[1.05rem]
              leading-[1.75]
              text-[#475569]
            "
          >
            {body}
          </p>
        )}

        {/* CTA */}
        {cta && (
          <div className="mt-8">
            <Button
              variant="brand"
              size="lg"
              onClick={handleClick}
              className="
                min-w-[240px]
                rounded-full
                px-8 py-3.5
                font-body
                text-[0.9rem]
                font-semibold
                uppercase
                tracking-[0.14em]
              "
            >
              {cta.label}
            </Button>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};

export default ForBrandsSection;