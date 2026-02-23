import SectionWrapper from "../layout/SectionWrapper";
import SectionTitle from "@/components/layout/SectionTitle";
import type { AboutIntroSection as AboutIntroSectionType } from "@/lib/homepage";

interface Props {
  section: AboutIntroSectionType & {
    styleTitle?: {
      eyebrow?: string;
      sub?: string;
      align?: "center" | "left" | "right";
      tone?: "default" | "muted";
      disableEmphasis?: boolean;
    };
    styleWrapper?: {
      variant?: "clean" | "tint" | "glow";
      padding?: "lux" | "regular";
      noise?: boolean;
      grid?: boolean;
      withFades?: boolean;
    };
  };
}

export function AboutIntroSection({ section }: Props) {
  const t = section.styleTitle ?? {};
  const w = section.styleWrapper ?? {};

  return (
    <SectionWrapper
      variant={w.variant ?? "clean"}
      padding={w.padding ?? "lux"}
      noise={w.noise ?? false}
      grid={w.grid ?? false}
      withFades={w.withFades ?? true}
      className="relative overflow-hidden"
    >
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Admin‑controlled section title */}
        <SectionTitle
          eyebrow={t.eyebrow}
          sub={t.sub}
          align={t.align ?? "center"}
          tone={t.tone ?? "default"}
          disableEmphasis={t.disableEmphasis ?? false}
        >
          {section.heading ?? "About Us"}
        </SectionTitle>

        {/* Primary body */}
        {section.body && (
          <p className="text-lg text-white/85 font-body leading-relaxed mb-6">
            {section.body}
          </p>
        )}

        {/* Extended body */}
        {section.extended && (
          <p className="text-lg text-white/70 font-body leading-relaxed">
            {section.extended}
          </p>
        )}
      </div>
    </SectionWrapper>
  );
}
