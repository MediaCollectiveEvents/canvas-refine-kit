import PageSection from "../shared/PageSection";
import { getAllEvents, getEventCapacity } from "@/lib/events";

interface OurEventsContent {
  id?: string;
  eyebrow?: string;
  heading?: string;
  body?: string;
  showHistory?: boolean;
  items?: { eventId: number | string; title?: string; summary?: string }[];
}

export default function OurEventsSection({ section, content, presentation }: { section: OurEventsContent; content?: unknown; presentation?: "editorial" }) {
  const events = getAllEvents(content);
  const items = (section.items ?? []).flatMap(item => {
    const event = events.find(event => event.id === Number(item.eventId));
    const capacity = event && getEventCapacity(event);
    return capacity ? [{ event, capacity, title: item.title || event.title, summary: item.summary || event.card_summary }] : [];
  });

  const editorial = presentation === "editorial";
  const heading = section.heading?.trim() || (editorial ? section.eyebrow : undefined);
  const hasSeparateEyebrow = section.eyebrow && (!editorial || section.heading?.trim());

  return <PageSection id={section.id} className={`${editorial ? "site-section-compact " : ""}border-b border-white/10 bg-background text-[#f7f3eb]`}>
    {hasSeparateEyebrow && <p className="site-eyebrow mb-4 text-[#8FC7C1]">{section.eyebrow}</p>}
    <div className={editorial ? "space-y-4" : "grid gap-6 lg:grid-cols-12 lg:gap-10"}>
      {heading && <h2 className="site-heading lg:col-span-5">{heading}</h2>}
      <p className={`max-w-[65ch] font-body text-base leading-[1.6] text-[#f7f3eb]/75 md:text-lg lg:col-span-7`}>{section.body}</p>
    </div>
    <ul className={editorial ? "mt-6 grid gap-x-8 lg:grid-cols-2" : "mt-10 divide-y divide-white/10 md:mt-12"}>
      {items.map(({ event, capacity, title, summary }) => editorial ? <li key={event.id} className="min-w-0 space-y-2 border-b border-white/10 py-3">
        <h3 className="font-display text-xl leading-snug"><a href={`/events/${event.id}`} className="hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{title}</a></h3>
        <p className="max-w-[65ch] font-body text-base leading-[1.6] text-[#f7f3eb]/75">{summary}</p>
        <p className="font-body text-sm text-[#8FC7C1]">{capacity} {event.capacity_label}{section.showHistory && event.historyLabel ? ` · ${event.historyLabel}` : ""}</p>
      </li> : <li key={event.id} className="grid gap-4 py-6 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,3fr)] md:items-center md:gap-8 md:py-8">
        <p className="font-display text-5xl font-semibold leading-none text-[#8FC7C1] md:text-6xl">{capacity}</p>
        <div className="min-w-0">
          <h3 className="font-display text-xl leading-snug md:text-2xl">{title}</h3>
          <p className="mt-2 font-body text-sm text-[#f7f3eb]/60">{event.capacity_label}</p>
          {section.showHistory && event.historyLabel && <p className="mt-3 font-display text-xs font-medium uppercase tracking-wide text-[#8FC7C1]/80">{event.historyLabel}</p>}
        </div>
        <p className="max-w-[50ch] font-body text-base leading-[1.6] text-[#f7f3eb]/75 md:text-lg">{summary}</p>
      </li>)}
    </ul>
  </PageSection>;
}
