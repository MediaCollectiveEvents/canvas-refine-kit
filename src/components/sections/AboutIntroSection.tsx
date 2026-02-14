import SectionWrapper from "@/components/layout/SectionWrapper";
import SectionTitle from "@/components/layout/SectionTitle";
import type { AboutIntroSection as AboutIntroSectionType } from "@/lib/homepage";

interface Props {
  section: AboutIntroSectionType;
}

export function AboutIntroSection({ section }: Props) {
  return (
    <SectionWrapper className="relative overflow-hidden" showDivider>
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Title using unified component */}
        <SectionTitle>
          About <span className="text-primary">Us</span>
        </SectionTitle>

        {/* Intro paragraph */}
        <p className="text-lg text-white/80 font-body leading-relaxed mb-6">
          {section.body}
        </p>

        {/* Extended paragraph */}
        <p className="text-lg text-white/80 font-body leading-relaxed">
          {section.extended}
        </p>
      </div>
    </SectionWrapper>
  );
}
