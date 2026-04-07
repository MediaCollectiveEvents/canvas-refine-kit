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
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems =
    typedSettings.nav?.length
      ? typedSettings.nav.map((i) => ({ label: i.label, href: resolveHref(i) }))
      : fallbackNavItems;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
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
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300 ease-out
          backdrop-blur-xl
          border-b
          ${
            scrolled
              ? "bg-white/72 border-black/10 shadow-[0_10px_40px_rgba(0,0,0,0.16)]"
              : "bg-gradient-to-b from-[#0B1220]/82 via-[#0B1220]/60 to-[#0B1220]/28 border-white/6"
          }
        `}
      >
        <div
          aria-hidden="true"
          className={`
            absolute inset-0 pointer-events-none transition-opacity duration-300
            ${
              scrolled
                ? "bg-[radial-gradient(circle_at_center,rgba(39,205,186,0.035),transparent_78%)]"
                : "bg-[radial-gradient(circle_at_center,rgba(39,205,186,0.05),transparent_78%)]"
            }
          `}
        />

        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px"
          style={{
            background: scrolled
              ? "linear-gradient(to right, rgba(39,205,186,0.22), rgba(39,205,186,0.10), rgba(39,205,186,0))"
              : "linear-gradient(to right, rgba(39,205,186,0.34), rgba(39,205,186,0.10), rgba(39,205,186,0))",
          }}
        />

        <div
          className={`
            relative max-w-7xl mx-auto
            px-5 sm:px-6 lg:px-8 xl:px-10
            transition-all duration-300 ease-out
            ${scrolled ? "h-[88px] lg:h-[92px]" : "h-[96px] lg:h-[108px]"}
          `}
        >
          <div className="flex h-full items-center lg:hidden">
            <Link
              to="/"
              className="flex shrink-0 items-center"
              aria-label="The Media Collective home"
            >
              <img
                src={logo}
                alt="The Media Collective"
                className={`
                  block w-auto shrink-0 object-contain transition-all duration-300 ease-out
                  ${scrolled ? "h-12" : "h-14"}
                `}
              />
            </Link>

            <button
              className={`
                ml-auto inline-flex items-center justify-center
                w-11 h-11 rounded-lg border transition
                ${
                  scrolled
                    ? "border-black/10 bg-black/[0.04] text-[#0B1220]/90 hover:bg-black/[0.08]"
                    : "border-white/10 bg-white/5 text-white/90 hover:bg-white/10"
                }
              `}
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          <div className="relative hidden h-full lg:flex items-center">
            <Link
              to="/"
              className="relative z-10 flex shrink-0 items-center"
              aria-label="The Media Collective home"
            >
              <img
                src={logo}
                alt="The Media Collective"
                className={`
                  block w-auto shrink-0 object-contain transition-all duration-300 ease-out
                  ${scrolled ? "h-14" : "h-16 xl:h-[4.5rem]"}
                `}
              />
            </Link>

            <nav className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="pointer-events-auto flex items-center gap-6 xl:gap-8 2xl:gap-10">
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
                        font-body uppercase
                        tracking-[0.14em] xl:tracking-[0.18em]
                        text-[0.8rem] xl:text-[0.9rem]
                        transition-colors duration-200
                        ${
                          scrolled
                            ? isActive
                              ? "text-[#0B1220]"
                              : "text-[#0B1220]/70 hover:text-[#0B1220]"
                            : isActive
                              ? "text-white"
                              : "text-white/82 hover:text-[#7EF2E4]"
                        }
                      `}
                    >
                      {item.label}
                      <span
                        className={`
                          absolute left-0 right-0 -bottom-[2px] h-px
                          transition-all duration-200
                          ${
                            isActive
                              ? "bg-[#27CDBA] opacity-100"
                              : "bg-[#27CDBA] opacity-0"
                          }
                        `}
                      />
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="relative z-10 ml-auto flex shrink-0 items-center">
              <Button
                onClick={() => setIsFormOpen(true)}
                className={`
                  rounded-xl
                  font-body uppercase
                  tracking-[0.1em] xl:tracking-[0.12em]
                  text-[0.76rem] xl:text-[0.84rem]
                  px-4 xl:px-6 py-2.5 xl:py-3
                  whitespace-nowrap
                  transition-all duration-200
                  ${
                    scrolled
                      ? "bg-primary text-black hover:bg-primary/92 shadow-[0_0_18px_rgba(39,205,186,0.14)]"
                      : "bg-primary text-black hover:bg-primary/92 shadow-[0_0_18px_rgba(39,205,186,0.18)]"
                  }
                `}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <nav
            className={`
              lg:hidden
              border-t
              backdrop-blur-xl
              ${
                scrolled
                  ? "border-black/10 bg-white/92"
                  : "border-white/10 bg-[#0B1220]/96"
              }
            `}
          >
            <div className="max-w-7xl mx-auto px-6 py-5">
              <div className="flex flex-col gap-1">
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
                        font-body uppercase tracking-[0.16em]
                        text-[0.92rem] transition
                        ${
                          scrolled
                            ? isActive
                              ? "bg-black/[0.06] text-[#0B1220]"
                              : "text-[#0B1220]/75 hover:bg-black/[0.04] hover:text-[#0B1220]"
                            : isActive
                              ? "bg-white/8 text-white"
                              : "text-white/82 hover:bg-white/6 hover:text-[#7EF2E4]"
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
                    font-body uppercase tracking-[0.12em] text-[0.9rem]
                    py-3
                    hover:bg-primary/92
                    shadow-[0_0_18px_rgba(39,205,186,0.18)]
                    transition-all duration-200
                  "
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </nav>
        )}
      </header>
    </>
  );
};

export default Header;