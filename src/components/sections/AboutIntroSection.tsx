import PageSection from "@/components/shared/PageSection";
import SectionHeader from "@/components/shared/SectionHeader";
import type { AboutIntroSection as AboutIntroSectionType } from "@/lib/homepage";

interface Props {
  section: AboutIntroSectionType;
}

export function AboutIntroSection({ section }: Props) {
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
        {/* EXACT same heading style as "Who Attends" */}
        <SectionHeader title="About" accentWord="Us" />

        {/* Body */}
        <p className="text-lg text-white/80 font-body leading-relaxed mb-6">
          {section.body}
        </p>

        {/* Extended text */}
        <p className="text-lg text-white/80 font-body leading-relaxed">
          {section.extended}
        </p>
      </div>
    </PageSection>
  );
}
