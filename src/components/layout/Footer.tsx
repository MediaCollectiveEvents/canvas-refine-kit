import { Link, useLocation } from "react-router-dom";
import { useRef, useState } from "react";
import { EventRegistrationForm } from "@/components/shared/LazyEnquiryForms";
import { Linkedin } from "lucide-react";
import { CookieSettingsButton } from "@/components/shared/CookieConsent";
import AttendanceCTA from "@/components/shared/AttendanceCTA";

export default function Footer({ hideAttendanceCTA = false }: { hideAttendanceCTA?: boolean }) {
  const { pathname } = useLocation();
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const updatesTrigger = useRef<HTMLButtonElement>(null);
  const hasContextualEnding =
    /^\/(?:faq|partners|privacy-policy|blog)\/?$/.test(pathname) ||
    /^\/events\/(?!calendar(?:\/|$))[^/]+\/?$/.test(pathname);
  const isAdmin = /^\/(?:admin|manage)(?:\/|$)/.test(pathname);
  const linkClassName = "inline-flex min-h-11 items-center font-display text-sm font-medium uppercase tracking-[0.1em] text-white/90 transition-colors hover:text-[#9BF8ED] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C5BB] xl:text-[0.9rem] xl:tracking-[0.18em]";

  return (
    <>
      {!isAdmin && <EventRegistrationForm eventUpdatesOnly open={updatesOpen} onOpenChange={setUpdatesOpen} onCloseAutoFocus={event => { event.preventDefault(); updatesTrigger.current?.focus(); }} />}
      {!hideAttendanceCTA && !isAdmin && !hasContextualEnding && <AttendanceCTA calendarContext={pathname === "/events/calendar"} />}
    <footer id="contact" className="site-gutter border-t border-white/10 bg-[#08111f]">
      <div className="site-container flex flex-col items-start gap-3 py-4 sm:flex-row sm:items-center sm:justify-center sm:gap-6 sm:py-3 xl:gap-10">
        <a
          href="https://www.linkedin.com/company/the-media-collective-events/"
          aria-label="The Media Collective on LinkedIn"
          className="inline-flex h-11 w-11 items-center justify-center text-white/90 transition-colors hover:text-[#9BF8ED] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C5BB]"
        >
          <Linkedin size={20} aria-hidden="true" />
        </a>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-1 xl:gap-x-8">
          {!isAdmin && <button ref={updatesTrigger} type="button" className={linkClassName} onClick={() => setUpdatesOpen(true)}>Be the first to hear about new events</button>}
          <Link to="/faq" className={linkClassName}>FAQ</Link>
          <Link to="/privacy-policy" className={linkClassName}>Privacy Policy</Link>
          {!isAdmin && <CookieSettingsButton className={linkClassName} />}
        </nav>
      </div>
    </footer>
    </>
  );
}
