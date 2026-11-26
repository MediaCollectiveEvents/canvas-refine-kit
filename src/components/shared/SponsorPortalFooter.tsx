import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function SponsorPortalFooter({compact=false}:{compact?:boolean}) {
  return <>
    {!compact&&<section className="site-gutter border-t border-white/10 bg-[#101d24]">
      <div className="site-container py-14 md:py-20">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-primary">Your next partnership</p>
        <h2 className="mt-4 max-w-3xl font-display text-3xl font-light leading-tight md:text-4xl">Secure your sponsorship slot for our next event.</h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">Continue the conversation with The Media Collective. Get in touch with us to discuss upcoming events and sponsorship opportunities.</p>
        <Button asChild variant="brand" size="lg" className="mt-7"><a href="https://calendly.com/mediacollective/call-with-chris" target="_blank" rel="noopener noreferrer">Book a call</a></Button>
      </div>
    </section>}
    <Footer hideAttendanceCTA />
  </>;
}
