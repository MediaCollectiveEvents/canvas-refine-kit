import { Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

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

  const socialLinks = [{ icon: Linkedin, href: "#", label: "LinkedIn" }];

  return (
    <footer id="contact" className="bg-muted border-t border-border">
      {/* Decorative accent line */}
      <div className="h-1 bg-gradient-to-r from-primary via-[hsl(var(--icon-cyan))] to-primary" />

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Logo & Tagline */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img
                src={logo}
                alt="The Media Collective"
                className="h-16 w-auto"
              />
            </Link>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              Curated events connecting media, entertainment, and technology
              leaders.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-lg mb-4 text-foreground">
              Navigate
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors font-body text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Events */}
          <div>
            <h4 className="font-display text-lg mb-4 text-foreground">
              Events
            </h4>
            <ul className="space-y-3">
              {eventLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors font-body text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-display text-lg mb-4 text-foreground">
              Connect With Us
            </h4>
            <div className="flex gap-3 mb-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
            <p className="text-muted-foreground font-body text-sm">
              Follow us for industry insights and event updates.
            </p>
          </div>
        </div>

        {/* Bottom bar (copyright removed) */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Removed copyright */}

          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="text-muted-foreground hover:text-primary transition-colors font-body text-sm"
            >
              Privacy Policy
            </Link>
            <a
              href="/terms"
              className="text-muted-foreground hover:text-primary transition-colors font-body text-sm"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
