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

  const lookup: Record<string, string> = {
    home: "/",
    about: "/about",
    events: "/events",
    partners: "/partners",
    blog: "/blog",
    faq: "/faq",
    sponsors: "/sponsors",
  };

  return lookup[item.type ?? "home"] ?? "/";
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

      {/* Clean fixed header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-muted/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6">
          {/* HEIGHT + ALIGNMENT — THE IMPORTANT PART */}
          <div className="flex items-center justify-between py-4 lg:py-5 gap-6">
            {/* LOGO — balanced scale */}
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="The Media Collective"
                className="h-14 sm:h-16 lg:h-20 w-auto object-contain"
              />
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="
                    text-muted-foreground font-body 
                    text-sm lg:text-base 
                    uppercase tracking-[0.15em]
                    hover:text-primary transition-colors
                  "
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* CTA */}
            <div className="hidden md:block">
              <Button
                onClick={() => setIsFormOpen(true)}
                className="
                  bg-primary text-primary-foreground
                  px-6 py-2.5 
                  text-sm font-semibold uppercase tracking-wide
                  hover:bg-primary/90 transition
                "
              >
                Contact Us
              </Button>
            </div>

            {/* MOBILE BUTTON */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

          {/* MOBILE MENU */}
          {isMenuOpen && (
            <nav className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="
                      text-muted-foreground font-body text-base
                      uppercase tracking-wide
                      hover:text-primary
                    "
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}

                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsFormOpen(true);
                  }}
                  className="bg-primary text-primary-foreground py-3 text-base uppercase tracking-wide"
                >
                  Contact Us
                </Button>
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
