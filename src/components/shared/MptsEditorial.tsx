import type { EventItem } from "@/lib/events";
import { Audience, Narrative, Programme, Section } from "./EditorialEventSections";

export const isMptsReception = (event: EventItem) => event.id === 5;

/** MPTS presentation only; every paragraph remains in the existing CMS fields. */
export default function MptsEditorial({ event }: { event: EventItem }) {
  return <>
    <Section title="After the Show"><Narrative text={event.description || ""} /></Section>
    <Audience text={event.whoAttends || ""} />
    <Programme title="The Evening" items={event.programme || []} />
    {!!event.whyAttend?.length && <Section title="Why Attend"><ul className="list-disc space-y-2 pl-5">{event.whyAttend.map(copy => <li key={copy}>{copy}</li>)}</ul></Section>}
    {event.details && <Section title="From Show Floor to First Floor"><Narrative text={event.details} /></Section>}
  </>;
}
