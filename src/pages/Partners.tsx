import React, { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Eye, Mic } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import SectionDivider from "@/components/shared/SectionDivider";
import SectionHeader from "@/components/shared/SectionHeader";
import PageCTA from "@/components/shared/PageCTA";
import heroImage from "@/assets/hero-placeholder.jpg";

// Sponsor logo imports
import giantWorldwideLogo from "@/assets/sponsors/giant-worldwide.png";
import mrMxfLogo from "@/assets/sponsors/mr-mxf.png";
import invenioLsiLogo from "@/assets/sponsors/invenio-lsi.png";
import matrixLogo from "@/assets/sponsors/matrix.png";
import lucidlinkLogo from "@/assets/sponsors/lucidlink.png";
import utoSolutionsLogo from "@/assets/sponsors/uto-solutions.png";
import broadviewSoftwareLogo from "@/assets/sponsors/broadview-software.png";
import convergentIdsLogo from "@/assets/sponsors/convergent-ids.png";
import wagadaDigitalLogo from "@/assets/sponsors/wagada-digital.png";
import uhdAllianceLogo from "@/assets/sponsors/uhd-alliance.png";
import rarecrewLogo from "@/assets/sponsors/rarecrew.png";
import dceAgencyLogo from "@/assets/sponsors/dce-agency.png";
import uicDigitalLogo from "@/assets/sponsors/uic-digital.png";
import rsgMediaLogo from "@/assets/sponsors/rsg-media.png";

const sponsorshipTiers = [
  {
    name: "Co-Host",
    description: "Partner with us to co-create and co-brand an event",
    features: [
      "Joint branding on all event materials",
      "Co-curated agenda and speakers",
      "Shared hosting responsibilities",
      "Full access to guest list",
      "Joint marketing campaign",
      "Post-event content collaboration",
    ],
    highlighted: false,
    accentColor: "lime" as const,
  },
  {
    name: "Sponsor",
    description: "Support our events with prominent brand visibility",
    features: [
      "Logo placement at events",
      "Speaking or panel opportunity",
      "VIP guest allocation",
      "Featured in marketing materials",
      "Social media promotion",
      "Networking access",
    ],
    highlighted: true,
    accentColor: "cyan" as const,
  },
  {
    name: "Custom Event",
    description: "Commission a bespoke event tailored to your goals",
    features: [
      "Fully customised event format",
      "Exclusive guest curation",
      "Your choice of venue",
      "Dedicated event management",
      "Branded experience throughout",
      "Complete creative control",
    ],
    highlighted: false,
    accentColor: "red" as const,
  },
];

const colorStyles = {
  lime: {
    card: "bg-background/20 border border-[hsl(var(--icon-lime)/0.3)] backdrop-blur-sm",
    check: "text-[hsl(var(--icon-lime))]",
    checkBg: "bg-[hsl(var(--icon-lime)/0.15)]",
    text: "text-foreground",
    description: "text-muted-foreground",
  },
  cyan: {
    // Balanced with lime & red – only the accent colour changes
    card: "bg-background/20 border border-[hsl(var(--icon-cyan)/0.3)] backdrop-blur-sm",
    check: "text-[hsl(var(--icon-cyan))]",
    checkBg: "bg-[hsl(var(--icon-cyan)/0.15)]",
    text: "text-foreground",
    description: "text-muted-foreground",
  },
  red: {
    card: "bg-background/20 border border-[hsl(var(--icon-red)/0.3)] backdrop-blur-sm",
    check: "text-[hsl(var(--icon-red))]",
    checkBg: "bg-[hsl(var(--icon-red)/0.15)]",
    text: "text-foreground",
    description: "text-muted-foreground",
  },
};

const benefits = [
  {
    icon: Users,
    title: "Targeted Audience",
    description:
      "Connect directly with senior media executives and decision-makers from leading broadcasters, studios, and technology companies.",
    color: "text-[hsl(var(--icon-lime))]",
    bgColor: "bg-[hsl(var(--icon-lime)/0.1)]",
  },
  {
    icon: Eye,
    title: "Brand Visibility",
    description:
      "Gain prominent exposure across our events, digital channels, and communications reaching thousands of industry professionals.",
    color: "text-[hsl(var(--icon-cyan))]",
    bgColor: "bg-[hsl(var(--icon-cyan)/0.1)]",
  },
  {
    icon: Mic,
    title: "Thought Leadership",
    description:
      "Position your brand as an industry leader through speaking opportunities, panel discussions, and curated content.",
    color: "text-[hsl(var(--icon-red))]",
    bgColor: "bg-[hsl(var(--icon-red)/0.1)]",
  },
];

