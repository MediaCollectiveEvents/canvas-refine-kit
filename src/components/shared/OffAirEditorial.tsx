import type { ReactNode } from "react";
import type { EventItem } from "@/lib/events";
import { offAirHostProfiles } from "@/lib/offAirEditorial";
import { headerLogoImage } from "@/lib/imageDelivery";

const paragraphs = (text: string) => text.split(/\n\s*\n/).filter(Boolean);
function Narrative({ text }: { text: string }) {
  return <div className="space-y-4">{paragraphs(text).map((copy, i) => <p key={i}>{copy}</p>)}</div>;
}
function Section({ title, children, wide = false }: { title: string; children: ReactNode; wide?: boolean }) {
  return <section id={title.toLowerCase().replace(/\s+/g, "-")} className="scroll-mt-48 border-t border-white/10 py-8 md:py-10">
    <h2 className="mb-5 font-display text-2xl font-light md:text-3xl">{title}</h2>
    <div className={`${wide ? "" : "max-w-[70ch]"} text-base leading-[1.7] text-foreground/80 md:text-lg`}>{children}</div>
  </section>;
}

/** OFF AIR's editorial layout, using existing event fields without a new schema. */
export default function OffAirEditorial({ event }: { event: EventItem }) {
  const audience = paragraphs(event.whoAttends || "");
  const hosts = [{ name: "The Media Collective", logo: headerLogoImage.src, url: "" }, ...(event.partners || [])];
  return <>
    <Section title="About OFF AIR"><Narrative text={event.description || ""} /></Section>
    <Section title="Who Attends">
      <p>{audience[0]}</p>
      {audience[1] && <ul className="my-5 grid gap-x-8 gap-y-2 sm:grid-cols-2">{audience[1].split("\n").filter(Boolean).map(label => <li key={label} className="border-l-2 border-primary/40 pl-4">{label}</li>)}</ul>}
      {audience.slice(2).map((copy, i) => <p key={i}>{copy}</p>)}
    </Section>
    {!!event.programme?.length && <Section title="The Programme" wide>
      <ol className="divide-y divide-white/10">{event.programme.map((item, i) => {
        const [title, ...copy] = paragraphs(item.description);
        return <li key={i} className="grid gap-4 py-6 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10">
          <h3 className="font-display text-base font-medium tracking-wide text-primary">{title}</h3>
          <div className="max-w-[65ch]">{item.time && <p className="mb-2 text-primary">{item.time}</p>}<Narrative text={copy.join("\n\n")} /></div>
        </li>;
      })}</ol>
    </Section>}
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
