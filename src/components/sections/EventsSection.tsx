import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock3, MapPin, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import SectionWrapper from "../layout/SectionWrapper";
import broadcasterImg from "@/assets/events/broadcaster.png";
import handandflowerImg from "@/assets/events/handandflower.png";
import travellerImg from "@/assets/events/traveller.png";
import { getEventCapacity, getUpcomingEvents } from "@/lib/events";

type Cta = { label?: string; url?: string };
interface EventsSectionProps {
  section?: { heading?: string; description?: string; note?: string; cta?: Cta; secondaryCta?: Cta };
  onRegisterClick?: () => void;
  underHeader?: boolean;
  imageAspect?: string;
  imageFit?: string;
  imagePadding?: boolean;
}
function getImageForKey(key?: string, venue?: string, title?: string) {
  const artwork: Record<string, string> = {
    "mpts-networking-reception-2027": "/uploads/Venue tiles/Handandflower.png",
    greenline: "/uploads/Venue tiles/Eurostar.png",
    "ibc-networking-breakfast-2027": "/uploads/Venue tiles/RAI.png",
    "ibc-decompression-party-2027": "/uploads/Venue tiles/Livepiano.png",
  };
  if (key && artwork[key]) return artwork[key];
  if (key === "off-air") return "/uploads/off-air.png";
  const value = (key || venue || title || "").toLowerCase();
  if (value.includes("greenline")) return artwork.greenline;
  if (value.includes("hand") && value.includes("flower")) return handandflowerImg;
  if (value.includes("traveller") || value.includes("traveler")) return travellerImg;
  return broadcasterImg;
}
function formatInternationalDate(input?: string) {
  if (!input) return "Date to be announced";
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? input : date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
export default function EventsSection(_props: EventsSectionProps) {
  const displayed = getUpcomingEvents().filter(event => !event.partnerEvent).slice(0, 1);
  const [invitationOpen, setInvitationOpen] = useState(false);
  return (
    <SectionWrapper variant="dark" padding="lux" className="border-b border-white/10 lg:!pb-12">
      <EventRegistrationForm attendanceOnly event={displayed[0]} open={invitationOpen} onOpenChange={setInvitationOpen} />
      {displayed.map(event => {
        const capacity = getEventCapacity(event);
        return (
        <article key={event.id} className="grid items-start gap-8 text-[#f7f3eb] md:grid-cols-[minmax(0,38fr)_minmax(0,62fr)] lg:grid-cols-[minmax(0,34fr)_minmax(0,66fr)] lg:gap-12">
          <figure className="w-full max-w-[440px] lg:max-w-[396px]">
            <img src={getImageForKey(event.imageKey, event.venue, event.title)} alt={event.imageKey === "off-air" ? "OFF AIR event artwork" : event.venue} className="aspect-square h-auto w-full rounded-xl object-contain" />
          </figure>
          <div className="min-w-0">
            <p className="mb-4 site-eyebrow text-[#8FC7C1]">NEXT EVENT</p>
            <h2 className="font-display text-3xl font-medium leading-tight md:text-4xl">{event.title}</h2>
            {event.imageKey === "off-air" && <ul aria-label="Event highlights" className="mt-4 flex flex-wrap gap-2 lg:flex-nowrap">
              {["DISCUSSION", "MEDIA TRENDS", "INDUSTRY LEADERS", ...(capacity ? [`${capacity} ATTENDEES`] : [])].map(label => <li key={label}><Badge variant="outline" className="whitespace-nowrap border-primary/20 bg-primary/10 px-2 py-1 font-display text-xs font-medium leading-5 tracking-wide text-[#9bd3c8]">{label}</Badge></li>)}
            </ul>}
            <div className="mt-5 max-w-[65ch] font-body text-base leading-relaxed text-[#f7f3eb]/90 md:text-lg">
              <p>{event.imageKey === "off-air" ? "Join broadcasters, streamers, publishers and technology leaders to examine the shifts shaping media in 2027." : event.summary || event.description}</p>
              <p className="mt-3 font-semibold text-[#f7f3eb]">Attendance is free but places are limited and invitations are carefully curated.</p>
            </div>
            <ul aria-label="Event details" className="mt-6 grid gap-4 rounded-xl border border-white/10 bg-white/5 p-4 font-body text-base font-medium sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              <li className="flex items-start gap-3"><CalendarDays aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#35C5BB]" /><time dateTime={event.date}>{formatInternationalDate(event.date)}</time></li>
              {event.time && <li className="flex items-start gap-3"><Clock3 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#35C5BB]" /><span>{event.time}</span></li>}
              {(event.venue || event.location) && <li className="flex items-start gap-3"><MapPin aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#35C5BB]" /><span>{[event.venue, event.location].filter(Boolean).join(", ")}</span></li>}
              <li className="flex items-start gap-3"><Ticket aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#35C5BB]" /><span>{event.imageKey === "off-air" && capacity ? `${capacity} Attendees` : "Curated Attendance"}</span></li>
            </ul>
            {event.imageKey === "off-air" &&
              <p className="mt-6 font-body text-lg font-semibold leading-relaxed">What changed in 2026? What matters in 2027? What's next for media?</p>
            }
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button variant="brand" size="lg" className="h-12 px-8 font-semibold transition-[background-color,transform] motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none" onClick={() => setInvitationOpen(true)}>Request an Invitation</Button>
              <Button asChild variant="outline" size="lg" className="h-12 rounded-full border-[#35C5BB]/40 bg-transparent px-6 font-medium text-[#8FC7C1] transition-[background-color,transform] motion-safe:hover:-translate-y-0.5 hover:bg-[#35C5BB]/10 hover:text-[#f7f3eb] motion-reduce:transform-none motion-reduce:transition-none"><Link to={`/events/${event.id}`}>Learn More</Link></Button>
            </div>
          </div>
        </article>
      ); })}
      {!displayed.length && <p className="text-slate-300">New event dates will be announced here.</p>}
    </SectionWrapper>
  );
}
