import { motion, useMotionValue, useTransform, useAnimationFrame } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Eye, Mic, Star } from "lucide-react";

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
const sponsorshipTiers = [{
  name: "Co-Host",
  description: "Partner with us to co-create and co-brand an event",
  features: ["Joint branding on all event materials", "Co-curated agenda and speakers", "Shared hosting responsibilities", "Full access to guest list", "Joint marketing campaign", "Post-event content collaboration"],
  highlighted: false
}, {
  name: "Sponsor",
  description: "Support our events with prominent brand visibility",
  features: ["Logo placement at events", "Speaking or panel opportunity", "VIP guest allocation", "Featured in marketing materials", "Social media promotion", "Networking access"],
  highlighted: true
}, {
  name: "Custom Event",
  description: "Commission a bespoke event tailored to your goals",
  features: ["Fully customised event format", "Exclusive guest curation", "Your choice of venue", "Dedicated event management", "Branded experience throughout", "Complete creative control"],
  highlighted: false
}];
const benefits = [{
  icon: Users,
  title: "Targeted Audience",
  description: "Connect directly with senior media executives and decision-makers from leading broadcasters, studios, and technology companies."
}, {
  icon: Eye,
  title: "Brand Visibility",
  description: "Gain prominent exposure across our events, digital channels, and communications reaching thousands of industry professionals."
}, {
  icon: Mic,
  title: "Thought Leadership",
  description: "Position your brand as an industry leader through speaking opportunities, panel discussions, and curated content."
}, {
  icon: Star,
  title: "Exclusive Access",
  description: "Enjoy priority access to our network of media executives and bespoke opportunities tailored to your business objectives."
}];
const currentSponsors = [{
  name: "BroadView Software",
  logo: broadviewSoftwareLogo
}, {
  name: "Convergent IDS",
  logo: convergentIdsLogo
}, {
  name: "DCe Agency",
  logo: dceAgencyLogo
}, {
  name: "Giant Worldwide",
  logo: giantWorldwideLogo
}, {
  name: "Invenio LSI",
  logo: invenioLsiLogo
}, {
  name: "LucidLink",
  logo: lucidlinkLogo
}, {
  name: "Matrix",
  logo: matrixLogo
}, {
  name: "Mr MXF",
  logo: mrMxfLogo
}, {
  name: "Rarecrew",
  logo: rarecrewLogo
}, {
  name: "RSG Media",
  logo: rsgMediaLogo
}, {
  name: "UHD Alliance",
  logo: uhdAllianceLogo
}, {
  name: "UIC Digital",
  logo: uicDigitalLogo
}, {
  name: "UTO Solutions",
  logo: utoSolutionsLogo
}, {
  name: "Wagada Digital",
  logo: wagadaDigitalLogo
}];

