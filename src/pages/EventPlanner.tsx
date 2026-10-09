import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Seo from "@/components/shared/Seo";
import PageSection from "@/components/shared/PageSection";
import { formatEventDate, getAllEvents } from "@/lib/events";
import { getIndustryPlannerMonths, getIndustryPlannerYears, getMajorIndustryEvents, getUpcomingCalendarEntries } from "@/lib/industryEvents";

const industryEvents = getMajorIndustryEvents();
const mediaEvents = getAllEvents();
const description = "Media Collective gatherings alongside major external industry conferences, shows and markets. External events are organised independently of The Media Collective.";

export default function EventPlanner() {
  const [selectedYear, setYear] = useState<number>();
  const now = new Date();
  const currentYear = Number(new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "Europe/London" }).format(now));
  const upcomingMonths = (year: number) => getIndustryPlannerMonths(year, "all", mediaEvents, industryEvents)
    .map(month => ({ ...month, entries: getUpcomingCalendarEntries(month.entries, now) }))
    .filter(month => month.entries.length > 0);
  const years = getIndustryPlannerYears(mediaEvents, industryEvents).filter(year => upcomingMonths(year).length > 0);
  const year = selectedYear !== undefined && years.includes(selectedYear) ? selectedYear : years[0] ?? currentYear;
  const months = upcomingMonths(year);

  const linkClass = "font-display text-base text-[#35C5BB] transition-colors hover:text-[#8FC7C1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C5BB]";
  const entryClass = "min-w-0 border-t border-[#8FC7C1]/20 pt-5 text-[#f7f3eb]/75";

  return (
    <div className="min-h-screen site-surface-dark text-[#f7f3eb] font-body">
      <Seo title={`${year} Calendar — The Media Collective`} description={description} url="/events/calendar" />
      <Header />
      <main className="site-header-clearance">
        <PageSection className="border-b border-white/10">
          <h1 className="font-display text-[40px] font-light leading-tight md:text-5xl">{year} Calendar</h1>
          <p className="mt-5 max-w-[65ch] text-base leading-relaxed text-[#f7f3eb]/75">{description}</p>
        </PageSection>
        <PageSection variant="accent" className="!py-6 border-b border-white/10">
          <div role="group" aria-label="Calendar year" className="flex flex-wrap gap-6">
            {years.map(option => <button key={option} type="button" aria-pressed={year === option} aria-controls="year-planner"
              onClick={() => setYear(option)}
              className={`font-display py-2 text-base font-medium transition-colors hover:text-[#8FC7C1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C5BB] ${year === option ? "border-b-2 border-[#35C5BB] text-[#35C5BB]" : "text-[#f7f3eb]/75"}`}>{option}</button>)}
          </div>
        </PageSection>
        <div id="year-planner">
          {months.length === 0 && <PageSection><p role="status" className="text-base text-[#f7f3eb]/75">No upcoming calendar events are currently announced.</p></PageSection>}
          {months.map((month, index) => {
            const name = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, month.month - 1, 1)));
            return (
              <PageSection key={month.month} aria-labelledby={`month-${month.month}`} variant={index % 2 === 0 ? "default" : "accent"} className="border-b border-white/10">
                <h2 id={`month-${month.month}`} className="site-heading">{name} {year}</h2>
                <div className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
                  {month.entries.map(entry => {
                    if (entry.kind === "media-collective") {
                      const event = entry.event;
                      return <article key={`media-${event.id}`} className={entryClass}>
                        <h3 className="break-words font-display text-xl font-medium leading-snug text-[#f7f3eb]">
                          <Link to={`/events/${event.id}`} className="transition-colors hover:text-[#8FC7C1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C5BB]">{event.title}</Link>
                        </h3>
                        <p className="mt-3 text-base"><time dateTime={event.date}>{formatEventDate(event.date)}</time></p>
                        {(event.venue || event.location) && <p className="mt-1 text-base">{[event.venue, event.location].filter(Boolean).join(" · ")}</p>}
                        <p className="mt-1 text-base">Organiser: The Media Collective</p>
                        <Link to={`/events/${event.id}`} className={`mt-2 inline-flex min-h-11 items-center ${linkClass}`}>Event details</Link>
                      </article>;
                    }
                    const event = entry.event;
                    return <article key={`external-${event.id}`} className={entryClass}>
                      <h3 className="break-words font-display text-xl font-medium leading-snug text-[#f7f3eb]">{event.name}</h3>
                      <p className="mt-3 text-base"><time dateTime={event.startDate}>{formatEventDate(event.startDate!)}</time>
                        {event.endDate && event.endDate !== event.startDate && <> – <time dateTime={event.endDate}>{formatEventDate(event.endDate)}</time></>}
                      </p>
                      {(event.city || event.country) && <p className="mt-1 text-base">{[event.city, event.country].filter(Boolean).join(" · ")}</p>}
                      {event.organiser && <p className="mt-1 text-base">Organiser: {event.organiser}</p>}
                      <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Official event information for ${event.name} (opens in a new tab)`}
                        className={`mt-2 inline-flex min-h-11 items-center ${linkClass}`}>Official event information</a>
                    </article>;
                  })}
                </div>
              </PageSection>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
