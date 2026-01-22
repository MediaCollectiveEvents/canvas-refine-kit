import { forwardRef } from "react";
import { Linkedin } from "lucide-react";

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const currentYear = new Date().getFullYear();
  const socialLinks = [{
    icon: Linkedin,
    href: "#",
    label: "LinkedIn"
  }];
  const eventLinks = [{
    label: "IBC Breakfast",
    href: "#"
  }, {
    label: "MPTS Networking Reception",
    href: "#"
  }, {
    label: "NAB Show Events",
    href: "#"
  }, {
    label: "View All Events",
    href: "/events"
  }];
  return <footer ref={ref} id="contact" className="bg-muted border-t border-border">
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Events */}
          <div>
            <h4 className="font-display text-lg mb-4">Events</h4>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {eventLinks.map(link => <li key={link.label}>
                  <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors font-body text-sm">
                    {link.label}
                  </a>
                </li>)}
            </ul>
          </div>

          {/* Social */}
          <div className="flex flex-col items-start md:items-end">
            <h4 className="font-display text-lg mb-4">Connect With Us</h4>
            <div className="flex gap-4">
              {socialLinks.map(social => <a key={social.label} href={social.href} aria-label={social.label} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                  <social.icon className="w-[200px] h-px" />
                </a>)}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground font-body text-sm">
            © {currentYear} The Media Collective. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors font-body text-sm">
              Privacy Policy
            </a>
            <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors font-body text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>;
});

Footer.displayName = "Footer";

export default Footer;