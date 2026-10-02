import { useState } from "react";
import Seo from "@/components/shared/Seo";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";
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

      <main className="pt-[88px] sm:pt-[96px] lg:pt-[104px]">
          <PageHero
            presentation="editorial"
            eyebrow={hero?.eyebrow ?? hero?.subtitle}
            title={hero?.title}
            description={hero?.description}
            primaryCtaText={hero?.primaryCta?.label}
            primaryCtaHref={
              hero?.primaryCta?.url === "/register"
                ? undefined
                : hero?.primaryCta?.url
            }
            onPrimaryClick={
              hero?.primaryCta?.url === "/register"
                ? handleOpenRegister
                : undefined
            }
            image={hero?.image}
          />

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