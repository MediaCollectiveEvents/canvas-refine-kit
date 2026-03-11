// src/pages/Home.tsx
import { useState } from "react";
import { Helmet } from "react-helmet-async";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";
import EventRegistrationForm from "@/components/EventRegistrationForm";

import HomepageRenderer from "@/components/sections/HomepageRenderer";

import homepageContent from "@/content/homepage.json";

const Home = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { hero, sections } = homepageContent as any;

  const handleOpenRegister = () => setIsFormOpen(true);

  return (
    <div className="min-h-screen">
      {/* --------------------------- */}
      {/* SEO TAGS FOR HOMEPAGE      */}
      {/* --------------------------- */}
      <Helmet>
        <title>
          The Media Collective — Curated Events for Media, Broadcast & Tech Leaders
        </title>

        <meta
          name="description"
          content="Exclusive, invite-only gatherings connecting senior leaders across media, broadcast, streaming and technology. Explore events curated to spark meaningful industry conversations."
        />

        {/* ---- Open Graph (social sharing) ---- */}
        <meta
          property="og:title"
          content="The Media Collective — Curated Events for Media & Tech Leaders"
        />
        <meta
          property="og:description"
          content="Exclusive events for senior professionals across broadcast, streaming and media technology."
        />
        <meta property="og:image" content="/og-default.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://themediacollective.co/" />

        {/* ---- Twitter Card ---- */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="The Media Collective" />
        <meta
          name="twitter:description"
          content="Invite-only gatherings connecting leaders across media, broadcast and streaming."
        />
        <meta name="twitter:image" content="/og-default.jpg" />

        {/* ---- Canonical URL ---- */}
        <link rel="canonical" href="https://themediacollective.co/" />
      </Helmet>

      <Header />

      <EventRegistrationForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />

      {/* FULL-WIDTH HERO */}
      <div className="w-full bg-[#0b111a]">
        <main className="pt-[160px] sm:pt-[180px] lg:pt-[200px]">
          <PageHero
            eyebrow={hero?.subtitle}
            title={hero?.title}
            description={hero?.description}
            primaryCtaText={hero?.cta?.label}
            onPrimaryClick={hero?.cta?.label ? handleOpenRegister : undefined}
            image={hero?.image}
            theme={hero?.theme ?? "dark"}
            overlayStrength={hero?.overlayStrength ?? 0.5}
            mobileCrop={hero?.mobileCrop}
            imagePosition={hero?.imagePosition}
            imageOffset={hero?.imageOffset}
          />
        </main>
      </div>

      {/* PAGE CONTENT */}
      <div className="w-full bg-[#f7f7f7]">
        <HomepageRenderer
          sections={sections}
          onRegister={handleOpenRegister}
        />
      </div>

      <Footer />
    </div>
  );
};

export default Home;