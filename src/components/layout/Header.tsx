import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import EventRegistrationForm from "@/components/EventRegistrationForm";

import settings from "@/content/settings.json";

type RawNavItem = {
  label: string;
  type?: string;
  href?: string;
  url?: string;
} & Record<string, any>;

interface SettingsFile {
  nav?: RawNavItem[];
  [key: string]: any;
}

const typedSettings = settings as SettingsFile;

function resolveHref(item: RawNavItem): string {
  if (item.href) return item.href;
  if (item.url) return item.url;

  const map: Record<string, string> = {
    home: "/",
    about: "/about",
    events: "/events",
    partners: "/partners",
    blog: "/blog",
    faq: "/faq",
    sponsors: "/sponsors",
  };
  return map[item.type ?? "home"] ?? "/";
}

const fallbackNavItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Partners", href: "/partners" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const navItems = typedSettings.nav?.length
    ? typedSettings.nav.map((i) => ({ label: i.label, href: resolveHref(i) }))
    : fallbackNavItems;

  return (
    <>
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      {/* Tall, fixed header with neon line */}
      <header
        className="
          fixed top-0 left-0 right-0 z-50
          bg-muted/95 backdrop-blur-sm
          h-32 sm:h-40 lg:h-48 xl:h-56
        "
      >
        {/* Neon edge line */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-cyan-400 to-primary" />

        <div className="relative h-full">
          <div
            className="
              container mx-auto px-8 lg:px-10
              h-full flex items-center
            "
          >
            {/* Logo (unchanged) */}
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="The Media Collective"
                className="h-16 sm:h-20 lg:h-24 xl:h-28 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation – centered, wider spacing, bigger text */}
            <nav
              className="
                hidden md:flex flex-1 justify-center
                items-center
                gap-8 lg:gap-10
              "
            >
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="
                    text-muted-foreground font-body
                    text-base lg:text-lg
                    uppercase tracking-[0.2em]
                    leading-none py-1
                    hover:text-primary transition-colors duration-200
                  "
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* CTA (unchanged) */}
            <div className="hidden md:flex justify-end">
              <Button
                onClick={() => setIsFormOpen(true)}
                className="
                  bg-primary text-primary-foreground 
                  font-body uppercase tracking-wider text-sm
                  px-6 py-3
                  hover:bg-primary/90 hover:scale-[1.03]
                  shadow-md shadow-primary/30 transition-transform
                "
              >
                Contact Us
              </Button>
            </div>

            {/* Mobile toggle (unchanged) */}
            <button
              className="md:hidden text-foreground ml-auto"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation (unchanged) */}
          {isMenuOpen && (
            <nav className="md:hidden absolute left-0 right-0 top-full bg-muted/95 border-t border-border">
              <div className="container mx-auto px-8 py-4">
                <div className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="
                        text-muted-foreground hover:text-primary
                        font-body text-base
                        uppercase tracking-wider py-2
                      "
                    >
                      {item.label}
                    </Link>
                  ))}

                  <Button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsFormOpen(true);
                    }}
                    className="
                      bg-primary text-primary-foreground 
                      mt-2 hover:bg-primary/90 hover:scale-[1.03]
                      shadow-md shadow-primary/30 transition-transform
                      font-body uppercase tracking-wider
                      text-base py-3
                    "
                  >
                    Contact Us
                  </Button>
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
