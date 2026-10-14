import { Link } from "react-router-dom";
import PageSection from "../shared/PageSection";
import { getAllEvents } from "@/lib/events";

interface CategoriesContent {
  id?: string;
  groups?: { label: string; items: { eventId: number | string; title?: string }[] }[];
}

export default function EventCategoriesSection({ section, content }: { section: CategoriesContent; content?: unknown }) {
  const events = getAllEvents(content);
  return <PageSection id={section.id} aria-label="Event categories" className="border-b border-white/10">
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-5">
      {section.groups?.map(group => <div key={group.label} className="grid min-w-0 gap-5 lg:row-span-2 lg:grid-rows-[subgrid]">
        <h2 className="site-eyebrow text-[#8FC7C1]">{group.label}</h2>
        <ul className="flex flex-col items-start gap-3">{group.items.flatMap(item => {
          const event = events.find(event => event.id === Number(item.eventId));
          return event ? [<li key={event.id} className="flex max-w-full"><Link className="site-secondary-action max-w-full" to={`/events/${event.id}`}>{item.title || event.title}</Link></li>] : [];
        })}</ul>
      </div>)}
    </div>
  </PageSection>;
}
