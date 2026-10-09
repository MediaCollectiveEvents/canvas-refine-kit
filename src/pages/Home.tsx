import { heroBackground } from "@/lib/heroImages";
import { useState } from "react";
import Seo from "@/components/shared/Seo";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion, useReducedMotion } from "framer-motion";
import EventRegistrationForm from "@/components/EventRegistrationForm";

import HomepageRenderer, { type HomepageSection } from "@/components/sections/HomepageRenderer";

import homepageContent from "@/content/homepage.json";
import MobileHeroArtwork from "@/components/shared/MobileHeroArtwork";

const Home = ({ content = homepageContent }: { content?: typeof homepageContent }) => {
  const reducedMotion = useReducedMotion();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { sections, seo } = content;
  const hero: typeof homepageContent.hero & { eyebrow?: string } = content.hero;

  const handleOpenRegister = () => setIsFormOpen(true);

  return (
    <div className="min-h-screen">
      <Seo title={seo.title} description={seo.description} ogImage={seo.ogImage} />

      <Header />

      <EventRegistrationForm attendanceOnly
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />

      <main className="site-header-clearance">
        <header className="site-gutter relative flex w-full min-h-0 items-start sm:items-center justify-center overflow-hidden bg-[#101d24] pt-8 pb-[90vw] sm:pb-16 sm:min-h-[560px] lg:min-h-[660px]">
          <div
            aria-hidden="true"
            className="absolute inset-0 hidden bg-cover bg-no-repeat bg-[position:center_bottom] sm:block"
            style={{ backgroundImage: heroBackground(hero.image) }}
          />
          <MobileHeroArtwork />
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.6 }}
            className="relative z-10 site-container py-4 sm:py-12 text-left"
          >
            <p className="mb-7 flex items-center gap-4 site-eyebrow text-[#9bd3c8]">
              <span aria-hidden="true" className="h-px w-10 bg-current" />
              {hero.eyebrow ?? hero.subtitle}
            </p>
            <h1 className="mb-5 max-w-[10em] font-display text-[2.75rem] md:text-[3.625rem] xl:text-[4.375rem] leading-[1.06] tracking-[-0.035em] text-[#f7f3eb] font-light">
              {hero.title}
            </h1>
            <p className="mb-0 sm:mb-10 max-w-[52ch] font-display text-balance text-base uppercase tracking-[0.08em] leading-[1.8] text-[#9bd3c8]">
              {hero.description}
            </p>
          </motion.div>
        </header>

      <div className="w-full">
        <HomepageRenderer
          sections={sections as HomepageSection[]}
          onRegister={handleOpenRegister}
        />
      </div>

      </main>

      <Footer />
    </div>
  );
};

export default Home;
