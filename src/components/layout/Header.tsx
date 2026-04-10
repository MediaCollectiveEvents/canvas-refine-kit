import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

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
    sponsors: "/sponsors"
  };

  return map[item.type ?? "home"] ?? "/";
}

const fallbackNavItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Partners", href: "/partners" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" }
];

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems =
    typedSettings.nav?.length
      ? typedSettings.nav.map((i) => ({
          label: i.label,
          href: resolveHref(i)
        }))
      : fallbackNavItems;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      <header
        className="
          fixed top-0 left-0 right-0 z-50
          bg-[#08111f]
          backdrop-blur-md
          shadow-[0_12px_36px_rgba(0,0,0,0.34)]
          transition-all duration-300 ease-out
        "
      >
        {/* Apple-style glass highlight (top edge) */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,0.03), rgba(255,255,255,0.22), rgba(255,255,255,0.03))"
          }}
        />

        {/* Accent separator (bottom edge) */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(39,205,186,0.06), rgba(39,205,186,0.55), rgba(39,205,186,0.06))",
            boxShadow: "0 0 6px rgba(39,205,186,0.35)"
          }}
        />

        <div
          className={`
            relative max-w-7xl mx-auto
            px-5 sm:px-6 lg:px-8 xl:px-10
            transition-all duration-300 ease-out
            ${scrolled ? "h-[84px] lg:h-[90px]" : "h-[92px] lg:h-[100px]"}
          `}
        >
          {/* MOBILE NAV */}
          <div className="flex h-full items-center lg:hidden">
            <Link to="/" aria-label="The Media Collective home">
              <img
                src={logo}
                alt="The Media Collective"
                className={scrolled ? "h-11" : "h-14"}
              />
            </Link>

            <button
              className="
                ml-auto w-11 h-11 rounded-lg
                border border-white/15
                bg-white/8 text-white
                hover:bg-white/12
                transition
              "
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden lg:flex h-full items-center">
            <Link to="/" className="relative z-10">
              <img
                src={logo}
                alt="The Media Collective"
                className={scrolled ? "h-14" : "h-16 xl:h-[4.4rem]"}
              />
            </Link>

            <nav className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-6 xl:gap-8 2xl:gap-10">
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      className={`
                        relative pb-1 whitespace-nowrap
                        font-body uppercase font-medium
                        tracking-[0.14em] xl:tracking-[0.18em]
                        text-[0.82rem] xl:text-[0.9rem]
                        transition-all duration-200
                        ${
                          isActive
                            ? "text-white"
                            : "text-white/90 hover:text-[#9BF8ED]"
                        }
                      `}
                      style={{
                        textShadow: "0 1px 8px rgba(0,0,0,0.45)"
                      }}
                    >
                      {item.label}

                      <span
                        className={`
                          absolute left-0 right-0 -bottom-[3px]
                          h-[2px] rounded-full
                          transition-all duration-200
                          ${
                            isActive
                              ? "bg-[#27CDBA]"
                              : "bg-[#27CDBA] opacity-0"
                          }
                        `}
                      />
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="ml-auto">
              <Button
                onClick={() => setIsFormOpen(true)}
                className="
                  rounded-xl
                  font-body uppercase
                  tracking-[0.12em]
                  text-[0.84rem]
                  px-6 py-3
                  bg-primary text-black
                  hover:bg-primary/92
                  shadow-[0_0_18px_rgba(39,205,186,0.18)]
                "
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU PANEL */}
        {isMenuOpen && (
          <nav className="lg:hidden border-t border-white/10 bg-[#08111f] backdrop-blur-md">
            <div className="px-6 py-5 flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`
                      rounded-lg px-3 py-3
                      uppercase tracking-[0.16em]
                      text-[0.92rem]
                      transition
                      ${
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-white/88 hover:bg-white/8 hover:text-[#9BF8ED]"
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsFormOpen(true);
                }}
                className="
                  mt-3 rounded-xl
                  bg-primary text-black
                  uppercase tracking-[0.12em]
                  text-[0.9rem]
                  py-3
                "
              >
                Contact Us
              </Button>
            </div>
          </nav>
        )}
      </header>
    </>
  );
};

export default Header;