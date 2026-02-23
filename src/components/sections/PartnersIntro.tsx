import React from "react";
import SectionHeader from "@/components/shared/SectionHeader";

interface PartnersIntroProps {
  eyebrow?: string;
  title: string;
  accentWord?: string; // ✅ allow accentWord from JSON
  text: string;
}

const PartnersIntro: React.FC<PartnersIntroProps> = ({
  eyebrow,
  title,
  accentWord,
  text,
}) => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto max-w-3xl text-center">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          accentWord={accentWord ?? ""} // ✅ satisfies SectionHeaderProps
        />
        <p className="mt-4 text-muted-foreground font-body text-base leading-relaxed">
          {text}
        </p>
      </div>
    </section>
  );
};

export default PartnersIntro;
