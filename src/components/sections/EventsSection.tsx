import { useState } from "react";
import { CalendarDays, Clock, MapPin, Share2 } from "lucide-react";
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
  const value = (key || venue || title || "").toLowerCase();
  if (value.includes("greenline")) return greenlineImg;
  if (value.includes("hand") && value.includes("flower")) return handandflowerImg;
  if (value.includes("traveller") || value.includes("traveler")) return travellerImg;
  return broadcasterImg;
}

function formatInternationalDate(input?: string) {
  if (!input) return "Date to be announced";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default function EventsSection({ section, onRegisterClick }: EventsSectionProps) {
  const upcoming = getUpcomingEvents();
  const displayedEvents = upcoming.length ? upcoming.slice(0, 3) : getPastEvents().slice(0, 3);
  const [openShareId, setOpenShareId] = useState<number | null>(null);

  function renderCta(cta?: Cta, secondary = false) {
    if (!cta?.label || !cta.url) return null;
    if (cta.url === "/register") return onRegisterClick ? <Button variant={secondary ? "textcta" : "brand"} size={secondary ? "text" : "default"} onClick={onRegisterClick}>{cta.label}</Button> : null;
    return <Button asChild variant={secondary ? "textcta" : "brand"} size={secondary ? "text" : "default"}><a href={cta.url}>{cta.label}</a></Button>;
  }

  return (
    <SectionWrapper variant="transparent" align="left" padding="lux" className="text-slate-900">
      <div className="mb-9 max-w-2xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">The event calendar</p>
        <h2 className="font-display text-3xl font-light leading-tight tracking-tight md:text-4xl">{upcoming.length ? section?.heading || "Upcoming events" : "Recent gatherings"}</h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600">{upcoming.length ? section?.description || "Bringing peers together across media and technology." : "Explore our recent events while the next gatherings are being planned."}</p>
      </div>
      <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
        {displayedEvents.map(event => {
          const summary = event.summary || event.description;
          const shareOpen = openShareId === event.id;
          const chips = [event.format, event.inviteOnly === true ? "Invite-only" : null, event.complimentary === true ? "Complimentary" : null, event.conferenceAligned ? "Conference week" : null].filter(Boolean);
          const shareText = encodeURIComponent(`${event.title} — ${formatInternationalDate(event.date)}${event.time ? `, ${event.time}` : ""}. ${event.venue}, ${event.location}. ${new URL("/events", window.location.origin).href}`);
          return (
            <article key={event.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="flex aspect-[16/9] items-center justify-center border-b border-slate-200 bg-[#edf0ed] p-5">
                <img src={getImageForKey(event.imageKey, event.venue, event.title)} alt={event.venue} loading="lazy" className="h-full w-full object-contain" />
              </div>
              <div className="p-6">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-teal-700">{isPastEvent(event) ? "Past event" : "Upcoming gathering"}</p>
                <h3 className="font-display text-2xl font-light leading-tight text-slate-900"><a href={`/events/${event.id}`}>{event.title}</a></h3>
                <dl className="my-4 space-y-2 border-t border-slate-200 pt-3 md:my-5 md:space-y-3 md:pt-4 text-sm text-slate-700">
                  <div className="flex gap-3"><dt><CalendarDays aria-hidden="true" size={16} /><span className="sr-only">Date</span></dt><dd>{formatInternationalDate(event.date)}</dd></div>
                  {event.time && <div className="flex gap-3"><dt><Clock aria-hidden="true" size={16} /><span className="sr-only">Time</span></dt><dd>{event.time}</dd></div>}
                  <div className="flex gap-3"><dt><MapPin aria-hidden="true" size={16} /><span className="sr-only">Venue and location</span></dt><dd><span className="font-medium">{event.venue}</span><span className="mt-1 block text-slate-500">{event.location}</span></dd></div>
                </dl>
                {summary && <p className="text-sm leading-[1.8] text-slate-600">{summary}</p>}
                {chips.length > 0 && <ul className="mt-4 flex flex-wrap gap-2">{chips.map(chip => <li key={chip} className="rounded-sm bg-slate-100 px-2 py-1 text-xs text-slate-600">{chip}</li>)}</ul>}
                {event.details && (
                  <details className="mt-4 md:mt-5">
                    <summary className="cursor-pointer text-sm font-semibold text-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700">What to expect<span className="sr-only"> at {event.title}</span></summary>
                    <p className="mt-3 text-sm leading-[1.8] text-slate-600">{event.details}</p>
                  </details>
                )}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4">
                  <Button asChild variant="ghost" size="text"><a href="/events">Explore events <span aria-hidden="true">→</span></a></Button>
                  <button type="button" aria-label={`Share ${event.title}`} aria-expanded={shareOpen} aria-controls={`event-share-${event.id}`} onClick={() => setOpenShareId(shareOpen ? null : event.id)} className="inline-flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900"><Share2 size={14} aria-hidden="true" />{shareOpen ? "Close" : "Share"}</button>
                </div>
                {shareOpen && <div id={`event-share-${event.id}`} className="mt-4 flex gap-4 rounded-sm bg-slate-100 p-3 text-sm text-teal-800">
                  <a href={`mailto:?subject=${encodeURIComponent(`Event: ${event.title}`)}&body=${shareText}`} aria-label={`Share ${event.title} via email`} className="hover:underline">Email</a>
                  <a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer" aria-label={`Share ${event.title} via WhatsApp`} className="hover:underline">WhatsApp</a>
                </div>}
              </div>
            </article>
          );
        })}
      </div>
      {!displayedEvents.length && <p className="mt-6 text-slate-600">New event dates will be announced here.</p>}
      {section?.note && <p className="mt-8 text-sm text-slate-600">{section.note}</p>}
      <div className="mt-6 flex flex-wrap gap-3">{renderCta(section?.cta)}{section?.secondaryCta?.url !== section?.cta?.url && renderCta(section?.secondaryCta, true)}</div>
    </SectionWrapper>
  );
}
