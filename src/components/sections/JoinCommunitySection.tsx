import React from "react";
import SectionWrapper from "../layout/SectionWrapper";
import SectionTitle from "../layout/SectionTitle";
import { Button } from "../ui/button";

type JoinCommunitySectionData = {
  type: "joinCommunity";
  heading?: string;
  body?: string;
  cta?: {
    label?: string;
    url?: string;
  };
};

interface JoinCommunitySectionProps {
  section: JoinCommunitySectionData;
  onRegisterClick?: () => void;
}

const JoinCommunitySection: React.FC<JoinCommunitySectionProps> = ({
  section,
  onRegisterClick,
}) => {
  const heading = section.heading ?? "Join the Community";
  const body =
    section.body ??
    "Be part of a growing network of media leaders, innovators, and creatives. Our events are free, invite-only, and designed for great conversations.";
  const ctaLabel = section.cta?.label ?? "Register Your Interest";
  const ctaUrl = section.cta?.url ?? "/register";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onRegisterClick) {
      e.preventDefault();
      onRegisterClick();
      return;
    }

    if (ctaUrl) {
      window.location.href = ctaUrl;
    }
  };

  return (
    <SectionWrapper
      variant="dark"
      align="center"
      padding="lux"
      noise={false}
      grid={false}
      withFades={false}
      className="relative bg-[#0F172A] text-white"
    >
      <div className="mx-auto max-w-3xl text-center">
        <SectionTitle align="center">
          Join the <span className="text-[#27CDBA]">Community</span>
        </SectionTitle>

        <p
          className="
            mx-auto mt-4 max-w-[46ch]
            font-body
            text-[1rem] md:text-[1.0625rem]
            leading-[1.75]
            text-white/75
          "
        >
          {body}
        </p>

        <div className="mt-8 flex justify-center">
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
            {ctaLabel}
          </Button>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default JoinCommunitySection;