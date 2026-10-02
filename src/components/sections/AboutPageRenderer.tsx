// src/components/sections/AboutPageRenderer.tsx
import PageSection from "@/components/shared/PageSection";
import { Button } from "@/components/ui/button";
import { Users, Heart, Star } from "lucide-react";

type Base = { id?: string; hidden?: boolean };

type AboutSection = Base & {
  type: string;
  title: string;
  accentWord?: string;
  body?: string;
  description?: string;
  values?: { icon: string; title: string; description: string; color: string; bgColor: string }[];
  cta?: { label: string; url?: string };
};

export interface AboutPageRendererProps {
  sections: AboutSection[];
  onRegister: () => void;
}

const AboutPageRenderer = ({
  sections,
  onRegister,
}: AboutPageRendererProps) => {
  return (
    <>
      {sections
        .filter((s) => !s.hidden)
        .map((section) => {
          const key = section.id ?? section.type;

          switch (section.type) {
            case "aboutIntro":
            case "story":
              return (
                <PageSection key={key} className="border-b border-white/10 bg-none bg-[#101d24] py-12 md:py-16">
                  <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
                    <h2 className="font-display text-[30px] font-light leading-tight text-white md:text-4xl lg:col-span-4">
                      {section.title}{" "}{section.accentWord}
                    </h2>
                    <div className="lg:col-span-8">
                      <p className="max-w-3xl text-base leading-[1.8] text-slate-300">{section.body}</p>
                      {section.type === "aboutIntro" && <Button variant="brand" size="lg" className="mt-6" onClick={onRegister}>
                        {section.cta?.label ?? "Register Your Interest"}
                      </Button>}
                    </div>
                  </div>
                </PageSection>
              );
            case "missionValues":
              return (
                <PageSection key={key} className="bg-none bg-[#101d24] py-12 md:py-16">
                  <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
                    <h2 className="font-display text-[30px] font-light leading-tight text-white md:text-4xl lg:col-span-4">
                      {section.title}{" "}{section.accentWord}
                    </h2>
                    <div className="lg:col-span-8">
                      <p className="max-w-3xl text-base leading-[1.8] text-slate-300">{section.description}</p>
                      <div className="mt-8 grid gap-8 md:grid-cols-3">
                        {section.values?.map(value => {
                          const Icon = value.icon === "heart" ? Heart : value.icon === "star" ? Star : Users;
                          return <div key={value.title}>
                            <Icon aria-hidden="true" className="mb-4 h-6 w-6 text-primary" />
                            <h3 className="text-lg font-medium text-white">{value.title}</h3>
                            <p className="mt-3 text-sm leading-[1.8] text-slate-300">{value.description}</p>
                          </div>;
                        })}
                      </div>
                    </div>
                  </div>
                </PageSection>
              );
            case "joinUs":
              return (
                <PageSection key={key} className="border-t border-white/10 bg-none bg-[#172b31] py-12 md:py-16">
                  <div className="grid items-start gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-8">
                      <h2 className="font-display text-[30px] font-light leading-tight text-white md:text-4xl">Ready to Join Us?</h2>
                      <p className="mt-5 max-w-2xl text-base leading-[1.8] text-slate-300">Be part of the next generation of media industry connections. Our events are free, invite-only, and designed for high-value networking.</p>
                    </div>
                    <div className="lg:col-span-4 lg:justify-self-end">
                      <Button variant="brand" size="lg" onClick={onRegister}>Register Your Interest</Button>
                    </div>
                  </div>
                </PageSection>
              );
            default:
              return null;
          }
        })}
    </>
  );
};

export default AboutPageRenderer;
