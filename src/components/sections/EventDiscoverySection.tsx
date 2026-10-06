import { useState } from "react";
import { Link } from "react-router-dom";
import SectionWrapper from "../layout/SectionWrapper";
import { Button } from "../ui/button";
import { formatEventDate } from "@/lib/events";
import { recommendEvents, type DiscoveryInterest, type DiscoveryShow } from "@/lib/eventDiscovery";
import type { EventDiscoverySection as DiscoveryContent } from "@/lib/homepage";

const editorialChoice = "group flex w-full items-center gap-3 border-b border-white/15 border-l-2 border-l-transparent px-4 py-5 text-left font-display text-xl leading-snug md:text-2xl transition-colors hover:bg-[#35C5BB]/5 focus-visible:bg-[#35C5BB]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#35C5BB] aria-pressed:border-l-[#35C5BB] aria-pressed:border-b-[#35C5BB]/30 aria-pressed:bg-[#35C5BB]/[0.07]";
function toggle<T>(values: T[], value: T): T[] { return values.includes(value) ? values.filter(item => item !== value) : [...values, value]; }

export default function EventDiscoverySection({ section, onRegister }: { section: DiscoveryContent; onRegister?: () => void }) {
  const [interests, setInterests] = useState<DiscoveryInterest[]>([]);
  const [shows, setShows] = useState<DiscoveryShow[]>([]);
  const results = interests.length > 0 ? recommendEvents(interests, shows) : null;
  return (
    <div id="events-for-you" className="scroll-mt-28">
      <SectionWrapper variant="dark" padding="lux" animateOnScroll={false} className="border-b border-white/10 text-[#f7f3eb]">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="site-eyebrow text-[#f7f3eb]/60">WELCOME</p>
            <h2 className="site-heading mt-5 max-w-[22ch] !font-medium">{section.heading}</h2>
            <p className="mt-4 max-w-[45ch] text-base leading-[1.5] text-[#f7f3eb]/75 md:text-lg">{section.intro}</p>
          </div>
          <div className="min-w-0 lg:col-span-7">
            <p id="discovery-instruction" className="font-display mb-6 max-w-[52ch] text-base leading-[1.5] text-[#f7f3eb]/75">{section.interestsLabel}</p>
            <div role="group" aria-labelledby="discovery-instruction" className="border-t border-white/15">
              {section.interests.map(option => <button type="button" key={option.id} aria-pressed={interests.includes(option.id)} aria-expanded={option.id === "industry-shows" ? interests.includes(option.id) : undefined} aria-controls={option.id === "industry-shows" && interests.includes(option.id) ? "discovery-shows" : undefined} className={`${editorialChoice} ${interests.includes(option.id) ? "text-[#35C5BB]" : "text-[#f7f3eb]/90 hover:text-white"}`} onClick={() => {
                setInterests(toggle(interests, option.id));
                if (option.id === "industry-shows") setShows([]);
              }}>
                <span className="min-w-0">{option.label}</span><span aria-hidden="true" className={`shrink-0 text-base transition-colors group-hover:text-[#35C5BB] group-focus-visible:text-[#35C5BB] ${interests.includes(option.id) ? "text-[#35C5BB]" : "text-white/50"}`}>{option.id === "industry-shows" ? interests.includes(option.id) ? "↓" : "↘" : "→"}</span>
              </button>)}
            </div>
            {interests.includes("industry-shows") && <div id="discovery-shows" className="ml-4 mt-5 border-l border-[#8FC7C1]/30 pl-5 md:ml-6">
              <h3 id="discovery-shows-heading" className="mb-3 text-sm font-medium text-[#f7f3eb]/75">{section.showsLabel} <span className="font-normal text-[#f7f3eb]/50">(optional)</span></h3>
              <div role="group" aria-labelledby="discovery-shows-heading">
                {section.shows.map(option => <button type="button" key={option.id} aria-pressed={shows.includes(option.id)} className={`group flex w-full items-center gap-3 border-b border-white/10 px-3 py-3 text-left text-base leading-snug transition-colors hover:bg-[#35C5BB]/5 focus-visible:bg-[#35C5BB]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#35C5BB] aria-pressed:border-b-[#35C5BB]/30 aria-pressed:bg-[#35C5BB]/[0.07] ${shows.includes(option.id) ? "text-[#35C5BB]" : "text-[#f7f3eb]/80 hover:text-white"}`} onClick={() => setShows(toggle(shows, option.id))}>
                  <span>{option.label}</span><span aria-hidden="true" className={`shrink-0 text-sm transition-colors group-hover:text-[#35C5BB] group-focus-visible:text-[#35C5BB] ${shows.includes(option.id) ? "text-[#35C5BB]" : "text-white/50"}`}>→</span>
                </button>)}
              </div>
            </div>}
          </div>
        </div>
        <div aria-live="polite" aria-atomic="true" className="grid lg:grid-cols-12 lg:gap-x-16">
          {results !== null && <div className="mt-10 border-t border-[#8FC7C1]/30 pt-8 lg:col-span-7 lg:col-start-6">
            {results.length ? <>
              <h3 className="font-display text-2xl font-medium">{section.resultsHeading}</h3>
              <div className={`mt-6 grid gap-8 ${results.length > 1 ? "md:grid-cols-3" : "max-w-[55ch]"}`}>
                {results.map(({ event, reasons }) => <article key={event.id} className="min-w-0">
                  <p className="text-sm text-[#35C5BB]">{formatEventDate(event.date)}</p>
                  <h4 className="mt-3 font-display text-xl leading-snug">{event.title}</h4>
                  {event.location && <p className="mt-3 text-sm leading-relaxed text-[#f7f3eb]/75">{event.location}</p>}
                  <p className="mt-3 text-sm text-[#8FC7C1]">{reasons.join(" · ")}</p>
                  <Link to={`/events/${event.id}`} className="font-display mt-5 inline-block text-[#35C5BB] underline underline-offset-4 hover:text-[#a9e5df] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">View event <span aria-hidden="true">→</span></Link>
                </article>)}
              </div>
            </> : <>
              <h3 className="font-display text-2xl font-medium">{section.emptyHeading}</h3>
              <p className="mt-3 max-w-[65ch] text-base leading-[1.5] text-[#f7f3eb]/75">{section.emptyBody}</p>
              {onRegister && <Button type="button" variant="brand" className="mt-6" onClick={onRegister}>{section.emptyCtaLabel}</Button>}
            </>}
          </div>}
        </div>
      </SectionWrapper>
    </div>
  );
}
