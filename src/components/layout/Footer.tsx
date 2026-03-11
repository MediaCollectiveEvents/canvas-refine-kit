import { useState, FormEvent } from "react";
import { Linkedin } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <footer
      id="contact"
      className="
        relative
        bg-gradient-to-b from-gray-900/70 via-gray-900/55 to-gray-900/40
        backdrop-blur-2xl
        pt-28 pb-20
        overflow-hidden
      "
    >
      {/* Thin teal strip at top */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-[1px]"
        style={{
          background:
            "linear-gradient(to right, rgba(39,205,186,0.55), rgba(39,205,186,0.12), rgba(39,205,186,0))",
          boxShadow: "0 0 8px rgba(39,205,186,0.35)",
        }}
      />

      {/* Teal glow */}
      <div
        aria-hidden="true"
        className="
          absolute inset-0 pointer-events-none
          bg-[radial-gradient(circle_at_center,rgba(39,205,186,0.06),transparent_85%)]
        "
      />

      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* HEADING */}
        <h4
          className="
            font-[Montserrat]
            font-light
            text-[1.9rem] sm:text-[2rem]
            text-white tracking-wide
            mb-6
          "
        >
          Join the Collective
        </h4>

        {/* DESCRIPTION */}
        <p
          className="
            font-[Montserrat]
            text-white/75
            text-[1rem] sm:text-[1.1rem]
            leading-[1.75]
            max-w-xl mx-auto
            mb-10
          "
        >
          Receive occasional updates about upcoming gatherings, speakers and
          industry opportunities.
        </p>

        {/* EMAIL FORM */}
        <form
          onSubmit={handleSubscribe}
          className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto mb-12"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="
              w-full rounded-md
              bg-white/5 text-white placeholder-white/50
              border border-white/10 focus:border-[#27CDBA]/60
              px-4 py-3 outline-none transition
            "
          />

          <button
            type="submit"
            className="
              rounded-md bg-[#27CDBA] text-black font-medium px-6 py-3
              hover:bg-[#20b8a8] hover:brightness-110
              shadow-[0_0_16px_rgba(39,205,186,0.22)]
              transition
              whitespace-nowrap
            "
          >
            Join
          </button>
        </form>

        {/* SMALLPRINT */}
        <p className="text-white/80 text-sm mb-1">Join our community.</p>
        <p className="text-white/40 text-xs mb-14">
          No spam. Unsubscribe anytime.
        </p>

        {/* SOCIAL – Larger LinkedIn */}
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

        {/* LEGAL LINKS */}
        <div
          className="
            flex justify-center gap-8
            pt-8 border-t border-white/12
            font-[Montserrat]
            tracking-wide
            text-sm text-white/70
          "
        >
          <a href="/privacy" className="hover:text-white transition-colors">
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