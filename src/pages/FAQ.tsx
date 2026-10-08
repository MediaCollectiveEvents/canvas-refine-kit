import Seo from "@/components/shared/Seo";
import ContactForm from "@/components/ContactForm";
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
      <ContactForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      <main className="site-header-clearance">
        <PageHero {...(hero as ComponentProps<typeof PageHero>)} presentation="business" editorialCoherence />

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
