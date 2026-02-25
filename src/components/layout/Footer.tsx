import { useState, FormEvent } from "react";
import { Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png"; // or ../../assets/logo.png

export default function Footer() {
  const [email, setEmail] = useState("");

  const navLinks = [
    { label: "About", href: "/about" },
    { label: "Events", href: "/events" },
    { label: "Partners", href: "/partners" },
    { label: "Blog", href: "/blog" },
  ];

  const eventLinks = [
    { label: "IBC Breakfast", href: "/events" },
    { label: "MPTS Networking Reception", href: "/events" },
    { label: "NAB Show Events", href: "/events" },
  ];

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    // TODO: Replace with provider endpoint (Kit/beehiiv/Brevo) via /api/subscribe
    console.log("Newsletter:", email);
    setEmail("");
  };

  return (
    <footer
      id="contact"
      className="
        relative
        bg-gradient-to-b from-gray-900/70 via-gray-900/55 to-gray-900/40
        backdrop-blur-2xl
        pt-22 md:pt-24 pb-14
        overflow-hidden
      "
    >
      {/* Neon top strip (attach to footer, remove any extra top borders elsewhere) */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-primary via-[hsl(var(--icon-cyan))] to-primary" />

      <div className="container mx-auto px-6 lg:px-10">
        {/* Row 1 — Brand | Newsletter (centered) | Connect */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 items-start">
          {/* Brand (left) */}
          <div className="flex lg:block items-center justify-center lg:justify-start">
            <div>
              <Link to="/" className="inline-block mb-4">
                <img
                  src={logo}
                  alt="The Media Collective"
                  className="h-16 w-auto opacity-90"
                />
              </Link>
              <p className="text-white/60 font-body text-sm leading-relaxed max-w-sm">
                Curated events connecting media, entertainment, and technology
                leaders.
              </p>
            </div>
          </div>

          {/* Newsletter (center, focal point) */}
          <div className="flex justify-center">
            <div className="w-full max-w-xl text-center">
              <h4 className="text-white font-semibold tracking-wide mb-3">
                Stay in the loop
              </h4>
              <p className="text-white/60 text-sm mb-5">
                Get occasional updates about new events, speakers, and partner
                opportunities.
              </p>

              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-3"
                aria-label="Newsletter signup"
              >
                <label htmlFor="footer-email" className="sr-only">
                  Your email address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="
                    w-full rounded-md
                    bg-white/5 text-white placeholder-white/50
                    border border-white/10 focus:border-cyan-400/60 focus:ring-0
                    px-4 py-3 outline-none transition
                  "
                />
                <button
                  type="submit"
                  className="
                    whitespace-nowrap rounded-md
                    bg-gradient-to-r from-primary via-[hsl(var(--icon-cyan))] to-primary
                    text-black font-medium px-5 py-3
                    hover:brightness-110 transition
                    shadow-[0_0_16px_rgba(34,211,238,0.18)]
                  "
                >
                  Subscribe
                </button>
              </form>

              <p className="text-white/40 text-xs mt-3">
                No spam. Unsubscribe any time.
              </p>
            </div>
          </div>

          {/* Connect (right) */}
          <div className="flex lg:block items-center justify-center lg:justify-end">
            <div className="text-center lg:text-right">
              <h4 className="text-white font-semibold tracking-wide mb-4">
                Connect With Us
              </h4>
              <div className="flex lg:justify-end justify-center gap-3 mb-4">
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="
                    w-10 h-10 rounded-full
                    border border-white/15
                    flex items-center justify-center
                    text-white/70 hover:text-white hover:border-white/40
                    transition-colors
                  "
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
              <p className="text-white/60 font-body text-sm">
                Follow us for industry insights and event updates.
              </p>
            </div>
          </div>
        </div>

        {/* Single divider between main and links */}
        <div className="mt-12 pt-8 border-t border-white/10" />

        {/* Row 2 — Links: Navigate | Events */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Navigate */}
          <div className="text-center md:text-left">
            <h5 className="text-white font-semibold tracking-wide mb-4">
              Navigate
            </h5>
            <ul className="space-y-3">
              {[
                { label: "About", href: "/about" },
                { label: "Events", href: "/events" },
                { label: "Partners", href: "/partners" },
                { label: "Blog", href: "/blog" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-white transition-colors font-body text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Events */}
          <div className="text-center md:text-left">
            <h5 className="text-white font-semibold tracking-wide mb-4">
              Events
            </h5>
            <ul className="space-y-3">
              {[
                { label: "IBC Breakfast", href: "/events" },
                { label: "MPTS Networking Reception", href: "/events" },
                { label: "NAB Show Events", href: "/events" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-white/70 hover:text-white transition-colors font-body text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legal — centered, minimal, no copyright */}
        <div className="mt-10 flex justify-center gap-6">
          <Link
            to="/privacy"
            className="text-white/60 hover:text-white transition-colors font-body text-sm"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="text-white/60 hover:text-white transition-colors font-body text-sm"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
