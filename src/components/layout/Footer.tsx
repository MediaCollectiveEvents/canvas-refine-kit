import { Link, useLocation } from "react-router-dom";
import { Linkedin } from "lucide-react";
import AttendanceCTA from "@/components/shared/AttendanceCTA";

export default function Footer() {
  const { pathname } = useLocation();
  const hasContextualEnding =
    /^\/(?:faq|partners|privacy-policy|blog)\/?$/.test(pathname) ||
    /^\/events\/(?!calendar(?:\/|$))[^/]+\/?$/.test(pathname);
  const isAdmin = /^\/(?:admin|manage)(?:\/|$)/.test(pathname);
  const linkClassName = "inline-flex min-h-11 items-center font-display text-[0.75rem] font-medium uppercase tracking-[0.1em] text-white/90 transition-colors hover:text-[#9BF8ED] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C5BB] xl:text-[0.9rem] xl:tracking-[0.18em]";

  return (
    <>
      {!isAdmin && !hasContextualEnding && <AttendanceCTA />}
    <footer id="contact" className="border-t border-[#35C5BB]/20 bg-[#08111f]">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-center sm:gap-6 sm:px-6 sm:py-3 lg:px-8 xl:gap-10 xl:px-8">
        <a
          href="https://www.linkedin.com/company/the-media-collective-events/"
          aria-label="The Media Collective on LinkedIn"
          className="inline-flex h-11 w-11 items-center justify-center text-white/90 transition-colors hover:text-[#9BF8ED] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C5BB]"
        >
          <Linkedin size={20} aria-hidden="true" />
        </a>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-1 xl:gap-x-8">
          <Link to="/faq" className={linkClassName}>FAQ</Link>
          <Link to="/privacy-policy" className={linkClassName}>Privacy Policy</Link>
        </nav>
      </div>
    </footer>
    </>
  );
}
