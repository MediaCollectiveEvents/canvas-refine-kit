import React from "react";
import PageSection from "@/components/shared/PageSection";
import SectionHeader from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";

// Events data (global list used across the site)
import eventsDataJson from "@/content/events.json";

interface EventsIntroSection {
  id: string;
  type: "eventsIntro";
  hidden?: boolean;
  title: string;
  accentWord?: string;
  body: string;
}

interface EventsListSection {
  id: string;
  type: "eventsList";
  hidden?: boolean;
}

interface JoinUsSection {
  id: string;
  type: "joinUs";
  hidden?: boolean;
  title: string;
  accentWord?: string;
  body: string;
  cta?: {
    label?: string;
    url?: string;
  };
}

type EventsSection = EventsIntroSection | EventsListSection | JoinUsSection;

interface EventsPageRendererProps {
  sections: EventsSection[];
  onRegister?: () => void; // ✅ NEW
}

interface EventsJsonFile {
  events: {
    id?: number;
    title: string;
    location: string;
    venue: string;
    date?: string;
    imageKey?: string;
  }[];
}

const eventsData = (eventsDataJson as EventsJsonFile).events ?? [];

/**
 * Simple formatter for event dates stored as YYYY-MM-DD
 */
function formatDate(dateString?: string) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

const EventsIntroBlock: React.FC<EventsIntroSection> = ({
  title,
  accentWord,
  body,
}) => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-3xl text-center">
        <SectionHeader title={title} accentWord={accentWord} />
        <p className="mt-4 text-muted-foreground font-body text-base leading-relaxed">
          {body}
        </p>
      </div>
    </section>
  );
};

const EventsListBlock: React.FC = () => {
  if (!eventsData.length) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-muted-foreground">
            There are currently no upcoming events. Please check back soon.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-5xl">
        <div className="grid gap-8 md:grid-cols-2">
          {eventsData.map((event) => (
            <article
              key={event.id ?? event.title}
              className="rounded-xl border border-border bg-background/60 backdrop-blur-sm p-6 flex flex-col justify-between hover:border-primary/60 transition-colors"
            >
              <div>
                <h3 className="font-display text-xl mb-2">{event.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {event.venue}
                  {event.location ? ` • ${event.location}` : ""}
                </p>
                {event.date && (
                  <p className="text-xs uppercase tracking-wide text-primary mb-2">
                    {formatDate(event.date)}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const JoinUsBlock: React.FC<JoinUsSection & { onRegister?: () => void }> = ({
  title,
  accentWord,
  body,
  cta,
  onRegister,
}) => {
  const handleClick = () => {
    if (onRegister) {
      // ✅ Prefer opening the registration modal if provided
      onRegister();
    } else if (cta?.url) {
      // Fallback: navigate to URL if no onRegister callback
      window.location.href = cta.url;
    }
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-3xl text-center">
        <SectionHeader title={title} accentWord={accentWord} />
        <p className="mt-4 text-muted-foreground font-body text-base leading-relaxed">
          {body}
        </p>

        {cta?.label && (
          <div className="mt-8">
            <Button
              size="lg"
              className="rounded-full font-body uppercase tracking-wider text-sm px-8"
              onClick={handleClick}
            >
              {cta.label}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

const EventsPageRenderer: React.FC<EventsPageRendererProps> = ({
  sections,
  onRegister,
}) => {
  const visibleSections = sections.filter((section) => !section.hidden);

  return (
    <>
      {visibleSections.map((section) => {
        switch (section.type) {
          case "eventsIntro":
            return (
              <PageSection key={section.id}>
                <EventsIntroBlock {...section} />
              </PageSection>
            );

          case "eventsList":
            return (
              <PageSection key={section.id}>
                <EventsListBlock />
              </PageSection>
            );

          case "joinUs":
            return (
              <PageSection key={section.id}>
                <JoinUsBlock {...section} onRegister={onRegister} />
              </PageSection>
            );

          default:
            return null;
        }
      })}
    </>
  );
};

export default EventsPageRenderer;
