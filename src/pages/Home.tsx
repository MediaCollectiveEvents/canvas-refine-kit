import { useState } from "react";
import Seo from "@/components/shared/Seo";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import EventRegistrationForm from "@/components/EventRegistrationForm";

import HomepageRenderer, { type HomepageSection } from "@/components/sections/HomepageRenderer";

import homepageContent from "@/content/homepage.json";

const Home = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { sections, seo } = homepageContent;
  const hero: typeof homepageContent.hero & { eyebrow?: string } = homepageContent.hero;

  const handleOpenRegister = () => setIsFormOpen(true);

  return (
    <div className="min-h-screen">
      <Seo title={seo.title} description={seo.description} ogImage={seo.ogImage} />

      <Header />

      <EventRegistrationForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />

      <main className="pt-[92px] lg:pt-[100px]">
        <header className="site-gutter relative flex w-full min-h-[681px] items-center justify-center overflow-hidden bg-transparent pt-8 pb-16 sm:min-h-[560px] lg:min-h-[660px]">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-no-repeat bg-[position:center_bottom]"
            style={{ backgroundImage: `url(${hero.image})` }}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#101d24]/95 via-[#101d24]/60 to-transparent" />
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 site-container py-12 text-left"
          >
            <p className="mb-7 flex items-center gap-4 site-eyebrow text-[#9bd3c8]">
              <span aria-hidden="true" className="h-px w-10 bg-current" />
              {hero.eyebrow ?? hero.subtitle}
            </p>
            <h1 className="mb-5 max-w-[10em] font-display text-[2.75rem] md:text-[3.625rem] xl:text-[4.375rem] leading-[1.06] tracking-[-0.035em] text-[#f7f3eb] font-light">
              {hero.title}
            </h1>
            <p className="mb-10 max-w-[52ch] text-balance text-base md:text-lg leading-[1.8] text-slate-200">
              {hero.description}
            </p>
            <div className="flex max-w-2xl flex-col items-start gap-4 sm:flex-row">
              <Button
                size="lg"
                variant="brand"
                asChild={hero.primaryCta.url !== "/register"}
                onClick={hero.primaryCta.url === "/register" ? handleOpenRegister : undefined}
                className="w-full sm:w-[210px]"
              >
                {hero.primaryCta.url === "/register" ? hero.primaryCta.label : <a href={hero.primaryCta.url}>{hero.primaryCta.label}</a>}
              </Button>
              <Button size="lg" variant="brand" asChild className="w-full sm:w-[210px]">
                <a href={hero.secondaryCta.url}>{hero.secondaryCta.label}</a>
              </Button>
            </div>
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
