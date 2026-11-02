import type { ReactNode } from "react";
import type { EventItem } from "@/lib/events";
import type { Contributor } from "@/lib/contentMetadata";
import { getEventParticipants, type EventParticipantSources } from "@/lib/eventParticipants";
import { contentImage } from "@/lib/contentImages";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section aria-label={title} className="border-t border-white/10 py-8 md:py-10">
    <h2 className="mb-5 font-display text-2xl font-light md:text-3xl">{title}</h2>
    {children}
  </section>;
}

function safeImage(src?: string) {
  return src && !/[\\\r\n]/.test(src) && /^(https?:\/\/|\/(?!\/))/.test(src) ? contentImage(src) : undefined;
}

function Speaker({ person }: { person: Contributor }) {
  const image = safeImage(person.image);
  return <div className="min-w-0">
    {image && <img src={image} alt="" loading="lazy" width={160} height={160} className="mb-3 h-24 w-24 rounded-lg object-cover" />}
    <p className="break-words text-lg font-medium">{person.displayName}</p>
    {(person.role || person.organisation) && <p className="mt-1 text-sm text-muted-foreground">{[person.role, person.organisation].filter(Boolean).join(" · ")}</p>}
    {person.biography && <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-foreground/80">{person.biography}</p>}
  </div>;
}

export default function EventParticipants({ event, sources }: { event: EventItem; sources?: EventParticipantSources }) {
  const { sponsors, speakers, panels } = getEventParticipants(event, sources);
  return <>
    {sponsors.length > 0 && <Section title="Sponsors"><ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sponsors.map(sponsor => <li key={sponsor.id} className="min-w-0">
        {safeImage(sponsor.src) && <img src={safeImage(sponsor.src)} alt="" loading="lazy" className="mb-3 h-16 w-40 rounded-lg bg-white p-2 object-contain" />}
        {sponsor.website && /^https?:\/\//i.test(sponsor.website) ? <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="break-words text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{sponsor.name}<span className="sr-only"> (opens in a new tab)</span></a> : <p className="break-words font-medium">{sponsor.name}</p>}
      </li>)}
    </ul></Section>}
    {speakers.length > 0 && <Section title="Speakers"><ul className="grid gap-8 sm:grid-cols-2">
      {speakers.map(person => <li key={person.id}><Speaker person={person} /></li>)}
    </ul></Section>}
    {panels.length > 0 && <Section title="Panels"><ol className="space-y-8">
      {panels.map((panel, index) => <li key={index} className="min-w-0">
        <h3 className="break-words font-display text-xl">{panel.title}</h3>
        {panel.time && <p className="mt-2 text-primary">{panel.time}</p>}
        {panel.description && <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-foreground/80">{panel.description}</p>}
        {panel.moderator && <div className="mt-5"><p className="mb-2 text-sm font-medium text-muted-foreground">Moderator</p><Speaker person={panel.moderator} /></div>}
        {panel.speakers.length > 0 && <ul aria-label="Panellists" className="mt-6 grid gap-6 sm:grid-cols-2">
          {panel.speakers.map(person => <li key={person.id}><Speaker person={person} /></li>)}
        </ul>}
      </li>)}
    </ol></Section>}
  </>;
}
