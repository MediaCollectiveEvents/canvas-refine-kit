import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionWrapper from "../layout/SectionWrapper";
import broadcasterImg from "@/assets/events/broadcaster.png";
import handandflowerImg from "@/assets/events/handandflower.png";
import travellerImg from "@/assets/events/traveller.png";
import greenlineImg from "@/assets/events/greenline.png";
import { getUpcomingEvents, getPastEvents } from "@/lib/events";

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
  if (key === "off-air") return "/uploads/off-air.png";
  const value = (key || venue || title || "").toLowerCase();
  if (value.includes("greenline")) return greenlineImg;
  if (value.includes("hand") && value.includes("flower")) return handandflowerImg;
  if (value.includes("traveller") || value.includes("traveler")) return travellerImg;
  return broadcasterImg;
}
function formatInternationalDate(input?: string) {
  if (!input) return "Date to be announced";
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? input : date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
export default function EventsSection({ section, onRegisterClick }: EventsSectionProps) {
  const upcoming = getUpcomingEvents();
  const displayed = upcoming.length ? upcoming.slice(0, 3) : getPastEvents().slice(0, 3);
  const [openShareId, setOpenShareId] = useState<number | null>(null);
  const listing = section?.secondaryCta?.url === "/events" ? section.secondaryCta : section?.cta;
  return (
    <SectionWrapper variant="dark" padding="lux" className="border-b border-white/10">
      <div className="mb-10 md:mb-12">
        <div className="grid items-end gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <span aria-hidden="true" className="mb-5 block h-0.5 w-12 bg-[#35C5BB]" />
            <p className="mb-3 site-eyebrow text-[#8FC7C1]">The event calendar</p>
            <h2 className="site-heading !font-medium text-[#f7f3eb]">{upcoming.length ? section?.heading || "Upcoming events" : "Recent gatherings"}</h2>
          </div>
          {listing?.url && listing.url !== "/register" && <a href={listing.url} className="hidden text-sm font-medium text-[#35C5BB] underline decoration-[#35C5BB]/50 underline-offset-8 transition-colors hover:text-[#8FC7C1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C5BB] sm:block">View all events <span aria-hidden="true">→</span></a>}
        </div>
        <p className="mt-4 max-w-[65ch] text-base leading-[1.5] text-[#f7f3eb]/75">{upcoming.length ? section?.description : "Explore our recent events while the next gatherings are being planned."}</p>
        {listing?.url && listing.url !== "/register" && <a href={listing.url} className="mt-5 inline-block text-sm font-medium text-[#35C5BB] underline decoration-[#35C5BB]/50 underline-offset-8 transition-colors hover:text-[#8FC7C1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C5BB] sm:hidden">View all events <span aria-hidden="true">→</span></a>}
      </div>
      <div className="grid gap-12 lg:gap-16">
        {displayed.map(event => {
          const shareOpen = openShareId === event.id;
          const shareText = encodeURIComponent(`${event.title} — ${formatInternationalDate(event.date)}. ${new URL(`/events/${event.id}`, window.location.origin).href}`);
          return <article key={event.id} className="grid items-center gap-8 text-[#f7f3eb] md:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] md:gap-10 lg:gap-12 xl:gap-16">
            <img src={getImageForKey(event.imageKey, event.venue, event.title)} alt={event.imageKey === "off-air" ? "OFF AIR event artwork" : event.venue} className="aspect-square h-auto w-full max-w-[460px] object-contain" />
            <div className="min-w-0">
              <p className="text-base font-medium text-[#35C5BB]">{formatInternationalDate(event.date)}</p>
              <h3 className="mt-3 font-display text-[28px] font-medium leading-tight md:text-[32px]">{event.title}</h3>
              <div className="mt-5 text-sm leading-[1.5] text-[#f7f3eb]/75">
                {event.time && <p>{event.time}</p>}
                <p className="mt-1">{event.venue} · {event.location}</p>
              </div>
              <p className="mt-6 max-w-[55ch] text-base leading-[1.5] text-[#f7f3eb]/75">{event.summary || event.description}</p>
              {event.details && <details className="mt-5"><summary className="cursor-pointer text-sm font-medium text-[#8FC7C1]">What to expect<span className="sr-only"> at {event.title}</span></summary><p className="mt-3 text-sm leading-[1.5]">{event.details}</p></details>}
              <div className="mt-7 flex items-center justify-between gap-4">
                <a href={`/events/${event.id}`} className="text-base font-medium text-[#35C5BB] underline decoration-[#35C5BB]/50 underline-offset-8 transition-colors hover:text-[#8FC7C1] hover:decoration-[#8FC7C1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C5BB]">View event <span aria-hidden="true">→</span></a>
                <button type="button" aria-label={`Share ${event.title}`} aria-expanded={shareOpen} aria-controls={`event-share-${event.id}`} onClick={() => setOpenShareId(shareOpen ? null : event.id)} className="inline-flex items-center gap-2 text-xs text-[#f7f3eb]/75 hover:text-[#35C5BB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C5BB]"><Share2 size={14} aria-hidden="true" />{shareOpen ? "Close" : "Share"}</button>
              </div>
              {shareOpen && <div id={`event-share-${event.id}`} className="mt-4 flex gap-4 text-sm"><a href={`mailto:?subject=${encodeURIComponent(event.title)}&body=${shareText}`}>Email</a><a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer">WhatsApp</a></div>}
            </div>
          </article>;
        })}
      </div>
      {!displayed.length && <p className="text-slate-300">New event dates will be announced here.</p>}
      {section?.note && <p className="mt-8 text-sm text-slate-300">{section.note}</p>}
      {section?.cta?.url === "/register" && onRegisterClick && <Button variant="brand" onClick={onRegisterClick} className="mt-6">{section.cta.label}</Button>}
    </SectionWrapper>
  );
}
