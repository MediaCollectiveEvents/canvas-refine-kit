// src/components/layout/Header.tsx

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "../ui/button";
import logo from "../../assets/logo.png";
import EventRegistrationForm from "../EventRegistrationForm";
import settings from "../../content/settings.json";

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
  const [scrolled, setScrolled] = useState(false);

  const navItems =
    typedSettings.nav?.length
      ? typedSettings.nav.map((i) => ({ label: i.label, href: resolveHref(i) }))
      : fallbackNavItems;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      {/* HEADER */}
      <header
        className={`
          fixed top-0 left-0 right-0 z-50
          backdrop-blur-2xl
          bg-gradient-to-b from-gray-900/70 via-gray-900/55 to-gray-900/40
          h-32 sm:h-40 lg:h-48 xl:h-56
          overflow-hidden
        `}
      >
        {/* Subtle teal glow behind the header */}
        <div
          aria-hidden="true"
          className="
            absolute inset-0 pointer-events-none
            bg-[radial-gradient(circle_at_center,rgba(39,205,186,0.06),transparent_85%)]
          "
        />

        {/* 🌊 Softer teal underline – reduced + fading to the right */}
        <div
          aria-hidden="true"
          className="
            absolute inset-x-0 bottom-0 h-[1px]
          "
          style={{
            background:
              "linear-gradient(to right, rgba(39,205,186,0.55), rgba(39,205,186,0.12), rgba(39,205,186,0))",
            boxShadow: "0 0 8px rgba(39,205,186,0.35)",
          }}
        />

        <div className="relative h-full">
          <div
            className="
              max-w-6xl mx-auto
              px-6 md:px-10
              h-full flex items-center justify-between gap-6
            "
          >
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center flex-shrink-0 min-w-[140px]"
            >
              <div className="h-16 sm:h-20 lg:h-24 xl:h-28 flex items-center">
                <img
                  src={logo}
                  alt="The Media Collective"
                  className="block h-full w-auto object-contain"
                />
              </div>
            </Link>

            {/* NAVIGATION */}
            <nav className="hidden md:flex flex-1 justify-center items-center gap-10">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="
                    font-body uppercase tracking-[0.22em]
                    text-white/90 hover:text-[#3AE7D5]
                    transition-all duration-200 text-[0.95rem] lg:text-[1rem]
                  "
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* CTA */}
            <div className="hidden md:flex flex-shrink-0 min-w-[140px] justify-end">
              <Button
                onClick={() => setIsFormOpen(true)}
                className="
                  bg-primary text-black 
                  font-body uppercase tracking-wider text-sm
                  px-6 py-3
                  hover:bg-primary/90 hover:scale-[1.03]
                  shadow-md shadow-primary/40 transition-transform
                "
              >
                Contact Us
              </Button>
            </div>

            {/* MOBILE MENU */}
            <button
              className="md:hidden text-white/90 ml-auto"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isMenuOpen && (
            <nav
              className="md:hidden absolute left-0 right-0 top-full 
              bg-[#0F172A]/95 border-t border-white/15
            "
            >
              <div className="max-w-6xl mx-auto px-6 md:px-10 py-4">
                <div className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="
                        text-white/90 hover:text-[#3AE7D5]
                        font-body uppercase tracking-[0.18em]
                        py-2 text-[1rem]
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
                      bg-primary text-black 
                      mt-2 hover:bg-primary/90 hover:scale-[1.03]
                      shadow-md shadow-primary/40 transition-transform
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