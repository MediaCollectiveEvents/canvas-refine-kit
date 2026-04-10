import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type TestimonialObject = {
  quote?: string;
  name?: string;
  role?: string;
  company?: string;
};

type TestimonialInput = string | TestimonialObject;

interface TestimonialsSectionProps {
  section?: {
    heading?: string;
    items?: TestimonialInput[];
    styleTitle?: {
      eyebrow?: string;
      sub?: string;
    };
  };
}

type NormalizedTestimonial = {
  quote: string[];
  author: string;
  title: string;
  company: string;
};

const fallbackTestimonials: NormalizedTestimonial[] = [
  {
    quote: [
      "Every event delivers genuine value. I've formed partnerships and gained insights that have directly impacted our company's strategic direction."
    ],
    author: "Chris Rovtar",
    title: "Founder",
    company: "Xcell Group"
  },
  {
    quote: [
      "The intimate format creates opportunities for genuine dialogue with peers.",
      "It's not just networking — it's building lasting professional connections."
    ],
    author: "Laurence Mifsud",
    title: "SVP Global Head of Media & Entertainment",
    company: "Software Minds"
  },
  {
    quote: [
      "Working with The Media Collective has been key to elevating our profile in the broadcast media and tech sectors.",
      "It has helped us connect with exciting brands and establish a strong presence at major industry events."
    ],
    author: "Daniel Jenkins",
    title: "Commercial Director",
    company: "Wagada Digital"
  },
  {
    quote: [
      "The sector-focused nature of the event enabled us to make solid personal connections with like-minded peers —",
      "far deeper than what happens at larger events."
    ],
    author: "Vik Nunkoo",
    title: "Commercial Director",
    company: "Tosellmore"
  },
  {
    quote: [
      "It was great to attend and connect with so many talented people in the broadcast and media industry.",
      "A powerful reminder of the strength of this community."
    ],
    author: "Sue Mitchell",
    title: "Director",
    company: "Zixi"
  }
];

const INTERVAL = 7000;

function normalizeQuoteText(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeTestimonials(
  items?: TestimonialInput[]
): NormalizedTestimonial[] {
  if (!Array.isArray(items) || items.length === 0) {
    return fallbackTestimonials;
  }

  const normalized = items
    .map((item): NormalizedTestimonial | null => {
      if (typeof item === "string") {
        const quoteLines = normalizeQuoteText(item);
        if (!quoteLines.length) return null;

        return {
          quote: quoteLines,
          author: "",
          title: "",
          company: ""
        };
      }

      if (item && typeof item === "object") {
        const quoteLines = item.quote ? normalizeQuoteText(item.quote) : [];
        if (!quoteLines.length) return null;

        return {
          quote: quoteLines,
          author: item.name ?? "",
          title: item.role ?? "",
          company: item.company ?? ""
        };
      }

      return null;
    })
    .filter((item): item is NormalizedTestimonial => item !== null);

  return normalized.length > 0 ? normalized : fallbackTestimonials;
}

const TestimonialsSection = ({ section }: TestimonialsSectionProps) => {
  const testimonials = useMemo(
    () => normalizeTestimonials(section?.items),
    [section?.items]
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || testimonials.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [paused, testimonials.length]);

  useEffect(() => {
    if (index >= testimonials.length) {
      setIndex(0);
    }
  }, [index, testimonials.length]);

  const current = testimonials[index];
  const eyebrow =
    section?.styleTitle?.eyebrow || section?.heading || "What our guests say";

  if (!current) return null;

  return (
    <section className="relative overflow-hidden py-24 bg-[#0F172A] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(39,205,186,0.07)_0%,rgba(0,0,0,0)_62%)]"
      />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <p
          className="
            font-body
            text-xs sm:text-sm
            tracking-[0.28em]
            uppercase
            text-white/55
            mb-3
          "
        >
          {eyebrow}
        </p>

        <div className="w-12 h-px bg-white/20 mx-auto mb-10" />

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <blockquote
                className="
                  relative
                  mx-auto
                  max-w-[38ch]
                  font-serif
                  text-[1.4rem]
                  sm:text-[1.55rem]
                  md:text-[1.7rem]
                  leading-[1.55]
                  tracking-[-0.01em]
                  text-white/90
                "
              >
                <span
                  aria-hidden="true"
                  className="
                    absolute
                    -left-8
                    -top-3
                    text-[#36e0c6]
                    text-[3rem]
                    sm:text-[3.4rem]
                    leading-none
                    opacity-95
                  "
                >
                  “
                </span>

                {current.quote.map((sentence, i) => (
                  <p key={i} className="mb-4 last:mb-0">
                    {sentence}
                  </p>
                ))}

                <span
                  aria-hidden="true"
                  className="
                    absolute
                    -right-8
                    -bottom-4
                    text-[#36e0c6]
                    text-[3rem]
                    sm:text-[3.4rem]
                    leading-none
                    opacity-95
                  "
                >
                  ”
                </span>
              </blockquote>

              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.45 }}
                className="mt-8"
              >
                {current.author && (
                  <p className="font-body text-[1rem] text-white/92 tracking-[0.02em]">
                    {current.author}
                  </p>
                )}

                {(current.title || current.company) && (
                  <p className="font-body text-[0.9rem] text-white/60 mt-1">
                    {current.title}
                    {current.title && current.company ? " — " : ""}
                    {current.company && (
                      <span className="text-[#36e0c6]">{current.company}</span>
                    )}
                  </p>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {testimonials.length > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {testimonials.map((_, dotIndex) => {
                const active = dotIndex === index;

                return (
                  <button
                    key={dotIndex}
                    type="button"
                    aria-label={`Show testimonial ${dotIndex + 1}`}
                    onClick={() => setIndex(dotIndex)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      active
                        ? "w-8 bg-[#36e0c6]"
                        : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;