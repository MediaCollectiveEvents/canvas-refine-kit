import DecompressionEditorial, { decompressionAddress, isDecompressionParty } from "./DecompressionEditorial";
import OffAirEditorial from "./OffAirEditorial";
import MptsEditorial, { isMptsReception } from "./MptsEditorial";
import { isOffAir } from "@/lib/offAirEditorial";
import { responsiveEventImage, eventImageSizes } from "@/lib/imageDelivery";
import ClosingCTA from "./ClosingCTA";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EventTags from "./EventTags";
import { formatEventDate, getEventCapacity, isPastEvent, type EventItem } from "@/lib/events";
import { getEventImage } from "@/lib/eventImages";
import { getEventTimeZoneLabel } from "@/lib/eventTimeZone";
import type { ReactNode } from "react";

export const DEFAULT_EVENT_ATTENDANCE = "Free to attend. Places are limited and invitations are carefully curated.";
export const DEFAULT_EVENT_CTA_COPY = "If you would like to attend, please submit a request for an invitation.\n\nAttendance is free, with guest numbers intentionally limited to maintain a welcoming and balanced environment.";

function Narrative({ text }: { text: string }) {
  return <div className="space-y-4">{text.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>;
}

function CopySection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="border-t border-white/10 py-8 md:py-10">
    <h2 className="mb-5 font-display text-2xl font-light md:text-3xl">{title}</h2>
    <div className="max-w-[70ch] text-base leading-[1.7] text-foreground/80 md:text-lg">{children}</div>
  </section>;
}

