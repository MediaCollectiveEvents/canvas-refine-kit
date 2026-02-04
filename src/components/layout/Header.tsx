import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import EventRegistrationForm from "@/components/EventRegistrationForm";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Events", href: "/events" },
    { label: "Partners", href: "/partners" },
    { label: "Blog", href: "/blog" },
    { label: "Topics", href: "/topics" },
  ];

  const isActivePath = (href: string) => {
    return (
      location.pathname === href ||
      (href !== "/" && location.pathname.startsWith(href))
    );
  };

  return (
    <>
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      <header className="fixed top-0 left-0 right-0 z-50 bg-muted backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center flex-shrink-0">
              <img
                src={logo}
                alt="The Media Collective"
                className="h-24 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) =>
                item.href.startsWith("#") || item.href.includes("#") ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm uppercase tracking-wider"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    to={item.href}
                    aria-current={isActivePath(item.href) ? "page" : undefined}
                    className={`font-body text-sm uppercase tracking-wider transition-colors ${
                      isActivePath(item.href)
                        ? "text-primary border-b-2 border-primary pb-1"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-body uppercase tracking-wider text-sm px-6"
              >
                Contact Us
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="md:hidden pt-6 pb-4 border-t border-border mt-4">
              <div className="flex flex-col gap-4">
                {navItems.map((item) =>
                  item.href.startsWith("#") || item.href.includes("#") ? (
                    <a
                      key={item.label}
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm uppercase tracking-wider py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      to={item.href}
                      aria-current={
                        isActivePath(item.href) ? "page" : undefined
                      }
                      className={`font-body text-sm uppercase tracking-wider py-2 transition-colors ${
                        isActivePath(item.href)
                          ? "text-primary border-b border-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ),
                )}
                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsFormOpen(true);
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-body uppercase tracking-wider text-sm mt-2"
                >
                  Contact Us
                </Button>
              </div>
            </nav>
          )}
        </div>

        {/* Decorative accent line - matching footer */}
        <div className="h-1 bg-gradient-to-r from-primary via-[hsl(var(--icon-cyan))] to-primary" />
      </header>
    </>
  );
};

export default Header;
