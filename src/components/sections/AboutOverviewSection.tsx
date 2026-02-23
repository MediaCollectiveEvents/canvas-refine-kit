import PageSection from "@/components/shared/PageSection";
import SectionHeader from "@/components/shared/SectionHeader";

interface AboutOverviewSectionProps {
  title?: string;
  accentWord?: string;
  body: string;
  onRegisterClick?: () => void;
  ctaLabel?: string;
}

export function AboutOverviewSection({
  title = "About the",
  accentWord = "Media Collective",
  body,
  onRegisterClick,
  ctaLabel = "Register Your Interest",
}: AboutOverviewSectionProps) {
  return (
    <PageSection
      variant="darker"
      className="relative overflow-hidden py-24 md:py-32"
    >
      {/* Matching background glow, same as AboutIntroSection */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <SectionHeader title={title} accentWord={accentWord} />

        <p className="mt-6 text-lg text-white/80 font-body leading-relaxed">
          {body}
        </p>

        {onRegisterClick && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={onRegisterClick}
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90"
            >
              {ctaLabel}
            </button>
          </div>
        )}
      </div>
    </PageSection>
  );
}

export default AboutOverviewSection;
