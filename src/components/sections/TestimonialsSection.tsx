import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const testimonials = [
  {
    quote: [
      "Every event delivers genuine value. I've formed partnerships and gained insights that have directly impacted our company's strategic direction.",
    ],
    author: "Chris Rovtar",
    title: "Founder",
    company: "Xcell Group",
  },
  {
    quote: [
      "The intimate format creates opportunities for genuine dialogue with peers.",
      "It's not just networking — it's building lasting professional connections.",
    ],
    author: "Laurence Mifsud",
    title: "SVP Global Head of Media & Entertainment",
    company: "Software Minds",
  },
  {
    quote: [
      "Working with The Media Collective has been key to elevating our profile in the broadcast media and tech sectors.",
      "It has helped us connect with exciting brands and establish a strong presence at major industry events.",
    ],
    author: "Daniel Jenkins",
    title: "Commercial Director",
    company: "Wagada Digital",
  },
  {
    quote: [
      "The sector-focused nature of the event enabled us to make solid personal connections with like‑minded peers —",
      "far deeper than what happens at larger events.",
    ],
    author: "Vik Nunkoo",
    title: "Commercial Director",
    company: "Tosellmore",
  },
  {
    quote: [
      "It was great to attend and connect with so many talented people in the broadcast and media industry.",
      "A powerful reminder of the strength of this community.",
    ],
    author: "Sue Mitchell",
    title: "Director",
    company: "Zixi",
  },
];

const INTERVAL = 7000;

const TestimonialsSection = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [paused]);

  const current = testimonials[index];

  return (
    <section className="relative overflow-hidden py-28 bg-[#0F172A] text-white">
      {/* Soft background vignette */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.45)_0%,rgba(0,0,0,0)_75%)]
        "
      />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        {/* SECTION LABEL */}
        <p
          className="
            font-body
            text-xs sm:text-sm md:text-[0.85rem]
            tracking-[0.28em]
            uppercase
            text-white/55
            mb-2
          "
        >
          What our guests say
        </p>

        {/* Divider */}
        <div className="w-10 h-[1.5px] bg-white/20 mx-auto mb-12" />

        {/* QUOTE ROTATOR */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            >
              {/* QUOTE */}
              <blockquote
                className="
                  font-serif
                  text-[1.85rem] sm:text-[2.1rem] md:text-[2.28rem]
                  leading-[1.6]
                  max-w-[48ch] mx-auto
                  text-white/90
                  font-light
                  tracking-[-0.005em]
                  drop-shadow-[0_1px_12px_rgba(0,0,0,0.4)]
                "
              >
                {/* Opening quote */}
                <span className="block text-[#27CDBA] text-[2.6rem] mb-3">
                  “
                </span>

                {current.quote.map((sentence, i) => (
                  <p key={i} className="mb-4 last:mb-0">
                    {sentence}
                  </p>
                ))}

                {/* Closing quote */}
                <span className="block text-[#27CDBA] text-[2.6rem] mt-4">
                  ”
                </span>
              </blockquote>

              {/* ATTRIBUTION */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-8"
              >
                <p className="text-[1.05rem] font-medium text-white/90">
                  {current.author}
                </p>

                <p className="text-[0.95rem] text-white/60 mt-1">
                  {current.title} —{" "}
                  <span className="text-[#27CDBA]">{current.company}</span>
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;