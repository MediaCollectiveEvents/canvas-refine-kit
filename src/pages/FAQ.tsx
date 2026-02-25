import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";

import faqPageData from "@/content/faqPage.json";
import faqData from "@/content/faq.json";

import FaqPageRenderer from "@/components/sections/FaqPageRenderer";

export default function FAQ() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { hero, sections } = faqPageData as {
    hero: any;
    sections: any[];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* FIXED HEADER */}
      <Header />

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
        <PageHero {...hero} />

        {/* FAQ Sections */}
        <FaqPageRenderer
          sections={sections}
          faqs={faqData}
          onCtaClick={() => setIsFormOpen(true)}
        />
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
