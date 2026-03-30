import { Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="
        relative
        bg-gradient-to-b from-[#0E1526]/80 via-[#0E1526]/60 to-[#0E1526]/40
        backdrop-blur-2xl
        pt-16 pb-20
        overflow-hidden
      "
    >
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-[1px]"
        style={{
          background:
            "linear-gradient(to right, rgba(39,205,186,0.55), rgba(39,205,186,0.12), rgba(39,205,186,0))",
          boxShadow: "0 0 8px rgba(39,205,186,0.35)",
        }}
      />

      <div
        aria-hidden="true"
        className="
          absolute inset-0 pointer-events-none
          bg-[radial-gradient(circle_at_center,rgba(39,205,186,0.06),transparent_85%)]
        "
      />

      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="flex justify-center gap-4 mb-12">
          <a
            href="#"
            aria-label="LinkedIn"
            className="
              w-12 h-12 rounded-full
              border border-white/20
              flex items-center justify-center
              text-white/70 hover:text-white hover:border-white/40
              transition
            "
          >
            <Linkedin className="w-7 h-7" strokeWidth={1.75} />
          </a>
        </div>

        <div
          className="
            flex justify-center gap-8
            pt-8 border-t border-white/12
            font-[Montserrat]
            tracking-wide
            text-sm text-white/70
          "
        >
          <a
            href="/privacy-policy"
            className="hover:text-white transition-colors"
          >
            Privacy Policy
          </a>

          <a href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}