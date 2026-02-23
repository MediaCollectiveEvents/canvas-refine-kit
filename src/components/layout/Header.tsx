import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import EventRegistrationForm from "@/components/EventRegistrationForm";

import settings from "@/content/settings.json";

type RawNavItem =
  | {
      label: string;
      type?: string;
      href?: string;
      url?: string;
    }
  | any;

interface SettingsFile {
  nav?: RawNavItem[];
  [key: string]: any;
}

const typedSettings = settings as SettingsFile;

function resolveHref(item: RawNavItem): string {
  if (item.href) return item.href;
  if (item.url) return item.url;

  switch (item.type) {
    case "home":
      return "/";
    case "about":
      return "/about";
    case "events":
      return "/events";
    case "partners":
      return "/partners";
    case "blog":
      return "/blog";
    case "faq":
      return "/faq";
    case "sponsors":
      return "/sponsors";
    default:
      return "/";
  }
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

  const navItems =
    Array.isArray(typedSettings.nav) && typedSettings.nav.length > 0
      ? typedSettings.nav.map((item) => ({
          label: item.label,
          href: resolveHref(item),
        }))
      : fallbackNavItems;

  return (
    <>
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      {/* Taller header */}
      <header
        className="
          fixed top-0 left-0 right-0 z-50
          bg-muted/95 backdrop-blur-sm
          h-24 sm:h-28 lg:h-36 xl:h-40
        "
      >
        {/* Neon gradient line */}
        <div
          className="
            absolute bottom-0 left-0 right-0
            h-[3px]
            bg-gradient-to-r from-primary via-cyan-400 to-primary
          "
        />

        <div className="relative h-full">
          <div
            className="
              mx-auto w-full max-w-[1280px]
              px-4 sm:px-6 lg:px-8 xl:px-12
              h-full flex items-center justify-between gap-4
            "
          >
            {/* Bigger Logo */}
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="The Media Collective"
                className="
                  h-16 sm:h-20 lg:h-24 xl:h-28
                  w-auto object-contain
                "
              />
            </Link>

            {/* Desktop Navigation */}
            <nav
              className="
                hidden md:flex items-center
                gap-4 lg:gap-6 xl:gap-8
              "
            >
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="
                    text-muted-foreground
                    font-body
                    text-sm md:text-base lg:text-lg xl:text-xl
                    uppercase tracking-[0.15em]
                    leading-none py-3
                    transition-all duration-200 ease-out
                    hover:text-primary hover:opacity-100
                    opacity-90
                  "
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Responsive CTA Button */}
            <div className="hidden md:block">
              <Button
                onClick={() => setIsFormOpen(true)}
                className="
                  bg-primary text-primary-foreground
                  font-body uppercase tracking-wider
                  text-sm md:text-base lg:text-lg
                  px-6 py-3
                  hover:bg-primary/90 hover:scale-[1.03]
                  shadow-md shadow-primary/30 transition-transform
                "
              >
                Contact Us
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden absolute left-0 right-0 top-full bg-muted/95 border-t border-border">
              <div
                className="
                  mx-auto w-full max-w-[1280px]
                  px-4 sm:px-6 lg:px-8 xl:px-12
                  py-4
                "
              >
                <div className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="
                        text-muted-foreground hover:text-primary
                        font-body
                        text-base sm:text-lg
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
                      text-base sm:text-lg py-3
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
