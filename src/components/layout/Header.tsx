import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import EventRegistrationForm from "@/components/EventRegistrationForm";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Events", href: "/events" },
    { label: "Partners", href: "/partners" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <>
      <EventRegistrationForm open={isFormOpen} onOpenChange={setIsFormOpen} />

      <header className="fixed top-0 left-0 right-0 z-50 bg-muted/95 backdrop-blur-sm h-20 sm:h-24 lg:h-28">
        {/* ⭐ CLEAN CRISP NEON LINE – teal → red → teal */}
        <div
          className="
            absolute bottom-0 left-0 right-0
            h-[3px]
            bg-gradient-to-r 
              from-primary 
              via-secondary 
              to-primary
          "
        />

        <div className="relative h-full">
          <div
            className="
              mx-auto w-full max-w-[1280px]
              px-4 sm:px-6 lg:px-10 xl:px-16
              h-full
              flex items-center justify-between gap-4
            "
          >
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="The Media Collective"
                className="h-14 sm:h-16 lg:h-20 w-auto object-contain"
              />
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 xl:gap-10">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="
                    text-muted-foreground
                    font-body text-sm uppercase tracking-wider leading-none py-1
                    transition-colors duration-200 ease-out
                    hover:text-primary
                    opacity-80 hover:opacity-100
                  "
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* CTA button */}
            <div className="hidden md:block">
              <Button
                onClick={() => setIsFormOpen(true)}
                className="
                  bg-primary text-primary-foreground
                  font-body uppercase tracking-wider text-sm
                  px-6 py-2
                  transition-transform duration-200 ease-out
                  hover:bg-primary/90
                  hover:scale-[1.03]
                  shadow-md shadow-primary/30 hover:shadow-[0_0_24px_rgba(54,224,198,0.6)]
                "
              >
                Contact Us
              </Button>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-foreground"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile navigation */}
          {isMenuOpen && (
            <nav className="md:hidden absolute left-0 right-0 top-full bg-muted/95 border-t border-border">
              <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-10 xl:px-16 py-4">
                <div className="flex flex-col gap-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="
                        text-muted-foreground hover:text-primary
                        transition-colors duration-200
                        font-body text-sm uppercase tracking-wider py-2
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
                    className="
                      bg-primary text-primary-foreground
                      font-body uppercase tracking-wider text-sm mt-2
                      hover:bg-primary/90
                      transition-transform duration-200
                      hover:scale-[1.03]
                      shadow-md shadow-primary/30 hover:shadow-[0_0_24px_rgba(54,224,198,0.6)]
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
