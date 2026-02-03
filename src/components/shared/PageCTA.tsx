import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PageCTAProps {
  title?: string;
  accentWord?: string;
  description?: string;
  buttonLabel?: string;
  onClick?: () => void;
  className?: string;
}

export default function PageCTA({
  title = "Ready to",
  accentWord = "Join Us?",
  description = "Be part of the next generation of media industry connections. Our events are free, invite-only, and designed for high-value networking.",
  buttonLabel = "Register Your Interest",
  onClick,
  className,
}: PageCTAProps) {
  return (
    <section
      className={cn(
        "py-24 md:py-32 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden px-6",
        className,
      )}
    >
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 via-background to-primary/5 rounded-3xl border border-primary/20 p-16 md:p-20">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mb-8 leading-tight">
            {title}{" "}
            {accentWord && <span className="text-primary">{accentWord}</span>}
          </h2>

          <p className="text-muted-foreground font-body text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            {description}
          </p>

          <Button
            type="button"
            size="lg"
            className="rounded-full font-body uppercase tracking-wider text-sm bg-primary text-primary-foreground hover:bg-primary/90 px-8"
            onClick={onClick}
          >
            {buttonLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
