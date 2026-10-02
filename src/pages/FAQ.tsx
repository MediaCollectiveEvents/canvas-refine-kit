import Seo from "@/components/shared/Seo";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import { useState, type ComponentProps } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";

import faqPageData from "@/content/faqPage.json";
import faqData from "@/content/faq.json";

import FaqPageRenderer from "@/components/sections/FaqPageRenderer";

export default function FAQ() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { hero, sections } = faqPageData;

  return (
    <div className="min-h-screen bg-background">
      {/* FIXED HEADER */}
      <Seo title={`${hero.title} — The Media Collective`} description={hero.description} />
      <Header />
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      {/*
        IMPORTANT:
        The header is tall (logo + CTA + padding + neon line).
        This padding MUST match that height so the hero starts BELOW it.

        These values are stable across breakpoints:
        - 160px on mobile
        - 180px on tablets
        - 200px on desktop
      */}
      <main className="pt-[160px] sm:pt-[180px] lg:pt-[200px]">
        {/* HERO (uses PageHero + mobileCrop) */}
        <PageHero {...(hero as ComponentProps<typeof PageHero>)} />

        {/* FAQ Sections */}
        <FaqPageRenderer
          sections={sections as ComponentProps<typeof FaqPageRenderer>["sections"]}
          faqs={faqData}
          onCtaClick={() => setIsFormOpen(true)}
        />
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
