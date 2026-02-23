import PageSection from "@/components/shared/PageSection";
import SectionHeader from "@/components/shared/SectionHeader";

interface JoinUsSectionData {
  type: "joinUs";
  title: string;
  accentWord: string;
  body: string;
  cta?: {
    label: string;
    url?: string;
  };
}

interface JoinUsSectionProps {
  section: JoinUsSectionData;
  onRegisterClick?: () => void;
}

export function JoinUsSection({
  section,
  onRegisterClick,
}: JoinUsSectionProps) {
  const { title, accentWord, body, cta } = section;

  const buttonClasses =
    "inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90";

  return (
    <PageSection
      variant="accent"
      className="relative overflow-hidden py-24 md:py-32"
    >
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <SectionHeader title={title} accentWord={accentWord} />

        <p className="mt-6 text-lg text-white/80 font-body leading-relaxed max-w-2xl mx-auto">
          {body}
        </p>

        {cta && (
          <div className="mt-10">
            {cta.url ? (
              // If a URL is provided in JSON, render as a link
              <a href={cta.url} className={buttonClasses}>
                {cta.label}
              </a>
            ) : (
              // Otherwise, fall back to modal behaviour
              <button
                type="button"
                onClick={onRegisterClick}
                className={buttonClasses}
              >
                {cta.label}
              </button>
            )}
          </div>
        )}
      </div>
    </PageSection>
  );
}

export default JoinUsSection;
