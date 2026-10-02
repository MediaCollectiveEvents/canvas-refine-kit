import { useState } from "react";
import { Helmet } from "react-helmet-async";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";
import { Button } from "@/components/ui/button";
import EventRegistrationForm from "@/components/EventRegistrationForm";

import HomepageRenderer from "@/components/sections/HomepageRenderer";

import homepageContent from "@/content/homepage.json";

const Home = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { sections, seo } = homepageContent;
  const hero: typeof homepageContent.hero & { eyebrow?: string } = homepageContent.hero;

  const handleOpenRegister = () => setIsFormOpen(true);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{seo.title}</title>

        <meta
          name="description"
          content={seo.description}
        />

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

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="The Media Collective" />
        <meta
          name="twitter:description"
          content="Invite-only gatherings connecting leaders across media, broadcast and streaming."
        />
        <meta name="twitter:image" content="/og-default.jpg" />

        <link rel="canonical" href="https://themediacollective.co/" />
      </Helmet>

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
            secondaryCtaText={hero?.secondaryCta?.label}
            secondaryCtaHref={
              hero?.secondaryCta?.url === "/register"
                ? undefined
                : hero?.secondaryCta?.url
            }
            onSecondaryClick={
              hero?.secondaryCta?.url === "/register"
                ? handleOpenRegister
                : undefined
            }
            image={hero?.image}
          />

      <div className="w-full">
        <HomepageRenderer
          sections={sections}
          onRegister={handleOpenRegister}
        />
      </div>
      <section className="border-t border-white/15 bg-[#101d24] px-5 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[#9bd3c8]">For media and technology brands</p>
            <h2 className="font-display text-3xl font-light leading-tight md:text-4xl">Find your place in the conversation.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300">Explore co-hosting, sponsorship and custom events. Compare the formats and find a partnership that fits your business.</p>
          </div>
          <Button asChild variant="brand" size="lg"><a href="/partners">Explore partnerships <span aria-hidden="true">→</span></a></Button>
        </div>
      </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;