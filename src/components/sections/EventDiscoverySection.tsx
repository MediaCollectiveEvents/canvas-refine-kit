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
const textAction = "font-display inline-block text-base font-medium text-[#35C5BB] transition-colors hover:text-[#8FC7C1] hover:underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C5BB]";

export default function EventDiscoverySection({ section }: { section: DiscoveryContent; onRegister?: () => void }) {
  const events = getUpcomingEvents(5);
  return (
    <div id="events-for-you" className="scroll-mt-28">
      <SectionWrapper variant="dark" padding="lux" animateOnScroll={false} className="border-b border-white/10 text-[#f7f3eb]">
        <div className="mb-10 md:mb-12">
          <h2 className="site-heading !font-medium">{section.intro}</h2>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 md:gap-y-3 xl:grid-cols-5">
          {events.map(event => {
            const image = event.imageKey ? eventImages[event.imageKey] : undefined;
            const location = event.imageKey === "greenline"
              ? "London to Amsterdam"
              : event.location?.split(",").slice(-1)[0].trim();
            return (
              <article key={event.id} className="min-w-0 md:row-span-4 md:grid md:grid-rows-[subgrid]">
                <Link to={`/events/${event.id}`} aria-labelledby={`homepage-event-${event.id}`} className="grid min-w-0 gap-2 outline outline-2 outline-transparent outline-offset-4 transition-[outline-color] duration-300 ease-out hover:outline-[#35C5BB]/80 focus-visible:outline-[#35C5BB] motion-reduce:transition-none md:row-span-4 md:grid-rows-[subgrid] md:gap-y-3">
                  <div className="mb-1 aspect-square w-full">
                    {image && <img src={image} alt="" loading="lazy" className="h-full w-full object-contain" />}
                  </div>
                  <h3 id={`homepage-event-${event.id}`} className="font-display text-xl font-medium leading-snug">{event.title}</h3>
                  <p className="font-display text-sm font-medium text-[#35C5BB]">{formatEventDate(event.date)}</p>
                  <p className="font-body text-base leading-[1.5] text-[#f7f3eb]/75">{location}</p>
                </Link>
              </article>
            );
          })}
        </div>
        {!events.length && <p className="font-body text-base text-[#f7f3eb]/75">New event dates will be announced here.</p>}
        {events.length > 0 && <p className="mt-6 font-body text-sm text-[#f7f3eb]/65">Artwork is illustrative. Refer to each event page for confirmed venue details.</p>}
        <div className="mt-10 border-t border-white/15 pt-6 md:mt-12">
          <Link to="/events" className={textAction}>More</Link>
        </div>
      </SectionWrapper>
    </div>
  );
}
