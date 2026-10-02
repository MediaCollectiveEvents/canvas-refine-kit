import EventCalendarControl from "@/components/shared/EventCalendarControl";
import Seo from "@/components/shared/Seo";
// src/pages/EventDetails.tsx
import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import { getEventById } from "@/lib/events";

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo title={`${event.title} — The Media Collective`} description={event.summary || event.description} url={`/events/${event.id}`} />
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-24">
        {/* Title */}
        <h1 className="text-4xl font-display mb-4">
          {event.title ?? "Untitled Event"}
        </h1>

        {/* Meta: date & location */}
        {(event.date || event.location) && (
          <p className="text-muted-foreground mb-6">
            {event.date || ""}
            {event.location ? ` · ${event.location}` : ""}
          </p>
        )}

        <div className="mb-6">
          <EventCalendarControl event={event} />
        </div>

        {/* Summary */}
        {event.summary && (
          <p className="text-lg font-body leading-relaxed">{event.summary}</p>
        )}

        {event.description && event.description !== event.summary && (
          <p className="mt-6 font-body leading-relaxed">{event.description}</p>
        )}
        {event.details && (
          <p className="mt-6 whitespace-pre-line font-body leading-relaxed">{event.details}</p>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default EventDetails;
