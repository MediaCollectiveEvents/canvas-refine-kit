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
      variant="light"
      align="center"
      padding="lux"
      noise={false}
      grid={false}
      withFades={false}
      className="relative text-slate-900 !py-12 md:!py-[60px] lg:!py-[72px]"
    >
      <div className="mx-auto max-w-3xl text-center">
        <SectionTitle align="center" tone="dark" disableEmphasis className="!text-[30px] md:!text-4xl">
          {heading}
        </SectionTitle>

        <div className="mx-auto mt-4 max-w-[42ch] space-y-4 font-body text-[1rem] leading-[1.75] text-slate-600">
          {body.split("\n\n").filter(Boolean).map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            variant="brand"
            size="lg"
            onClick={handleClick}
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default JoinCommunitySection;