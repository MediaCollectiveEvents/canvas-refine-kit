import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    quote: "Every event delivers genuine value. I've formed partnerships and gained insights that have directly impacted our company's strategic direction.",
    author: "Chris Rovtar",
    title: "Founder",
    company: "Xcell Group",
  },
  {
    quote: "The intimate format creates opportunities for genuine dialogue with peers. It's not just networking—it's building lasting professional connections.",
    author: "Laurence Mifsud",
    title: "SVP Global Head of Media & Entertainment",
    company: "Software Minds",
  },
  {
    quote: "Working with The Media Collective has been a key part of us raising and elevating our brand profile within the broadcast media and tech sectors. It's helped connect us with interesting and exciting brands, and enabled us to establish ourselves within the business community through a strong presence at major events including MPTS and IBC.",
    author: "Daniel Jenkins",
    title: "Commercial Director",
    company: "Wagada Digital",
  },
  {
    quote: "The sector-focused nature of the event enabled us to really make solid personal connections with like-minded industry peers, allowing us to open dialogues on a basis we'd not achieve at larger events.",
    author: "Vik Nunkoo",
    title: "Commercial Director",
    company: "Tosellmore",
  },
  {
    quote: "It was great to attend this event and connect with so many talented people in the broadcast and media industry. It's a valuable reminder of the strong community we're part of and the opportunities that arise from coming together in person.",
    author: "Sue Mitchell",
    title: "Director",
    company: "Zixi",
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const changeTestimonial = (newIndex: number) => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsVisible(true);
    }, 1000); // 1 second fade out, then change
  };

  // Auto-advance testimonials every 2.5 seconds (plus 2s for transitions)
  useEffect(() => {
    const interval = setInterval(() => {
      changeTestimonial((currentIndex + 1) % testimonials.length);
    }, 4500); // 2.5s visible + 1s fade out + 1s fade in
    return () => clearInterval(interval);
  }, [currentIndex]);

  const nextTestimonial = () => {
    changeTestimonial((currentIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    changeTestimonial((currentIndex - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Quote icon */}
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <Quote className="w-8 h-8 text-primary" />
          </div>

          {/* Testimonial content */}
          <div className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <blockquote className="font-display text-2xl md:text-3xl lg:text-4xl leading-relaxed mb-10">
              "{current.quote}"
            </blockquote>

            {/* Author info */}
            <div className="mb-10">
              <p className="text-foreground font-body font-semibold text-lg">
                {current.author}
              </p>
              <p className="text-muted-foreground font-body">
                {current.title}, <span className="text-primary">{current.company}</span>
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="border-border hover:border-primary hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2 px-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-primary w-6"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="border-border hover:border-primary hover:text-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
