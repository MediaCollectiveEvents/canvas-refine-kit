import { useState } from "react";
import { Link } from "react-router-dom";
import SectionWrapper from "../layout/SectionWrapper";
import { Button } from "../ui/button";
import { formatEventDate } from "@/lib/events";
import { recommendEvents, type DiscoveryInterest, type DiscoveryShow } from "@/lib/eventDiscovery";
import type { EventDiscoverySection as DiscoveryContent } from "@/lib/homepage";

const pill = "rounded-full border px-4 py-2 text-sm leading-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35C5BB] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d24]";
function toggle<T>(values: T[], value: T): T[] { return values.includes(value) ? values.filter(item => item !== value) : [...values, value]; }

export default function EventDiscoverySection({ section, onRegister }: { section: DiscoveryContent; onRegister?: () => void }) {
  const [interests, setInterests] = useState<DiscoveryInterest[]>([]);
  const [shows, setShows] = useState<DiscoveryShow[]>([]);
  const [results, setResults] = useState<ReturnType<typeof recommendEvents> | null>(null);
  const selectedStyle = "border-[#35C5BB] bg-[#35C5BB]/15 text-[#a9e5df]";
  const idleStyle = "border-[#8FC7C1]/30 text-[#f7f3eb]/85 hover:border-[#35C5BB]";
  return (
    <div id="events-for-you" className="scroll-mt-28">
      <SectionWrapper variant="dark" padding="lux" animateOnScroll={false} className="border-b border-white/10 text-[#f7f3eb]">
        <span aria-hidden="true" className="mb-5 block h-0.5 w-12 bg-[#35C5BB]" />
        <h2 className="site-heading !font-medium">{section.heading}</h2>
        <p className="mt-4 max-w-[65ch] text-base leading-[1.5] text-[#f7f3eb]/75 md:text-lg">{section.intro}</p>
        <fieldset className="mt-8">
          <legend className="mb-4 text-base font-medium text-[#8FC7C1]">{section.interestsLabel}</legend>
          <div className="flex max-w-4xl flex-wrap gap-3">
            {section.interests.map(option => <button type="button" key={option.id} aria-pressed={interests.includes(option.id)} className={`${pill} ${interests.includes(option.id) ? selectedStyle : idleStyle}`} onClick={() => {
              setInterests(toggle(interests, option.id));
              if (option.id === "industry-shows") setShows([]);
              setResults(null);
            }}>{option.label}</button>)}
          </div>
        </fieldset>
        {interests.includes("industry-shows") && <fieldset className="mt-6 border-l border-[#8FC7C1]/20 pl-4">
          <legend className="mb-3 text-sm text-[#8FC7C1]">{section.showsLabel} <span className="text-[#f7f3eb]/60">(optional)</span></legend>
          <div className="flex flex-wrap gap-2">
            {section.shows.map(option => <button type="button" key={option.id} aria-pressed={shows.includes(option.id)} className={`${pill} ${shows.includes(option.id) ? selectedStyle : idleStyle}`} onClick={() => { setShows(toggle(shows, option.id)); setResults(null); }}>{option.label}</button>)}
          </div>
        </fieldset>}
        {interests.length > 0 && <Button type="button" variant="brand" size="lg" className="mt-8" onClick={() => setResults(recommendEvents(interests, shows))}>{section.ctaLabel}</Button>}
        <div aria-live="polite" aria-atomic="true">
          {results !== null && <div className="mt-10 border-t border-[#8FC7C1]/20 pt-8">
            {results.length ? <>
              <h3 className="font-display text-2xl font-medium">{section.resultsHeading}</h3>
              <div className="mt-6 grid gap-8 md:grid-cols-3">
                {results.map(({ event, reasons }) => <article key={event.id} className="min-w-0">
                  <p className="text-sm text-[#35C5BB]">{formatEventDate(event.date)}</p>
                  <h4 className="mt-3 font-display text-xl leading-snug">{event.title}</h4>
                  {event.location && <p className="mt-3 text-sm leading-relaxed text-[#f7f3eb]/75">{event.location}</p>}
                  <p className="mt-3 text-sm text-[#8FC7C1]">{reasons.join(" · ")}</p>
                  <Link to={`/events/${event.id}`} className="mt-5 inline-block text-[#35C5BB] underline underline-offset-4 hover:text-[#a9e5df] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">View event <span aria-hidden="true">→</span></Link>
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
