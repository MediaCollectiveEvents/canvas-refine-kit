import ClosingCTA from "./ClosingCTA";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { EventRegistrationForm } from "@/components/shared/LazyEnquiryForms";
import { Button } from "@/components/ui/button";
import { getUpcomingEvents } from "@/lib/events";

export default function AttendanceCTA({ calendarContext = false }: { calendarContext?: boolean }) {
  const [open, setOpen] = useState(false);
  const [nextEvent] = getUpcomingEvents(1);
  const isHomepage = useLocation().pathname === "/";

  return (
    <>
      <EventRegistrationForm attendanceOnly event={nextEvent} preselectedEvent={nextEvent ? undefined : "all-events"} open={open} onOpenChange={setOpen} />
      <ClosingCTA
        heading={isHomepage ? "Come to our next event" : nextEvent ? calendarContext ? "Want to attend a Media Collective event?" : "Want to attend our next event?" : "Interested in a future event?"}
        support={<p>{isHomepage ? "Attendance is curated, and our events are free to attend." : "Request an invitation to a Media Collective event. Attendance is subject to event curation; our events are free to attend."}</p>}
        action={<Button variant="brand" size="lg" onClick={() => setOpen(true)}>Request an invitation</Button>}
      />
    </>
  );
}