const currentSponsors = [
  { name: "BroadView Software", logo: broadviewSoftwareLogo },
  { name: "Convergent IDS", logo: convergentIdsLogo },
  { name: "DCe Agency", logo: dceAgencyLogo },
  { name: "Giant Worldwide", logo: giantWorldwideLogo },
  { name: "Invenio LSI", logo: invenioLsiLogo },
  { name: "LucidLink", logo: lucidlinkLogo },
  { name: "Matrix", logo: matrixLogo },
  { name: "Mr MXF", logo: mrMxfLogo },
  { name: "Rarecrew", logo: rarecrewLogo },
  { name: "RSG Media", logo: rsgMediaLogo },
  { name: "UHD Alliance", logo: uhdAllianceLogo },
  { name: "UIC Digital", logo: uicDigitalLogo },
  { name: "UTO Solutions", logo: utoSolutionsLogo },
  { name: "Wagada Digital", logo: wagadaDigitalLogo },
];

// Logo card component
const SponsorLogo = ({
  sponsor,
}: {
  sponsor: {
    name: string;
    logo: string;
  };
}) => {
  return (
    <div className="flex-shrink-0 mx-4 flex items-center justify-center">
      <div className="w-auto h-44 bg-white backdrop-blur-sm rounded-lg border border-border flex items-center justify-center px-14 py-6 hover:border-primary/50 transition-colors">
        <img
          src={sponsor.logo}
          alt={sponsor.name}
          className="h-28 w-auto object-contain"
        />
      </div>
    </div>
  );
};

const Partners: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />
      <Header />

      {/* Hero Section */}
      <PageHero
        eyebrow="Partnership Opportunities"
        title="Become a Partner"
        description="Partner with The Media Collective and connect your brand with the most influential voices in media and entertainment."
        variant="image"
        backgroundImage={heroImage}
      />

      {/* Scrolling Sponsor Logos */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
        <div className="container mx-auto max-w-6xl mb-16 text-center">
          <SectionHeader
            title="Our events are made possible with the support of "
            accentWord="these companies"
          />
        </div>

        <div className="relative">
          <div className="flex animate-scroll py-4">
            {[...currentSponsors, ...currentSponsors].map((sponsor, index) => (
              <SponsorLogo key={`${sponsor.name}-${index}`} sponsor={sponsor} />
            ))}
          </div>
        </div>
      </section>

      {/* Decorative Divider */}
      <SectionDivider variant="single" />

      {/* Benefits Section */}
      <section className="py-24 md:py-32 px-6 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Why Partner With Us"
            title="Partnership "
            accentWord="Benefits"
          />

          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div
                  className={`w-16 h-16 rounded-full ${benefit.bgColor} flex items-center justify-center mb-6 mx-auto`}
                >
                  <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                </div>
                <h3 className="font-display text-xl mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Decorative Divider */}
      <SectionDivider variant="single" />

      {/* Sponsorship Tiers */}
      <section className="py-24 md:py-32 px-6 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <SectionHeader title="Partnership " accentWord="Packages" />

          <div className="grid md:grid-cols-3 gap-8">
            {sponsorshipTiers.map((tier, index) => {
              const styles = colorStyles[tier.accentColor];
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`rounded-2xl p-8 ${styles.card}`}
                >
                  <div className="text-center mb-8">
                    <h3 className={`font-display text-2xl mb-4 ${styles.text}`}>
                      {tier.name}
                    </h3>
                    <p className={`font-body text-sm ${styles.description}`}>
                      {tier.description}
                    </p>
                  </div>

                  <ul className="space-y-4">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${styles.checkBg}`}
                        >
                          <svg
                            className={`w-3 h-3 ${styles.check}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span
                          className={`font-body text-sm ${
                            tier.highlighted ? "font-semibold" : ""
                          } text-muted-foreground`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              size="lg"
              className="rounded-full font-body uppercase tracking-wider text-sm bg-primary text-primary-foreground hover:bg-primary/90 px-8"
            >
              Book a Meeting
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Decorative Divider */}
      <SectionDivider variant="triple" className="py-12" />

      {/* Shared CTA */}
      <PageCTA onClick={() => setIsFormOpen(true)} />

      <Footer />
    </div>
  );
};

export default Partners;
