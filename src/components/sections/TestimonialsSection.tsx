import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
    heading?: string;
    styleTitle?: { eyebrow?: string; sub?: string };
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

  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reducedMotion || paused || testimonials.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [reducedMotion, paused, testimonials.length]);

  const current = testimonials[index % testimonials.length];

  if (!current) return null;

  return (
    <SectionWrapper
      variant="dark"
      align="left"
      padding="lux"
      noise={false}
      grid={false}
      withFades={false}
      className="relative text-[#f7f3eb] !pb-8 md:!pb-12"
    >
      <div className="relative z-10 grid items-start gap-10 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <p className="mb-4 site-eyebrow text-[#9bd3c8]">{section?.styleTitle?.eyebrow || "Attendees and partners"}</p>
          <SectionTitle align="left" disableEmphasis tone="default">
            {section?.heading || "Community voices"}
          </SectionTitle>

          <p className="mt-5 max-w-sm text-base leading-relaxed text-slate-300">{section?.styleTitle?.sub || "Thoughtful discussion, introductions and collaboration."}</p>

        </div>

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}
          className="relative min-w-0 pt-6 font-body lg:col-span-8"
        >
          <div className="grid">
            {/* Invisible copies reserve only the height required by the longest CMS item at this width. */}
            {testimonials.map((item, itemIndex) => (
              <div key={itemIndex} aria-hidden="true" className="invisible pointer-events-none [grid-area:1/1]">
                <blockquote className="max-w-[40ch] font-body font-normal text-xl md:text-[27px] leading-[1.6]">
                  {item.quote.map((sentence, sentenceIndex) => <p key={sentenceIndex} className="mb-4 last:mb-0">{sentence}</p>)}
                </blockquote>
                <div className="mt-3">
                  {item.author && <p className="text-[1rem] tracking-[0.02em] font-medium">{item.author}</p>}
                  {(item.title || item.company) && <p className="mt-1 text-[0.9rem]">{item.title}{item.title && item.company ? " — " : ""}{item.company}</p>}
                </div>
                {testimonials.length > 1 && <div className="mt-4 h-10" />}
              </div>
            ))}
          <div className="[grid-area:1/1]">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              className="[grid-area:1/1]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.55 }}
            >
              <blockquote
                className="
                  relative
                  max-w-[40ch]
                  font-body font-normal
                  text-xl md:text-[27px]
                  leading-[1.6]

                  text-[#f7f3eb]
                "
              >
                <span
                  aria-hidden="true"
                  className="
                    absolute
                    left-0
                    -top-7
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
                className="mt-3"
              >
                {current.author && (
                  <p className="text-[1rem] tracking-[0.02em] font-medium text-[#f7f3eb]">
                    {current.author}
                  </p>
                )}

                {(current.title || current.company) && (
                  <p className="mt-1 text-[0.9rem] text-slate-300">
                    {current.title}
                    {current.title && current.company ? " — " : ""}
                    {current.company && (
                      <span>{current.company}</span>
                    )}
                  </p>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {testimonials.length > 1 && (
            <div className="mt-4 flex items-center gap-1">
              {testimonials.map((_, dotIndex) => {
                const active = dotIndex === index;

                return (
                  <button
                    key={dotIndex}
                    type="button"
                    aria-label={`Show testimonial ${dotIndex + 1}`}
                    aria-pressed={active}
                    onClick={() => setIndex(dotIndex)}
                    className="flex h-10 w-10 items-center justify-center rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300"
                  >
                    <span aria-hidden="true" className={`h-1 rounded-full transition-all ${active ? "w-7 bg-[#9bd3c8]" : "w-2 bg-slate-500"}`} />
                  </button>
                );
              })}
            </div>
          )}
          </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default TestimonialsSection;
