import { useState } from "react";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import { Button } from "@/components/ui/button";
import { getUpcomingEvents } from "@/lib/events";

export default function AttendanceCTA({ calendarContext = false }: { calendarContext?: boolean }) {
  const [open, setOpen] = useState(false);
  const [nextEvent] = getUpcomingEvents(1);

  return (
    <>
      <EventRegistrationForm attendanceOnly event={nextEvent} preselectedEvent={nextEvent ? undefined : "all-events"} open={open} onOpenChange={setOpen} />
      <section className="site-section border-b border-white/10 bg-[#172b31]">
        <div className="site-container grid items-start gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h2 className="font-display text-[30px] font-light leading-tight text-white md:text-4xl">{nextEvent ? calendarContext ? "Want to attend a Media Collective event?" : "Want to attend our next event?" : "Interested in a future event?"}</h2>
            <p className="mt-5 max-w-2xl font-body text-base leading-[1.8] text-slate-300">Request an invitation to a Media Collective event. Attendance is subject to event curation; our events are free to attend.</p>
          </div>
          <div className="lg:col-span-4 lg:justify-self-end">
            <Button variant="brand" size="lg" onClick={() => setOpen(true)}>Request an invitation</Button>
          </div>
        </div>
      </section>
    </>
  );
}