export default function EventPageTemplate({ event, onRequest, context }: {
  event: EventItem; onRequest: () => void; context?: ReactNode;
}) {
  const party = isDecompressionParty(event);
  const mpts = isMptsReception(event);
  const editorial = isOffAir(event) || party || mpts;
  const highlights = !party && !!event.heroHighlights?.length;
  const dateLabel = party && Number.isFinite(Date.parse(event.date)) ? new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(event.date)) : formatEventDate(event.date);
  const past = isPastEvent(event);
  const closed = event.statusLabel?.toLowerCase() === "registration closed";
  const image = getEventImage(event);
  const zone = getEventTimeZoneLabel(event);
  const time = event.time ? `${event.time}${zone && !event.time.includes(zone) ? ` (${zone})` : ""}` : "Time to be confirmed";
  const partner = event.partnerEvent;
  const hasAction = !partner || !!event.registrationLink;
  const capacity = getEventCapacity(event);
  const capacityText = capacity !== undefined ? `${capacity}${event.capacity_label ? ` ${event.capacity_label.toLowerCase()}` : ""}` : undefined;
  const attendance = event.attendanceStatement || (partner ? "Paid tickets. Places are limited and advance booking is required." : DEFAULT_EVENT_ATTENDANCE);
  const actionLabel = event.ctaLabel || (partner ? "Register Interest" : "Request an Invitation");
  const action = (large = false) => partner
    ? event.registrationLink
      ? <Button asChild variant="brand" size={large ? "lg" : "default"}><a href={event.registrationLink}>{actionLabel}</a></Button>
      : null
    : past ? <Button variant="brand" size={large ? "lg" : "default"} onClick={onRequest}>Register interest</Button>
    : closed ? <p className="text-muted-foreground">Registration closed</p>
    : event.registrationLink ? <Button asChild variant="brand" size={large ? "lg" : "default"}><a href={event.registrationLink}>{actionLabel}</a></Button>
    : <Button variant="brand" size={large ? "lg" : "default"} onClick={onRequest}>{actionLabel}</Button>;
  const heading = <>
    <p className="site-eyebrow mb-5 text-primary">{partner ? "Partner Event" : past ? "Past event" : party ? `IBC ${event.date.slice(0, 4)}` : event.statusLabel || "Upcoming Event"}</p>
    <h1 className="site-page-h1 break-words font-display text-3xl font-light leading-tight md:text-5xl">{event.title}</h1>
    {highlights && <ul aria-label="Event highlights" className="mt-4 flex flex-wrap gap-2 lg:flex-nowrap lg:gap-1 xl:gap-2">
      {event.heroHighlights!.map((label, index) => <li key={index}><Badge variant="outline" className="whitespace-nowrap border-primary/20 bg-primary/10 px-2 py-1 font-display text-xs font-medium leading-5 tracking-wide text-[#9bd3c8]">{label}</Badge></li>)}
    </ul>}
  </>;

  return <><div className="site-gutter"><div className="site-container pt-8">
    <header className={`grid items-start gap-8 pb-10 lg:gap-12 md:pb-14 ${highlights ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]" : "lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"}`}>
      {partner && <div className="min-w-0 lg:col-span-2">{heading}</div>}
      <div className="min-w-0">
        {!partner && heading}
        {event.subtitle && <p className={`mt-4 ${partner ? "" : "max-w-[60ch]"} text-lg text-foreground/80`}>{event.subtitle}</p>}
        <div className="mt-6 space-y-2 text-base text-muted-foreground">
          <p><time dateTime={event.date}>{dateLabel}</time></p>
          <p>{time}</p>
          <p>{[event.venue, event.location].filter(Boolean).join(" · ") || "Location to be confirmed"}</p>
          {capacityText && <p>Capacity: {capacityText}</p>}
        </div>
        <p className="mt-3 text-base text-foreground/80">{party ? "Attendance by invitation" : attendance}</p>
        {!highlights && <EventTags event={event} />}
        {hasAction && <div className="mt-6">{action()}</div>}
      </div>
      {image && <img {...responsiveEventImage(image, eventImageSizes.detail)} alt="" width={1080} height={1080} className="aspect-square w-full rounded-xl object-contain" />}
    </header>

    {editorial ? party ? <DecompressionEditorial event={event} /> : mpts ? <MptsEditorial event={event} /> : <OffAirEditorial event={event} /> : <>
    <CopySection title="About This Event"><Narrative text={event.description || event.summary || "Event details will be announced."} /></CopySection>
    {event.whoAttends && <CopySection title="Who Attends"><Narrative text={event.whoAttends} /></CopySection>}
    {!!event.whyAttend?.length && <CopySection title="Why Attend"><ul className="list-disc space-y-2 pl-5">{event.whyAttend.map((item, i) => <li key={i}>{item}</li>)}</ul></CopySection>}
    {(!!event.whatToExpect?.length || event.details) && <CopySection title="What To Expect">
      {event.whatToExpect?.length ? <ul className="list-disc space-y-2 pl-5">{event.whatToExpect.map((item, i) => <li key={i}>{item}</li>)}</ul> : <Narrative text={event.details!} />}
    </CopySection>}
    </>}
    <CopySection title="Event Details">
      <dl className="grid gap-6 sm:grid-cols-2">
        <div><dt className="text-muted-foreground">Date</dt><dd className="mt-1"><time dateTime={event.date}>{dateLabel}</time></dd></div>
        <div><dt className="text-muted-foreground">{partner && event.departure ? "Journey Time" : "Time"}</dt><dd className="mt-1">{time}</dd></div>
        {partner && event.departure && <div><dt className="text-muted-foreground">Departure</dt><dd className="mt-1">{event.departure}</dd></div>}
        {partner && event.destination && <div><dt className="text-muted-foreground">Destination</dt><dd className="mt-1">{event.destination}</dd></div>}
        {!(partner && event.departure) && <div><dt className="text-muted-foreground">Location</dt><dd className="mt-1">{party ? <div className="space-y-1"><p>{event.venue}</p>{decompressionAddress.map(line => <p key={line}>{line}</p>)}</div> : [event.venue, event.location].filter(Boolean).join(" · ") || "Location to be confirmed"}</dd></div>}
        <div><dt className="text-muted-foreground">Attendance</dt><dd className="mt-1">{party ? <Narrative text={attendance} /> : attendance}</dd></div>
        {capacityText && <div><dt className="inline text-muted-foreground">Capacity: </dt><dd className="inline">{capacityText}</dd></div>}
      </dl>
    </CopySection>
    {!editorial && !!event.programme?.length && <CopySection title="Programme"><ol className="space-y-4">{event.programme.map((item, i) => <li key={i} className="flex flex-wrap gap-x-4 gap-y-1">{item.time && <span className="font-medium text-primary">{item.time}</span>}<span>{item.description}</span></li>)}</ol></CopySection>}
    {partner && event.partnerEventCopy && <CopySection title="Partner Event"><Narrative text={event.partnerEventCopy} /></CopySection>}
    {!editorial && !!event.partners?.length && <CopySection title="In Association With"><ul className="flex flex-wrap gap-8">{event.partners.map((partner, i) => <li key={i}>
      {partner.logo && <img src={partner.logo} alt="" loading="lazy" className="mb-3 h-16 w-40 rounded-lg bg-white p-2 object-contain" />}
      {partner.url ? <a href={partner.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{partner.name}<span className="sr-only"> (opens in a new tab)</span></a> : <span>{partner.name}</span>}
    </li>)}</ul></CopySection>}
    {context && <div className="pb-10">{context}</div>}
  </div></div>
    <ClosingCTA
      eyebrow={party ? "IBC DECOMPRESSION PARTY" : undefined}
      heading={closed ? "Registration Closed" : past ? "Interested in a future event?" : partner || editorial ? event.ctaHeading || "Request an Invitation" : "Want to join us?"}
      support={past && !partner ? <p>This event has finished. You can register interest in future gatherings.</p> : partner || editorial ? <Narrative text={event.ctaCopy || "Please register your interest with the organisers. Paid tickets are limited and subject to availability."} /> : <p>{attendance}</p>}
      action={hasAction ? action(true) : undefined}
    />
  </>;
}
