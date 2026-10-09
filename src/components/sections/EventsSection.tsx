import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import SectionWrapper from "../layout/SectionWrapper";
import broadcasterImg from "@/assets/events/broadcaster.png";
import handandflowerImg from "@/assets/events/handandflower.png";
import travellerImg from "@/assets/events/traveller.png";
import { getEventCountdownDays, getLondonCalendarDate, getUpcomingEvents } from "@/lib/events";

type Cta = { label?: string; url?: string };
const textAction = "font-display inline-flex min-h-11 items-center text-base font-medium text-[#35C5BB] no-underline transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";
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
  const [now, setNow] = useState(() => new Date());
  const displayed = getUpcomingEvents(1, undefined, now);
  useEffect(() => {
    // Refresh once at London's next midnight; no ticking or animated countdown.
    const current = new Date();
    const offset = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London", timeZoneName: "shortOffset",
    }).formatToParts(current).find(part => part.type === "timeZoneName")?.value;
    const nextMidnight = Date.parse(`${getLondonCalendarDate(current)}T00:00:00Z`)
      + 86_400_000 - (offset === "GMT+1" ? 3_600_000 : 0);
    const timer = window.setTimeout(() => setNow(new Date()), Math.max(1, nextMidnight - current.getTime()));
    const refresh = () => { if (!document.hidden) setNow(new Date()); };
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [now]);
  const [invitationOpen, setInvitationOpen] = useState(false);
  const days = displayed[0] ? getEventCountdownDays(displayed[0].date, now) : undefined;
  return (
    <SectionWrapper variant="dark" padding="lux" className="border-b border-white/10">
      <EventRegistrationForm attendanceOnly event={displayed[0]} open={invitationOpen} onOpenChange={setInvitationOpen} />
      <h2 className="mb-7 site-heading !font-medium text-[#f7f3eb] md:mb-8">
        Next event{days === undefined ? "" : days === 0 ? " today" : days === 1 ? " tomorrow" : <> in <span className="text-[#35C5BB]">{days}</span> days</>}
      </h2>
      <div>
        {displayed.map(event => {
          return <article key={event.id} className="grid items-center gap-6 text-[#f7f3eb] md:items-start md:grid-cols-[minmax(0,38fr)_minmax(0,62fr)] md:gap-6 lg:gap-12">
            <figure className="w-full max-w-[440px]">
              <img src={getImageForKey(event.imageKey, event.venue, event.title)} alt={event.imageKey === "off-air" ? "OFF AIR event artwork" : event.venue} className="aspect-square h-auto w-full rounded-xl object-contain" />
            </figure>
            <div className="min-w-0">
              <p className="font-display text-base font-medium text-[#35C5BB]">{formatInternationalDate(event.date)}</p>
              <h3 className="mt-2 font-display text-[26px] font-medium leading-tight md:text-[28px]">{event.title}</h3>
              {event.imageKey === "off-air" && (
                <div className="mt-3 font-body text-base leading-relaxed">
                  <p className="text-[#f7f3eb]/75">OFF AIR brings media leaders together to unpack 2026, challenge the consensus and debate what comes next across broadcast, streaming and video.</p>
                  <p className="mt-2 font-semibold">What happened? What matters now? What comes next?</p>
                </div>
              )}
              <div className="mt-3 text-base leading-[1.5] text-[#f7f3eb]/75">
                {event.time && <p>{event.time}</p>}
                {(event.venue || event.location) && <p className="mt-1">{[event.venue, event.location].filter(Boolean).join(" · ")}</p>}
              </div>
              <p className="mt-3 text-base text-[#f7f3eb]/75">Places are limited.</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link to={`/events/${event.id}`} className={textAction}>Learn more</Link>
                <button type="button" className={textAction} onClick={() => setInvitationOpen(true)}>Request an invitation</button>
              </div>
            </div>
          </article>;
        })}
      </div>
      {!displayed.length && <p className="text-slate-300">New event dates will be announced here.</p>}
    </SectionWrapper>
  );
}
