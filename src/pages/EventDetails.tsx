import EventCalendarControl from "@/components/shared/EventCalendarControl";
import Seo from "@/components/shared/Seo";
// src/pages/EventDetails.tsx
import { Link, useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import { EVENT_EXPERIENCE_LABELS, formatEventDate, getEventById, isPastEvent } from "@/lib/events";
import { getEventIndustryContext, MEDIA_COLLECTIVE_PLANNER_CITIES } from "@/lib/industryEvents";

// Exact, reviewed logistics fragments from the four current records.
// Keep the canonical copy intact; do not infer programme lists from prose.
const storyLogistics: Record<number, string[]> = {
  1: [" at The Broadcaster, White City, London", "Wednesday 6 May 2026, 9:30 AM–12:00 PM, at The Broadcaster, White City, London. "],
  2: [" at The Hand & Flower, Olympia, London", "Wednesday 13 May 2026, 5:00 PM–9:00 PM, at The Hand & Flower, Olympia, London. "],
  3: [" at The Traveller, Amsterdam", " at The Traveller", "Saturday 12 September 2026, 8:00 AM–10:00 AM CEST, at The Traveller, 2 Europaplein, 1078 GZ Amsterdam. "],
  4: ["24 November 2026, 15:00–18:00, at The Broadcaster, White City, London. "],
};

function storyCopy(copy: string | undefined, id: number): string {
  return [...(storyLogistics[id] ?? [])].sort((a, b) => b.length - a.length).reduce((text, fragment) => text.replace(fragment, ""), copy ?? "");
}

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();

  // Resolve the stable numeric ID or an explicitly registered route alias.
  const event = getEventById(id);

  if (!event) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Seo title="Event Not Found — The Media Collective" />
        <Header />
        <main className="max-w-5xl mx-auto px-6 py-24">
          <h1 className="text-3xl font-display mb-4">Event Not Found</h1>
          <p className="text-muted-foreground">
            We couldn’t find an event matching
            <span className="font-mono"> {id}</span>.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const industryContext = getEventIndustryContext(event.id);

  return (
    <div className="min-h-screen bg-[#101d24] text-foreground">
      <Seo title={`${event.title} — The Media Collective`} description={event.summary || event.description} url={`/events/${event.id}`} />
      <Header />

      <main className="px-6 pb-16 pt-32 md:pb-24 md:pt-40 font-body">
        <div className="container mx-auto max-w-6xl">
        <header className="mb-10 md:mb-14">
          <div className="mb-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span className="text-primary">{isPastEvent(event) ? "Past event" : "Upcoming event"}</span>
            {event.experienceCategories?.map(category => <span key={category}>{EVENT_EXPERIENCE_LABELS[category]}</span>)}
          </div>
          <h1 className="max-w-4xl break-words font-display text-3xl font-light leading-tight md:text-5xl">{event.title}</h1>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <p><time dateTime={event.date}>{formatEventDate(event.date)}</time>{event.time && ` · ${event.time}`}</p>
            <p>{[event.venue, MEDIA_COLLECTIVE_PLANNER_CITIES[event.id]].filter(Boolean).join(" · ")}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <article className="min-w-0 lg:col-span-8">
            {event.summary && <p className="max-w-2xl text-xl leading-relaxed md:text-2xl">{storyCopy(event.summary, event.id)}</p>}
            {event.description && event.description !== event.summary && <section className="mt-8 md:mt-10">
              <h2 className="mb-3 font-display text-2xl font-light">About this gathering</h2>
              <p className="max-w-2xl text-base leading-relaxed text-foreground/80">{storyCopy(event.description, event.id)}</p>
            </section>}
            {event.details && <section className="mt-8 md:mt-10">
              <h2 className="mb-3 font-display text-2xl font-light">What to expect</h2>
              <p className="max-w-2xl whitespace-pre-line text-base leading-relaxed text-foreground/80">{storyCopy(event.details, event.id)}</p>
            </section>}
          </article>

          <aside aria-label="Event planning" className="min-w-0 lg:col-span-4">
            <h2 className="mb-5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Plan your visit</h2>
            <dl className="space-y-4 text-sm leading-relaxed">
              <div><dt className="text-muted-foreground">Date and time</dt><dd className="mt-1">{formatEventDate(event.date)}{event.time && <span className="block">{event.time}</span>}</dd></div>
              <div><dt className="text-muted-foreground">Venue</dt><dd className="mt-1">{event.venue}{MEDIA_COLLECTIVE_PLANNER_CITIES[event.id] && <span className="block">{MEDIA_COLLECTIVE_PLANNER_CITIES[event.id]}</span>}</dd></div>
            </dl>
            <div className="mt-5 flex flex-col items-start gap-3">
              <EventCalendarControl event={event} />
              <Link to="/events/calendar" className="text-sm underline underline-offset-4 decoration-primary hover:text-primary">View year planner →</Link>
            </div>
          </aside>
        </div>
        {industryContext && <section aria-label={industryContext.label} className="mt-10 max-w-2xl md:mt-12">
          <h2 className="mb-3 font-display text-2xl font-light">{industryContext.label}</h2>
          <p className="text-base leading-relaxed text-foreground/80">
            {industryContext.event.name}
            {industryContext.event.city && ` · ${industryContext.event.city}`}
            {industryContext.event.startDate && ` · ${formatEventDate(industryContext.event.startDate)}`}
            {industryContext.event.endDate && industryContext.event.endDate !== industryContext.event.startDate && ` – ${formatEventDate(industryContext.event.endDate)}`}
          </p>
          <a href={industryContext.event.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm underline underline-offset-4 decoration-primary hover:text-primary">
            Official information for {industryContext.event.name} ↗
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </section>}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventDetails;
