// src/pages/Home.tsx
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";
import { AboutIntroSection } from "@/components/sections/AboutIntroSection";
import SectionDivider from "@/components/shared/SectionDivider";
import WhoAttendsSection from "@/components/sections/WhoAttendsSection";
import EventsSection from "@/components/sections/EventsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import FAQSection from "@/components/sections/FAQSection";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import heroImage from "@/assets/hero-placeholder.jpg";
import homepage from "@/content/homepage.json";

// ✅ New section imports
import PartnersSection from "@/components/sections/PartnersSection";
import JoinCommunitySection from "@/components/sections/JoinCommunitySection";
import NewHereSection from "@/components/sections/NewHereSection";
import ForBrandsSection from "@/components/sections/ForBrandsSection";

const Home = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { hero, sections } = homepage as any;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      <main>
        {/* HERO */}
        <PageHero
          eyebrow={hero.subtitle}
          title={hero.title}
          description={hero.description}
          primaryCtaText={hero.primaryCta?.label}
          onPrimaryClick={() => setIsFormOpen(true)}
          secondaryCtaText={hero.secondaryCta?.label}
          secondaryCtaHref={hero.secondaryCta?.url}
          variant="image"
          backgroundImage={heroImage}
        />

        {/* ABOUT US */}
        {sections?.[0]?.type === "aboutIntro" && (
          <AboutIntroSection section={sections[0]} />
        )}

        {/* WHO ATTENDS */}
        {sections?.[1]?.type === "whoAttends" && <WhoAttendsSection />}

        {/* UPCOMING EVENTS */}
        {sections?.[2]?.type === "upcomingEventsIntro" && (
          <EventsSection onRegisterClick={() => setIsFormOpen(true)} />
        )}

        {/* TESTIMONIALS */}
        {sections?.[3]?.type === "testimonials" && <TestimonialsSection />}

        {/* PARTNERS */}
        {sections?.[4]?.type === "partners" && (
          <PartnersSection section={sections[4]} />
        )}

        {/* JOIN THE COMMUNITY */}
        {sections?.[5]?.type === "joinCommunity" && (
          <JoinCommunitySection
            section={sections[5]}
            onRegisterClick={() => setIsFormOpen(true)}
          />
        )}

        {/* NEW HERE? */}
        {sections?.[6]?.type === "newHere" && (
          <NewHereSection
            section={sections[6]}
            onRegisterClick={() => setIsFormOpen(true)}
          />
        )}

        {/* FOR BRANDS & PARTNERS */}
        {sections?.[7]?.type === "forBrands" && (
          <ForBrandsSection section={sections[7]} />
        )}

        {/* FAQ (still static / separate JSON) */}
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
