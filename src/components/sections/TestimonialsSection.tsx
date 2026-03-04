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
      "The sector-focused nature of the event enabled us to make solid personal connections with like-minded peers —",
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

const INTERVAL = 7000; // 7s

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
    <section className="relative overflow-hidden py-28 md:py-36 bg-[#0A0F14] text-white">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_center,rgba(39,205,186,0.08),transparent_75%)]
        "
      />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        {/* SECTION LABEL */}
        <p className="text-xs tracking-[0.2em] uppercase text-gray-400 mb-7">
          What our guests say
        </p>

        {/* Softer ghost line */}
        <div className="w-12 h-px bg-white/15 mx-auto mb-12" />

        {/* QUOTE WRAPPER */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              {/* QUOTE */}
              <div className="mb-9">
                <blockquote
                  className="
                    font-serif
                    text-[2.35rem] md:text-[2.5rem] lg:text-[2.6rem]
                    leading-[1.33]
                    max-w-[760px] mx-auto
                    text-white
                    opacity-[0.92]
                  "
                >
                  {current.quote.map((block, i) => (
                    <p key={i} className="mb-6 last:mb-0">
                      “{block}”
                    </p>
                  ))}
                </blockquote>
              </div>

              {/* ATTRIBUTION */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15 }}
                className="mt-9"
              >
                <p className="text-[1.1rem] font-semibold text-white">
                  {current.author}
                </p>

                <p className="text-[0.95rem] text-gray-400 mt-1">
                  {current.title} —{" "}
                  <span className="text-[#24BFAE]">{current.company}</span>
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