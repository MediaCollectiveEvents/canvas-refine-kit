// src/components/sections/PartnersSection.tsx
import PageSection from "@/components/shared/PageSection";
import SectionHeader from "@/components/shared/SectionHeader";

type PartnerLogo =
  | string
  | {
      name?: string;
      logo?: string;
      url?: string;
    };

interface PartnersSectionProps {
  section: {
    type: "partners";
    heading: string;
    description?: string;
    logos?: PartnerLogo[];
  };
}

export function PartnersSection({ section }: PartnersSectionProps) {
  const heading = section.heading || "";
  const words = heading.split(" ").filter(Boolean);

  // Make the last 2 words the accent (e.g. "Partner Community")
  let title = heading;
  let accentWord = "";

  if (words.length > 1) {
    const accentCount = Math.min(2, words.length - 1);
    const accentWords = words.slice(-accentCount).join(" ");
    const titleWords = words.slice(0, words.length - accentCount).join(" ");
    title = titleWords;
    accentWord = accentWords;
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

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <SectionHeader title={title} accentWord={accentWord || undefined} />

        {section.description && (
          <p className="mt-6 text-lg text-white/80 font-body leading-relaxed">
            {section.description}
          </p>
        )}

        {/* Logos grid (optional, safe to be empty for now) */}
        {section.logos && section.logos.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-3 md:grid-cols-4">
            {section.logos.map((item, index) => {
              const isString = typeof item === "string";
              const logoName = isString ? item : item.name || "";
              const logoSrc = !isString && item.logo ? item.logo : undefined;
              const href = !isString ? item.url : undefined;
              const Wrapper: React.ElementType = href ? "a" : "div";

              return (
                <Wrapper
                  key={index}
                  {...(href
                    ? { href, target: "_blank", rel: "noreferrer" }
                    : {})}
                  className="flex items-center justify-center rounded-xl border border-white/10 bg-black/20 px-4 py-3 shadow-sm backdrop-blur-sm transition hover:border-primary/60 hover:bg-black/30"
                >
                  {logoSrc ? (
                    <img
                      src={logoSrc}
                      alt={logoName}
                      className="max-h-10 object-contain"
                    />
                  ) : (
                    <span className="text-sm font-medium text-white/70">
                      {logoName}
                    </span>
                  )}
                </Wrapper>
              );
            })}
          </div>
        )}
      </div>
    </PageSection>
  );
}

export default PartnersSection;
