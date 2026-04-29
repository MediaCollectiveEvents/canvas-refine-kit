import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionWrapper from "../layout/SectionWrapper";
import SectionTitle from "../layout/SectionTitle";

type TestimonialObject = {
  quote?: string;
  name?: string;
  role?: string;
  company?: string;
};

type TestimonialInput = string | TestimonialObject;

interface TestimonialsSectionProps {
  section?: {
    items?: TestimonialInput[];
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
          company: "",
        };
      }

      if (item && typeof item === "object") {
        const quoteLines = item.quote ? normalizeQuoteText(item.quote) : [];
        if (!quoteLines.length) return null;

        return {
          quote: quoteLines,
          author: item.name ?? "",
          title: item.role ?? "",
          company: item.company ?? "",
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

  const current = testimonials[index];

  if (!current) return null;

  return (
    <SectionWrapper
      variant="dark"
      align="left"
      padding="lux"
      noise={true}
      grid={false}
      withFades={false}
      className="relative bg-[#111827] text-white"
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_center,rgba(39,205,186,0.04),transparent_72%)]
        "
      />

      <div className="relative z-10 grid items-start gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,4fr)] md:gap-16">
        <div className="pt-[0.75rem]">
          <SectionTitle align="left" disableEmphasis className="text-white">
            Community <span className="text-[#27CDBA]">Voices</span>
          </SectionTitle>

          <div
            aria-hidden="true"
            className="mt-4 h-px w-full max-w-[320px]"
            style={{
              background:
                "linear-gradient(to right, rgba(236,239,241,0.8), rgba(236,239,241,0))",
            }}
          />
        </div>

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative max-w-[860px]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.55 }}
            >
              <blockquote
                className="
                  relative
                  max-w-[34ch]
                  font-serif
                  text-[1.28rem] md:text-[1.45rem]
                  leading-[1.65]
                  tracking-[-0.01em]
                  text-white/90
                "
              >
                <span
                  aria-hidden="true"
                  className="
                    absolute
                    -left-6
                    -top-2
                    text-[#27CDBA]
                    text-[2.2rem]
                    leading-none
                    opacity-90
                  "
                >
                  “
                </span>

                {current.quote.map((sentence, i) => (
                  <p key={i} className="mb-4 last:mb-0">
                    {sentence}
                  </p>
                ))}
              </blockquote>

              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, duration: 0.4 }}
                className="mt-8"
              >
                {current.author && (
                  <p className="text-[1rem] tracking-[0.02em] text-white/92">
                    {current.author}
                  </p>
                )}

                {(current.title || current.company) && (
                  <p className="mt-1 text-[0.9rem] text-white/60">
                    {current.title}
                    {current.title && current.company ? " — " : ""}
                    {current.company && (
                      <span className="text-[#27CDBA]">{current.company}</span>
                    )}
                  </p>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {testimonials.length > 1 && (
            <div className="mt-8 flex gap-2">
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
                        ? "w-8 bg-[#27CDBA]"
                        : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default TestimonialsSection;