// Logo card component with center-based fade effect
const SponsorLogo = ({
  sponsor,
  containerRef
}: {
  sponsor: {
    name: string;
    logo: string;
  };
  containerRef: React.RefObject<HTMLDivElement>;
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({
    opacity: 0.4,
    y: 15
  });
  useAnimationFrame(() => {
    if (!elementRef.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const elementRect = elementRef.current.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    const elementCenter = elementRect.left + elementRect.width / 2;
    const distanceFromCenter = Math.abs(containerCenter - elementCenter);
    const maxDistance = containerRect.width / 2;

    // Calculate opacity and translateY based on distance from center
    const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
    const opacity = 1 - normalizedDistance * 0.6; // Range: 0.4 to 1
    const y = normalizedDistance * 15; // Range: 0 to 15px

    setStyle({
      opacity,
      y
    });
  });
  return <div ref={elementRef} className="flex-shrink-0 mx-4 flex items-center justify-center">
      <motion.div className="w-auto h-44 bg-white backdrop-blur-sm rounded-lg border border-border flex items-center justify-center px-14 py-6 hover:border-primary/50 transition-colors" style={{
      opacity: style.opacity,
      y: style.y
    }}>
        <img src={sponsor.logo} alt={sponsor.name} className="h-28 w-auto object-contain" />
      </motion.div>
    </div>;
};
const Sponsors = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  return <div className="min-h-screen bg-background">
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />
      <Header />

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 bg-primary">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }} className="text-center">
            <p className="text-primary-foreground/80 font-body text-sm uppercase tracking-widest mb-6">
              Partnership Opportunities
            </p>
            <h1 className="font-script text-6xl md:text-8xl text-white mb-6">
              Become a Sponsor
            </h1>
            <p className="text-primary-foreground/80 font-body text-lg max-w-2xl mx-auto">
              Partner with The Media Collective and connect your brand with the
              most influential voices in media and entertainment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Scrolling Sponsor Logos */}
      <section className="py-16 bg-muted overflow-hidden">
        <div className="container mx-auto max-w-6xl mb-12">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} viewport={{
          once: true
        }} className="text-center">
            <h2 className="font-display text-3xl md:text-4xl">
              Our events are made possible by the support of <span className="text-primary italic">these companies</span>
            </h2>
          </motion.div>
        </div>
        
        <div className="relative" ref={carouselRef}>
          {/* Scrolling container */}
          <div className="flex animate-scroll py-4">
            {/* First set of logos */}
            {[...currentSponsors, ...currentSponsors].map((sponsor, index) => <SponsorLogo key={`${sponsor.name}-${index}`} sponsor={sponsor} containerRef={carouselRef} />)}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} viewport={{
          once: true
        }} className="text-center mb-16">
            <p className="text-primary font-body text-sm uppercase tracking-[0.3em] mb-4">
              Why Partner With Us
            </p>
            <h2 className="font-display text-4xl md:text-5xl">
              Sponsorship <span className="text-primary italic">Benefits</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => <motion.div key={benefit.title} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: index * 0.1
          }} viewport={{
            once: true
          }} className="text-center">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-xl mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} viewport={{
          once: true
        }} className="text-center mb-16">
            
            <h2 className="font-display text-4xl md:text-5xl">
              Sponsorship <span className="text-primary italic">Packages</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {sponsorshipTiers.map((tier, index) => <motion.div key={tier.name} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: index * 0.1
          }} viewport={{
            once: true
          }} className={`rounded-2xl p-8 ${tier.highlighted ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-background border border-border"}`}>
                <div className="text-center mb-8">
                  <h3 className={`font-display text-2xl mb-4 ${tier.highlighted ? "text-white" : ""}`}>
                    {tier.name}
                  </h3>
                  <p className={`font-body text-sm ${tier.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {tier.description}
                  </p>
                </div>

                <ul className="space-y-4">
                  {tier.features.map(feature => <li key={feature} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${tier.highlighted ? "bg-white/20" : "bg-primary/10"}`}>
                        <svg className={`w-3 h-3 ${tier.highlighted ? "text-white" : "text-primary"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className={`font-body text-sm ${tier.highlighted ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                        {feature}
                      </span>
                    </li>)}
                </ul>
              </motion.div>)}
          </div>

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.3
        }} viewport={{
          once: true
        }} className="text-center mt-12">
            <Button size="lg" className="font-body uppercase tracking-wider text-sm bg-primary text-primary-foreground hover:bg-primary/90">
              Book a Meeting
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }} viewport={{
          once: true
        }}>
            <h2 className="font-script text-4xl md:text-5xl text-foreground mb-6">
              Ready to partner with us?
            </h2>
            <p className="text-muted-foreground font-body text-lg mb-8 max-w-xl mx-auto">
              Contact us to discuss a bespoke sponsorship package tailored to
              your brand's objectives and budget.
            </p>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-full font-body uppercase tracking-wider text-sm hover:bg-primary/90 transition-colors"
            >
              Register Interest
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Sponsors;