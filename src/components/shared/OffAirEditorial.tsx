import { Audience, Narrative, Programme, Section } from "./EditorialEventSections";
import type { EventItem } from "@/lib/events";
import { offAirHostProfiles } from "@/lib/offAirEditorial";
import { headerLogoImage } from "@/lib/imageDelivery";

/** OFF AIR's editorial layout, using existing event fields without a new schema. */
export default function OffAirEditorial({ event }: { event: EventItem }) {
  const hosts = [{ name: "The Media Collective", logo: headerLogoImage.src, url: "" }, ...(event.partners || [])];
  return <>
    <Section title="About OFF AIR"><Narrative text={event.description || ""} /></Section>
    <Audience text={event.whoAttends || ""} />
    <Programme title="The Programme" items={event.programme || []} />
    {!!event.whyAttend?.length && <Section title="Why Attend"><ul className="list-disc space-y-2 pl-5">{event.whyAttend.map(copy => <li key={copy}>{copy}</li>)}</ul></Section>}
    {event.details && <Section title="The Conversation Continues"><Narrative text={event.details} /></Section>}
    <Section title="Meet the Hosts" wide>
      <ul className="grid gap-8 lg:grid-cols-3 lg:gap-10">{hosts.map(host => {
        const profile = offAirHostProfiles[host.name];
        return <li key={host.name} className="min-w-0 border-t border-primary/30 pt-6">
          {host.logo && <div className="mb-5 flex h-20 items-center">{host.name === "The Media Collective"
            ? <img {...headerLogoImage} sizes="180px" alt="" loading="lazy" width={180} className="max-h-20 w-44 object-contain object-left" />
            : <img src={host.logo} alt="" loading="lazy" className="max-h-20 w-44 bg-white p-2 object-contain" />}</div>}
          <h3 className="mb-4 font-display text-2xl font-light text-foreground">{host.name}</h3>
          {profile && <><Narrative text={profile.paragraphs.join("\n\n")} /><p className="mt-5 text-sm text-muted-foreground"><span className="font-medium text-primary">Focus: </span>{profile.focus}</p></>}
          {host.url && <a href={host.url} target="_blank" rel="noopener noreferrer" className="site-secondary-action mt-5 break-words">{host.url.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗<span className="sr-only"> (opens in a new tab)</span></a>}
        </li>;
      })}</ul>
    </Section>
  </>;
}
