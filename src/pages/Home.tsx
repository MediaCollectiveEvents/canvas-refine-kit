// src/pages/Home.tsx
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHero from "@/components/shared/PageHero";
import SectionDivider from "@/components/shared/SectionDivider";
import SectionRenderer from "@/lib/sectionRenderer";

import homepage from "@/content/homepage.json";

const Home: React.FC = () => {
  return (
    <PageLayout>
      {/* HERO WITH BACKGROUND IMAGE */}
      <PageHero
        heroPreset="home"
        eyebrow="Welcome"
        title={homepage.heroTitle}
        description={homepage.heroSubtitle}
      />

      {/* HOMEPAGE SECTIONS FROM JSON */}
      <SectionRenderer sections={homepage.sections as any[]} />
    </PageLayout>
  );
};

export default Home;
