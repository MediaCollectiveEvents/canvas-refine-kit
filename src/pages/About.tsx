import { useState } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import PageHero from "@/components/shared/PageHero";
import PageSection from "@/components/shared/PageSection";
import PageCTA from "@/components/shared/PageCTA";
import EventRegistrationForm from "@/components/EventRegistrationForm";

import AboutOverviewSection from "@/components/sections/AboutOverviewSection";
import OurStorySection from "@/components/sections/OurStorySection";
import MissionValuesSection from "@/components/sections/MissionValuesSection";

import heroImage from "@/assets/hero-placeholder.jpg";

// JSON content for the About page
import about from "@/content/about.json";

const About = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { hero, sections } = about as any;

  const aboutIntro = sections.find((s: any) => s.type === "aboutIntro");
  const story = sections.find((s: any) => s.type === "story");
  const missionValues = sections.find((s: any) => s.type === "missionValues");
  const joinUs = sections.find((s: any) => s.type === "joinUs");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      {/* Hero */}
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        primaryCtaText={hero.primaryCta?.label}
        onPrimaryClick={() => setIsFormOpen(true)}
        variant="image"
        backgroundImage={heroImage}
      />

      <main>
        {/* About The Media Collective */}
        {aboutIntro && (
          <AboutOverviewSection
            title={aboutIntro.title}
            accentWord={aboutIntro.accentWord}
            body={aboutIntro.body}
            onRegisterClick={() => setIsFormOpen(true)}
            ctaLabel={aboutIntro.cta?.label}
          />
        )}

        {/* Our Story */}
        {story && (
          <OurStorySection
            title={story.title}
            accentWord={story.accentWord}
            body={story.body}
          />
        )}

        {/* Mission & Values */}
        {missionValues && (
          <PageSection variant="darker">
            <MissionValuesSection section={missionValues} />
          </PageSection>
        )}

        {/* Join Us CTA (reuses existing PageCTA styling) */}
        <PageSection variant="accent" className="py-20">
          {/* Optionally, we can later make PageCTA read from joinUs JSON */}
          <PageCTA onClick={() => setIsFormOpen(true)} />
        </PageSection>
      </main>

      <Footer />
    </div>
  );
};

export default About;
