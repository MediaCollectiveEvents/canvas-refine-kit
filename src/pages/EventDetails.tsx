import { getOffAirUpcomingEvents, isOffAir } from "@/lib/offAirEditorial";
import { isMptsReception } from "@/components/shared/MptsEditorial";
import Seo from "@/components/shared/Seo";
import { eventSeo, errorSeo } from "@/lib/pageSeo";
// src/pages/EventDetails.tsx
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { EventRegistrationForm } from "@/components/shared/LazyEnquiryForms";
import EventPageTemplate from "@/components/shared/EventPageTemplate";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import { EVENT_EXPERIENCE_LABELS, formatEventDate, getEventById, getRelatedEvents, getUpcomingEvents, isPastEvent } from "@/lib/events";
import { getEventIndustryContext } from "@/lib/industryEvents";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Resolve the stable numeric ID or an explicitly registered route alias.
  const event = getEventById(id);

  if (!event) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Seo {...errorSeo(true)} />
        <Header />
        <main className="site-gutter site-header-clearance pb-16"><div className="site-container py-8">
          <h1 className="site-page-h1 mb-4 break-words font-display text-3xl font-light md:text-5xl">Event not found</h1>
          <p className="text-muted-foreground">
            We couldn’t find this event. Browse the programme to find another gathering.
          </p>
          <div className="mt-6 flex flex-wrap gap-6 font-display text-base text-primary">
            <Link to="/events" className="site-secondary-action">Browse events</Link>
            <Link to="/" className="site-secondary-action">Home</Link>
          </div>
        </div></main>
        <Footer hideAttendanceCTA />
      </div>
    );
  }

  // Only the two confirmed recurring event pairs have edition relationships.
  const editionIds: Record<number, number> = { 2: 5, 3: 6, 5: 2, 6: 3 };
  const edition = getEventById(editionIds[event.id]);
  const editionLabel = edition && edition.date > event.date ? "Next edition" : "Previous edition";
  const industryContext = getEventIndustryContext(event.id);
  const mpts = isMptsReception(event);
  const upcomingLabel = isOffAir(event) || mpts;
  // Apply eligibility before the helper ranks and limits candidates.
  const relatedEvents = isOffAir(event) ? getOffAirUpcomingEvents() : getRelatedEvents(event, {
    events: getUpcomingEvents().filter(candidate => Number.isFinite(Date.parse(candidate.date))),
  }).filter(related => related.id !== edition?.id);

  return (
    <div className="min-h-screen bg-[#101d24] text-foreground">
      <Seo {...eventSeo(event)} />
      <Header />
      {!event.partnerEvent && <EventRegistrationForm attendanceOnly event={event} open={isFormOpen} onOpenChange={setIsFormOpen} />}

      <main className="site-header-clearance font-body">
        <EventPageTemplate event={event} onRequest={() => setIsFormOpen(true)} context={<>
        {edition && <nav aria-label="Event editions" className="mt-10 md:mt-12">
          <Link to={`/events/${edition.id}`} className="text-base underline decoration-primary underline-offset-4 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{editionLabel}: {edition.title}</Link>
        </nav>}
        {!mpts && industryContext && <section aria-label={industryContext.label} className="mt-10 max-w-2xl md:mt-12">
          <h2 className="mb-3 font-display text-2xl font-light">{industryContext.label}</h2>
          <p className="text-base leading-relaxed text-foreground/80">
            {industryContext.event.name}
            {industryContext.event.city && ` · ${industryContext.event.city}`}
            {industryContext.event.startDate && ` · ${formatEventDate(industryContext.event.startDate)}`}
            {industryContext.event.endDate && industryContext.event.endDate !== industryContext.event.startDate && ` – ${formatEventDate(industryContext.event.endDate)}`}
          </p>
          <a href={industryContext.event.sourceUrl} target="_blank" rel="noopener noreferrer" className="site-secondary-action mt-2">
            Official information for {industryContext.event.name} ↗
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </section>}
        {relatedEvents.length > 0 && <section aria-label={upcomingLabel ? "Other Upcoming Events" : "Related events"} className={mpts ? "border-t border-white/10 py-8 md:py-10" : "mt-10 max-w-2xl md:mt-12"}>
          <h2 className={`font-display text-2xl font-light ${mpts ? "mb-5 md:text-3xl" : "mb-3"}`}>{upcomingLabel ? "Other Upcoming Events" : "Related events"}</h2>
          {!upcomingLabel && <p className="text-base text-muted-foreground">Other gatherings you may enjoy.</p>}
          <ul className="mt-5 space-y-6">
            {relatedEvents.map(related => <li key={related.id}>
              <h3 className="text-lg font-medium leading-relaxed"><Link to={`/events/${related.id}`} className="underline underline-offset-4 decoration-primary hover:text-primary">{related.title}</Link></h3>
              <p className="mt-2 text-base text-foreground/80"><time dateTime={related.date}>{formatEventDate(related.date)}</time> · {isPastEvent(related) ? "Past event" : "Upcoming event"}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{related.experienceCategories?.map(category => EVENT_EXPERIENCE_LABELS[category]).join(" · ")}</p>
            </li>)}
          </ul>
        </section>}
        {relatedEvents.length === 0 && <div className="mt-10 md:mt-12">
          <Link to="/events" className="site-secondary-action">Browse all events</Link>
        </div>}
        </>} />
      </main>

      <Footer />
    </div>
  );
};

export default EventDetails;
