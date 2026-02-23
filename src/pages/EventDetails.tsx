// src/pages/EventDetails.tsx
import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Event type (you can expand this as your schema grows)
type EventItem = {
  slug?: string;
  id?: string;
  title?: string;
  date?: string;
  location?: string;
  summary?: string;
  body?: string;
};

// Load all event JSON files from src/content/events/*.json
// NOTE: This must be at the top level (not inside the component).
const eventModules = import.meta.glob("../content/events/*.json", {
  eager: true,
}) as Record<string, { default: EventItem }>;

// Normalise into an array of events, deriving slug from filename if missing.
const events: EventItem[] = Object.entries(eventModules).map(([path, mod]) => {
  const data = { ...mod.default };

  if (!data.slug) {
    // Derive slug from filename (e.g. "networking-breakfast" from ".../networking-breakfast.json")
    const match = path.match(/\/([^/]+)\.json$/);
    if (match) {
      data.slug = match[1];
    }
  }

  return data;
});

const EventDetails = () => {
  const { eventId } = useParams<{ eventId: string }>();

  // Find the event by slug (or id as a fallback)
  const event = events.find((ev) => ev.slug === eventId || ev.id === eventId);

  if (!event) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="max-w-5xl mx-auto px-6 py-24">
          <h1 className="text-3xl font-display mb-4">Event Not Found</h1>
          <p className="text-muted-foreground">
            We couldn’t find an event matching
            <span className="font-mono"> {eventId}</span>.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
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

        {/* Summary */}
        {event.summary && (
          <p className="text-lg font-body leading-relaxed">{event.summary}</p>
        )}

        {/* Optional full HTML body (if you add it later) */}
        {event.body && (
          <article
            className="prose prose-invert max-w-none mt-10"
            dangerouslySetInnerHTML={{ __html: event.body }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default EventDetails;
