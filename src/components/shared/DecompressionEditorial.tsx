import type { EventItem } from "@/lib/events";
import { Audience, Narrative, Programme, Section } from "./EditorialEventSections";

export const isDecompressionParty = (event: EventItem) => event.id === 7;
// Supplied venue address, kept separate from the CMS location/city used on listings.
// The current event schema has no structured postal-address field.
export const decompressionAddress = ["Thorbeckeplein 16", "1017 CS Amsterdam", "Netherlands"];

export default function DecompressionEditorial({ event }: { event: EventItem }) {
  return <>
    <Section title="About the Decompression Party"><Narrative text={event.description || ""} /></Section>
    <Audience text={event.whoAttends || ""} />
    <Programme title="The Evening" items={event.programme || []} />
    {!!event.whyAttend?.length && <Section title="Why Attend"><ul className="list-disc space-y-2 pl-5">{event.whyAttend.map(copy => <li key={copy}>{copy}</li>)}</ul></Section>}
    {event.details && <Section title="A Different Side of IBC"><Narrative text={event.details} /></Section>}
  </>;
}
