// src/components/sections/JoinCommunitySection.tsx
import PageSection from "@/components/shared/PageSection";
import SectionHeader from "@/components/shared/SectionHeader";

interface JoinCommunitySectionProps {
  section: {
    type: "joinCommunity";
    heading: string;
    body?: string;
    cta?: {
      label: string;
      url?: string;
    };
  };
  onRegisterClick?: () => void;
}

export function JoinCommunitySection({
  section,
  onRegisterClick,
}: JoinCommunitySectionProps) {
  const heading = section.heading || "";
  const words = heading.split(" ").filter(Boolean);

  // Accent is the last word (e.g. "Community")
  let title = heading;
  let accentWord = "";

  if (words.length > 1) {
    accentWord = words[words.length - 1];
    title = words.slice(0, -1).join(" ");
  }

  return (
    <PageSection
      variant="darker"
      className="relative overflow-hidden py-24 md:py-32"
    >
      {/* Matching background glow */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <SectionHeader title={title} accentWord={accentWord || undefined} />

        {section.body && (
          <p className="mt-6 text-lg text-white/80 font-body leading-relaxed">
            {section.body}
          </p>
        )}

        {section.cta && (
          <div className="mt-8 flex justify-center">
            {onRegisterClick ? (
              <button
                type="button"
                onClick={onRegisterClick}
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90"
              >
                {section.cta.label}
              </button>
            ) : (
              <a
                href={section.cta.url || "#"}
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90"
              >
                {section.cta.label}
              </a>
            )}
          </div>
        )}
      </div>
    </PageSection>
  );
}

export default JoinCommunitySection;
