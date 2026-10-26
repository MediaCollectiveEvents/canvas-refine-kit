import type { EventItem } from "@/lib/events";
import { Audience, Narrative, Programme, Section } from "./EditorialEventSections";

export const isNetworkingBreakfast = (event: EventItem) => event.id === 6;

/** Breakfast presentation using the existing CMS introduction, programme and details. */
export default function BreakfastEditorial({ event }: { event: EventItem }) {
  return <>
    <Section title="About the Networking Breakfast"><Narrative text={event.description || ""} /></Section>
    <Audience text={event.whoAttends || ""} />
    <Programme title="The Morning" items={event.programme || []} />
    {!!event.whyAttend?.length && <Section title="Why Attend"><ul className="list-disc space-y-2 pl-5">{event.whyAttend.map(copy => <li key={copy}>{copy}</li>)}</ul></Section>}
    {event.details && <Section title="A Better Start to IBC"><Narrative text={event.details} /></Section>}
  </>;
}
