import { Link } from "react-router-dom";
import SectionWrapper from "../layout/SectionWrapper";
import { formatEventDate, getUpcomingEvents } from "@/lib/events";
import type { EventDiscoverySection as DiscoveryContent } from "@/lib/homepage";

// Reuse the existing event image keys and published artwork paths.
const eventImages: Record<string, string> = {
  greenline: "/uploads/Venue tiles/Eurostar.png",
  "off-air": "/uploads/Venue tiles/broadcaster.png",
  "mpts-networking-reception-2027": "/uploads/Venue tiles/Handandflower.png",
  "ibc-networking-breakfast-2027": "/uploads/Venue tiles/RAI.png",
  "ibc-decompression-party-2027": "/uploads/Venue tiles/Livepiano.png",
};
const textAction = "font-display inline-flex min-h-11 items-center text-base font-medium text-[#35C5BB] transition-colors hover:text-[#8FC7C1] hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C5BB]";

export default function EventDiscoverySection({ section }: { section: DiscoveryContent; onRegister?: () => void }) {
  const events = getUpcomingEvents(5);
  return (
    <div id="events-for-you" className="scroll-mt-28">
      <SectionWrapper variant="transparent" padding="lux" animateOnScroll={false} className="site-surface-emphasis border-b border-white/10 text-[#f7f3eb]">
        <div className="mb-10 md:mb-12">
          <h2 className="site-heading !font-medium text-[32px] md:text-[40px]">{section.intro}</h2>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 md:gap-y-3 xl:grid-cols-5">
          {events.map((event, index) => {
            const image = event.imageKey ? eventImages[event.imageKey] : undefined;
            const location = event.imageKey === "greenline"
              ? "London to Amsterdam"
              : event.location?.split(",").slice(-1)[0].trim();
            return (
              <article key={event.id} className={`${index === 0 || index > 3 ? "hidden md:grid" : "grid"} min-w-0 md:row-span-4 md:grid-rows-[subgrid]`}>
                <Link to={`/events/${event.id}`} aria-labelledby={`homepage-event-${event.id}`} className="relative isolate grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-4 gap-y-2 md:grid-cols-1 rounded-xl hover:z-20 focus-visible:z-20 after:pointer-events-none after:absolute after:-inset-1.5 after:z-10 after:rounded-xl after:bg-transparent after:transition-[background-color,transform] after:duration-200 after:ease-out after:content-[''] hover:after:bg-primary/20 focus-visible:after:bg-primary/20 motion-safe:hover:after:scale-[1.015] motion-safe:focus-visible:after:scale-[1.015] motion-reduce:after:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8FC7C1] md:row-span-4 md:grid-rows-[subgrid] md:gap-y-3">
                  <div className="row-span-3 md:row-span-1 mb-1 aspect-square w-full overflow-hidden rounded-xl">
                    {image && <img src={image} alt="" loading="lazy" className="h-full w-full object-contain" />}
                  </div>
                  <h3 id={`homepage-event-${event.id}`} className="col-start-2 md:col-start-auto font-display text-xl font-medium leading-snug">{event.title}</h3>
                  <p className="col-start-2 md:col-start-auto font-display text-base font-medium text-[#35C5BB]">{formatEventDate(event.date)}</p>
                  <p className="col-start-2 md:col-start-auto font-body text-base leading-[1.5] text-[#f7f3eb]/75">{location}</p>
                </Link>
              </article>
            );
          })}
        </div>
        {!events.length && <p className="col-start-2 md:col-start-auto font-body text-base text-[#f7f3eb]/75">New event dates will be announced here.</p>}
        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/15 pt-4 md:mt-12">
          <Link to="/events" className={textAction}>View all events</Link>
          <Link to="/events/calendar" className={textAction}>Full calendar</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
