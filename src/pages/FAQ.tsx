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
      <Header />

      <main>
        {/* Hero controlled by faqPage.json */}
        <PageHero {...hero} />

        {/* Sections + FAQ accordion driven by JSON */}
        <FaqPageRenderer
          sections={sections}
          faqs={faqData}
          onCtaClick={() => setIsFormOpen(true)}
        />

        {/* 
          If you later add a contact / question form modal,
          you can control it with isFormOpen here.
        */}
      </main>

      <Footer />
    </div>
  );
}
