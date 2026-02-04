import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHero from "@/components/shared/PageHero";
import sponsorsData from "@/content/sponsors.json";
import { getHeroImage } from "@/lib/getHeroImage";

const Sponsors = () => {
  const sponsors = (sponsorsData as any).items || [];

  return (
    <PageLayout>
      <PageHero
        eyebrow="SPONSORS"
        title="Our Sponsors"
        description="Supporters who help shape our community."
        image={getHeroImage("sponsors-hero.png")}
        variant="image"
      />

      <div className="max-w-5xl mx-auto px-6 py-16 grid gap-10">
        {sponsors.map((s: any) => (
          <div key={s.name} className="border rounded-xl p-6 bg-card shadow">
            <h2 className="text-xl font-semibold text-primary">{s.name}</h2>
            <p className="text-muted-foreground">{s.summary}</p>
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

export default Sponsors;
