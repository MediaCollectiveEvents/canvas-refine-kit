import { CalendarPlus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { getEventCalendar } from "@/lib/eventCalendar";
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

  const calendar = getEventCalendar(event);
  const downloadCalendar = () => {
    if (!calendar) return;
    const url = URL.createObjectURL(new Blob([calendar.ics], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = calendar.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

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

        {calendar && (
          <div className="mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full font-body text-sm focus-visible:ring-2 focus-visible:ring-primary">
                  <CalendarPlus aria-hidden="true" className="h-4 w-4" />
                  Add to calendar
                  <ChevronDown aria-hidden="true" className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-w-[calc(100vw-48px)] bg-[var(--popover)] font-body">
                <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white">
                  <a href={calendar.googleUrl} target="_blank" rel="noopener noreferrer" aria-label="Add event to Google Calendar (opens in a new tab)">Google Calendar</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white">
                  <a href={calendar.outlookUrl} target="_blank" rel="noopener noreferrer" aria-label="Add event to Outlook Calendar (opens in a new tab)">Outlook Calendar</a>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white" onSelect={downloadCalendar} aria-label="Download event calendar file for Apple and other calendars">Apple &amp; other calendars (.ics)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

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
