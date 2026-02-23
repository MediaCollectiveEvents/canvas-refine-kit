import PageSection from "@/components/shared/PageSection";
import SectionHeader from "@/components/shared/SectionHeader";

interface OurStorySectionProps {
  title?: string;
  accentWord?: string;
  body: string;
}

export function OurStorySection({
  title = "Our",
  accentWord = "Story",
  body,
}: OurStorySectionProps) {
  return (
    <PageSection
      variant="default"
      className="relative overflow-hidden py-20 md:py-24"
    >
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <SectionHeader title={title} accentWord={accentWord} />

        <p className="mt-6 text-lg text-white/80 font-body leading-relaxed">
          {body}
        </p>
      </div>
    </PageSection>
  );
}

export default OurStorySection;
``;
