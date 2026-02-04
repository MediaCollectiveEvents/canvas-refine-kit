// src/pages/Home.tsx
import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import PageHero from "@/components/shared/PageHero";
import SectionDivider from "@/components/shared/SectionDivider";
import SectionRenderer from "@/lib/sectionRenderer";

import homepage from "@/content/homepage.json";
import homeHeroImage from "@/assets/home-hero.png";

const Home: React.FC = () => {
  return (
    <PageLayout>
      {/* HERO WITH BACKGROUND IMAGE */}
      <PageHero
        eyebrow="Welcome"
        title={homepage.heroTitle}
        description={homepage.heroSubtitle}
        image={homeHeroImage}
        variant="image"
      />

      {/* HOMEPAGE SECTIONS FROM JSON */}
      <SectionRenderer sections={homepage.sections as any[]} />
    </PageLayout>
  );
};

export default Home;
