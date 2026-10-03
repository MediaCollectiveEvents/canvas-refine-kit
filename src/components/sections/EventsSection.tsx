import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionWrapper from "../layout/SectionWrapper";
import broadcasterImg from "@/assets/events/broadcaster.png";
import handandflowerImg from "@/assets/events/handandflower.png";
import travellerImg from "@/assets/events/traveller.png";
import greenlineImg from "@/assets/events/greenline.png";
import { getUpcomingEvents, getPastEvents, isPastEvent } from "@/lib/events";

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
    <SectionWrapper variant="light" padding="lux" className="!pt-8 !pb-12 md:!py-[60px] lg:!py-[72px]">
      <div className="mb-10 grid gap-5 lg:grid-cols-12 lg:gap-10 lg:items-end">
        <div className="lg:col-span-4"><span aria-hidden="true" className="mb-5 block h-px w-12 bg-[#27CDBA]" /><p className="mb-3 site-eyebrow text-slate-500">The event calendar</p><h2 className="site-heading text-slate-900">{upcoming.length ? section?.heading || "Upcoming events" : "Recent gatherings"}</h2><p className="mt-4 text-base leading-relaxed text-slate-600">{upcoming.length ? section?.description : "Explore our recent events while the next gatherings are being planned."}</p></div>
        {listing?.url && listing.url !== "/register" && <Button asChild variant="textcta" size="text" className="!text-teal-800 lg:col-span-8 lg:justify-self-end"><a href={listing.url}>{listing.label}</a></Button>}
      </div>
      <div className="grid items-start gap-10 lg:grid-cols-12">
        {displayed.map((event, index) => {
          const featured = index === 0;
          const shareOpen = openShareId === event.id;
          const shareText = encodeURIComponent(`${event.title} — ${formatInternationalDate(event.date)}. ${new URL(`/events/${event.id}`, window.location.origin).href}`);
          return <article key={event.id} className={featured ? "text-slate-900 lg:col-span-8 lg:row-span-2" : "text-slate-900 lg:col-span-4"}>
            {featured && <div className="flex aspect-[2/1] md:aspect-[2/1] items-center justify-center "><img src={getImageForKey(event.imageKey, event.venue, event.title)} alt={event.venue} className="h-full w-full object-contain" /></div>}
            <div className={featured ? "mt-4" : ""}>
              <p className={`mb-3 text-xs uppercase tracking-[0.14em] ${"text-slate-500"}`}>{isPastEvent(event) ? "Past event" : "Upcoming gathering"}</p>
              <h3 className={`font-display leading-tight ${featured ? "text-[30px] font-light md:text-4xl" : "text-xl font-medium md:text-2xl"}`}><a href={`/events/${event.id}`}>{event.title}</a></h3>
              <p className={`mt-3 text-sm ${"text-slate-600"}`}>{formatInternationalDate(event.date)}{event.time ? ` · ${event.time}` : ""}</p>
              <p className={`mt-1 text-sm ${"text-slate-600"}`}>{event.venue} · {event.location}</p>
              <p className={`mt-5 text-base leading-relaxed ${"text-slate-600"}`}>{event.summary || event.description}</p>
              {event.details && <details className="mt-5"><summary className={`cursor-pointer text-sm font-medium ${"text-teal-800"}`}>What to expect<span className="sr-only"> at {event.title}</span></summary><p className="mt-3 text-sm leading-relaxed">{event.details}</p></details>}
              <div className="mt-6 flex items-center justify-between gap-4"><a href={`/events/${event.id}`} className={`text-sm underline underline-offset-4 ${"text-teal-800"}`}>Event details <span aria-hidden="true">→</span></a><button type="button" aria-label={`Share ${event.title}`} aria-expanded={shareOpen} aria-controls={`event-share-${event.id}`} onClick={() => setOpenShareId(shareOpen ? null : event.id)} className="inline-flex items-center gap-2 text-xs"><Share2 size={14} aria-hidden="true" />{shareOpen ? "Close" : "Share"}</button></div>
              {shareOpen && <div id={`event-share-${event.id}`} className="mt-4 flex gap-4 text-sm"><a href={`mailto:?subject=${encodeURIComponent(event.title)}&body=${shareText}`}>Email</a><a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer">WhatsApp</a></div>}
            </div>
          </article>;
        })}
      </div>
      {!displayed.length && <p className="text-slate-600">New event dates will be announced here.</p>}
      {section?.note && <p className="mt-8 text-sm text-slate-600">{section.note}</p>}
      {section?.cta?.url === "/register" && onRegisterClick && <Button variant="brand" onClick={onRegisterClick} className="mt-6">{section.cta.label}</Button>}
    </SectionWrapper>
  );
}
