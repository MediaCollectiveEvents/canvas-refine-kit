
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Eye, Mic, Star } from "lucide-react";

// ✅ Corrected Sponsor Logo Imports
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

// ✅ New sponsor logos
import realitechLogo from "@/assets/sponsors/realitech.png";
import modulaMediaLogo from "@/assets/sponsors/modula-media.png";
import zilleLogo from "@/assets/sponsors/zille.png";
import mdmLogo from "@/assets/sponsors/mdm.png";
import testronicLogo from "@/assets/sponsors/testronic.png";
import fooEngineLogo from "@/assets/sponsors/foo.png"; // corrected
import rightslineLogo from "@/assets/sponsors/rightsline.png";
import fabricLogo from "@/assets/sponsors/fabric.png";

// ✅ Sponsor Data
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

  // ✅ New sponsors
  { name: "Realitech", logo: realitechLogo },
  { name: "Modula Media", logo: modulaMediaLogo },
  { name: "Zille", logo: zilleLogo },
  { name: "Markham Digital Media", logo: mdmLogo },
  { name: "Testronic", logo: testronicLogo },
  { name: "Foo Engine", logo: fooEngineLogo },
  { name: "Rightsline", logo: rightslineLogo },
  { name: "Fabric", logo: fabricLogo }
];

// ✅ Logo Component
const SponsorLogo = ({ sponsor }: { sponsor: { name: string; logo: string } }) => {
  return (
    <div className="flex-shrink-0 mx-4 flex items-center justify-center">
      <motion.div
        className="w-auto h-56 md:h-64 bg-white backdrop-blur-sm rounded-lg border border-border flex items-center justify-center px-16 py-8 hover:border-primary/50 transition-colors"
      >
        <img src={sponsor.logo} alt={sponsor.name} className="h-36 md:h-44 w-auto object-contain" />
      </motion.div>
    </div>
  );
};

const Sponsors = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />
      <Header />

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 bg-primary">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-primary-foreground/80 font-body text-sm uppercase tracking-widest mb-6">
              Partnership Opportunities
            </p>
            <h1 className="font-script text-6xl md:text-8xl text-white mb-6">Become a Sponsor</h1>
            <p className="text-primary-foreground/80 font-body text-lg max-w-2xl mx-auto">
              Partner with The Media Collective and connect your brand with the most influential voices in media and entertainment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Auto-Scrolling Sponsor Logos with Manual Arrows */}
      <section className="py-16 bg-muted overflow-hidden">
        <div className="container mx-auto max-w-6xl mb-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl md:text-4xl">
              Our events are made possible by the support of <span className="text-primary italic">these companies</span>
            </h2>
          </motion.div>
        </div>

        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-primary text-white p-3 rounded-full shadow hover:bg-primary/90 z-10"
          >
            ◀
          </button>

          {/* Auto-scroll container */}
          <div className="overflow-x-auto scrollbar-hide" ref={carouselRef}>
            <div className="flex animate-scroll gap-8 py-6 w-max">
              {[...currentSponsors, ...currentSponsors].map((sponsor, index) => (
                <SponsorLogo key={`${sponsor.name}-${index}`} sponsor={sponsor} />
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-primary text-white p-3 rounded-full shadow hover:bg-primary/90 z-10"
          >
            ▶
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Sponsors;
