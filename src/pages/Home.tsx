import { homeSeo } from "@/lib/pageSeo";
import { useState } from "react";
import Seo from "@/components/shared/Seo";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EventRegistrationForm from "@/components/EventRegistrationForm";

import HomepageRenderer, { type HomepageSection } from "@/components/sections/HomepageRenderer";

import homepageContent from "@/content/homepage.json";
import PageHero from "@/components/shared/PageHero";

const Home = ({ content = homepageContent }: { content?: typeof homepageContent }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { sections } = content;
  const hero: typeof homepageContent.hero & { eyebrow?: string } = content.hero;

  const handleOpenRegister = () => setIsFormOpen(true);

  return (
    <div className="min-h-screen">
      <Seo {...homeSeo(content)} />

      <Header />

      <EventRegistrationForm attendanceOnly
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />

      <main className="site-header-clearance">
        <PageHero presentation="public" identity eyebrow={hero.eyebrow ?? hero.subtitle}
          title={hero.title} description={hero.description} image={hero.image} />

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
