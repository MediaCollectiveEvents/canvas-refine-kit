// src/components/sections/JoinCommunitySection.tsx
import React from "react";

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

  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => {
    if (onRegisterClick) {
      e.preventDefault();
      onRegisterClick();
    }
  };

  return (
    <section className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            {heading}
          </h2>

          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            {body}
          </p>

          <div className="mt-8 flex justify-center">
            <a
              href={ctaUrl}
              onClick={onRegisterClick ? handleClick : undefined}
            >
              <button className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                {ctaLabel}
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinCommunitySection;
