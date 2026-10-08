import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Seo from "@/components/shared/Seo";
import { Button } from "@/components/ui/button";
import EventExperienceFilters from "@/components/shared/EventExperienceFilters";
import EventCalendarControl from "@/components/shared/EventCalendarControl";
import {
  EVENT_EXPERIENCE_LABELS, formatEventDate, getAllEvents,
  isPastEvent, type EventExperienceFilter,
} from "@/lib/events";
import { downloadCalendarFile, getYearCalendarSnapshot } from "@/lib/eventCalendar";

import { filterPlannerEntriesByTime, PLANNER_SOURCES, showsPlannerExperiences, filterPlannerEntriesBySource, type PlannerSource, filterPlannerEntriesByLocation, getPlannerLocations, getIndustryEvents, getIndustryAccessLabel, getIndustryPlannerMonths, getIndustryPlannerYears, getPlannerEntryLink, getUndatedIndustryEvents } from "@/lib/industryEvents";

const mediaEvents = getAllEvents();
const industryEvents = getIndustryEvents();
const years = getIndustryPlannerYears(mediaEvents, industryEvents);
const currentYear = new Date().getFullYear();
const defaultYear = years.includes(currentYear) ? currentYear : years.find(year => year > currentYear) ?? years.at(-1);
const undated = getUndatedIndustryEvents(industryEvents);
const description = "Plan your year with The Media Collective. Explore networking gatherings, conference-aligned events and knowledge-led forums.";

export default function EventPlanner() {
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [experience, setExperience] = useState<EventExperienceFilter>("all");
  const [year, setYear] = useState(defaultYear ?? 2026);
  const [source, setSource] = useState<PlannerSource>("all");
  const [location, setLocation] = useState("all");
  const locations = getPlannerLocations(year, mediaEvents, industryEvents);
  const months = getIndustryPlannerMonths(year, experience, mediaEvents, industryEvents, location, source).map(month => ({ ...month, entries: filterPlannerEntriesByTime(month.entries, upcomingOnly) }));
  const visibleUndated = filterPlannerEntriesBySource(filterPlannerEntriesByLocation(undated.map(event => ({ kind: "external" as const, event })), location), source).filter(entry => entry.kind === "external");
  // Snapshot always includes the whole year, independently of the visible filter.
  const snapshot = getYearCalendarSnapshot(mediaEvents, year);
  const visibleCount = months.reduce((count, month) => count + month.entries.length, 0);

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#0B1F36] font-body">
      <Seo title={`${year} Industry Calendar — The Media Collective`} description={description} url="/events/calendar" />
      <Header />
      <main className="px-6 pt-36 pb-16 lg:pt-40">
        <div className="container mx-auto max-w-6xl">
          <Link to="/events" className="font-display text-sm text-slate-600 underline underline-offset-4 hover:text-[#0B1F36]">← All events</Link>
          <h1 className="mt-8 font-display text-[40px] font-light leading-tight md:text-5xl">{year} Industry Calendar</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600">{description}</p>
          <div className="mt-5 flex flex-wrap gap-3" role="group" aria-label="Calendar time range">
            <Button variant="ghost" className={upcomingOnly ? "bg-[#eaf4f2] font-medium text-[#245d55]" : "text-slate-600"} aria-pressed={upcomingOnly} onClick={() => setUpcomingOnly(true)}>Upcoming only</Button>
            <Button variant="ghost" className={!upcomingOnly ? "bg-[#eaf4f2] font-medium text-[#245d55]" : "text-slate-600"} aria-pressed={!upcomingOnly} onClick={() => setUpcomingOnly(false)}>Full year</Button>
          </div>
          <div role="group" aria-label="Planner source" className="mt-7 flex flex-wrap items-center gap-2">
            {PLANNER_SOURCES.map(option => <Button key={option.value} variant={source === option.value ? "brand" : "ghost"}
              aria-pressed={source === option.value} aria-controls="year-planner" onClick={() => setSource(option.value)}
              className="h-10 rounded-full px-4 py-2 text-sm leading-5 focus-visible:ring-2 focus-visible:ring-[#27CDBA]">
              {option.label}
            </Button>)}
          </div>
          <div role="group" aria-label="Planner year" className="mt-3 flex flex-wrap gap-2">
            {years.map(option => <Button key={option} variant="ghost" aria-pressed={year === option} onClick={() => { setYear(option); setLocation("all"); }}
              className={`rounded-full px-4 text-sm ${year === option ? "bg-[#eaf4f2] font-medium text-[#245d55]" : "text-slate-600"}`}>{option}</Button>)}
          </div>
          {showsPlannerExperiences(source) && <div className="mt-3">
            <EventExperienceFilters value={experience} onChange={setExperience} resultsId="year-planner" light />
          </div>}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label htmlFor="planner-location" className="font-display text-sm text-slate-600">Location</label>
            <select id="planner-location" value={location} onChange={event => setLocation(event.target.value)} aria-controls="year-planner"
              className="font-display max-w-full rounded-full border border-slate-200 bg-transparent py-2 pl-3 pr-8 text-sm text-[#0B1F36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#27CDBA]">
              <option value="all">All locations</option>
              {locations.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
          {source === "all" && <p className="mt-2 text-sm text-slate-500">Experience filters apply to Media Collective events. External industry events remain visible in this view.</p>}
          <div className="mt-4">
            <Button variant="ghost" disabled={!snapshot.includedCount}
              onClick={() => downloadCalendarFile(snapshot.ics, snapshot.filename)}
              className="h-auto max-w-full rounded-full px-4 py-2 whitespace-normal text-left text-sm text-[#0B1F36] hover:bg-slate-100 hover:text-[#0B1F36] focus-visible:ring-2 focus-visible:ring-[#27CDBA]">
              Download {year} Media Collective calendar (.ics)
            </Button>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">A snapshot of currently announced Media Collective events. External industry events are excluded. Download again for updates. Saving an event does not confirm attendance.</p>
            {snapshot.omittedCount > 0 && <p className="mt-2 text-sm text-slate-600">{snapshot.omittedCount} {snapshot.omittedCount === 1 ? "event needs" : "events need"} confirmed times before inclusion in the calendar download.</p>}
          </div>
          <p role="status" className="mt-6 text-sm text-slate-500">{visibleCount} {visibleCount === 1 ? "event" : "events"} shown for {year}</p>
          {visibleCount === 0 && <p className="mt-8 text-base text-slate-600">No events match these filters. Try another year, location or source, or choose Full year.</p>}
          <div id="year-planner" className="mt-8 grid grid-cols-1 gap-y-8 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-12">
            {months.filter(month => month.entries.length > 0).map(month => {
              const name = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, month.month - 1, 1)));
              const empty = month.entries.length ? undefined : month.announcedCount ? "No matching events this month" : "No events announced";
              return (
                <section key={month.month} aria-labelledby={`month-${month.month}`} className="min-w-0 border-t border-slate-200 pt-4">
                  <h2 id={`month-${month.month}`} className="font-display text-2xl font-light">{name} <span className="lg:sr-only">{year}</span></h2>
                  {empty ? <p className="mt-3 text-sm text-slate-500">{empty}</p> : (
                    <div className="mt-5 space-y-8">
                      {month.entries.map(entry => {
                        if (entry.kind === "external") {
                          const event = entry.event;
                          const accessLabel = getIndustryAccessLabel(event);
                          const label = event.category === "trade-show" ? "Major industry show" : `Industry organisation · ${event.organiser.startsWith("DPP") ? "DPP" : event.organiser}`;
                          return <article key={`external-${event.id}`} className="min-w-0 text-slate-600">
                            <p className="font-display text-xs uppercase tracking-wide text-slate-500">{label}</p>
                            <p className="mt-2 text-sm"><time dateTime={event.startDate}>{formatEventDate(event.startDate!)}</time>
                              {event.endDate && event.endDate !== event.startDate && <> – <time dateTime={event.endDate}>{formatEventDate(event.endDate)}</time></>}
                              {event.status === "planned" && " · Planned"}
                            </p>
                            <h3 className="mt-2 break-words text-base font-medium leading-snug">{event.name}</h3>
                            <p className="mt-2 text-sm">{event.organiser}</p>
                            {accessLabel && <p className="mt-1 font-display text-xs font-medium text-[#245d55]">{accessLabel}</p>}
                            {(event.city || event.country) && <p className="mt-1 text-sm">{[event.city, event.country].filter(Boolean).join(" · ")}</p>}
                            <a href={getPlannerEntryLink(entry)} target="_blank" rel="noopener noreferrer" aria-label={`Official event information for ${event.name} (opens in a new tab)`}
                              className="font-display mt-3 inline-block text-sm underline underline-offset-4 hover:text-[#0B1F36]">Official event information ↗</a>
                          </article>;
                        }
                        const event = entry.event;
                        return (
                        <article key={`media-${event.id}`} className="min-w-0">
                          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#245d55]">The Media Collective</p>
                          <p className="mb-2 font-display text-xs font-medium text-[#245d55]">Invitation only</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                            <time dateTime={event.date}>{formatEventDate(event.date).replace(` ${year}`, "")}</time>
                            {isPastEvent(event) && <span className="font-normal normal-case tracking-normal text-slate-500">Past event</span>}
                          </div>
                          <h3 className="mt-2 break-words text-lg font-medium leading-snug">
                            <Link to={`/events/${event.id}`} className="hover:underline underline-offset-4">{event.title}</Link>
                          </h3>
                          {event.time && <p className="mt-3 text-sm text-slate-600">{event.time}</p>}
                          {(event.venue || event.location) && <p className="mt-1 text-sm leading-relaxed text-slate-600">{[event.venue, event.location].filter(Boolean).join(" · ")}</p>}
                          {!!event.experienceCategories?.length && <ul aria-label="Event experiences" className="mt-3 flex flex-wrap gap-2">
                            {event.experienceCategories.map(category => <li key={category} className="rounded-full bg-[#eaf4f2] px-2 py-1 text-xs leading-relaxed text-[#245d55]">{EVENT_EXPERIENCE_LABELS[category]}</li>)}
                          </ul>}
                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <Link to={`/events/${event.id}`} aria-label={`View ${event.title}`} className="font-display text-sm font-medium underline underline-offset-4 decoration-[#27CDBA]">Learn more</Link>
                            <EventCalendarControl event={event} light contextualLabel />
                          </div>
                        </article>
                      );})}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
          {visibleUndated.length > 0 && <section className="mt-12" aria-labelledby="awaiting-dates">
            <h2 id="awaiting-dates" className="font-display text-2xl font-light">Dates awaiting confirmation</h2>
            <ul className="mt-4 space-y-3">{visibleUndated.map(({event}) => <li key={event.id}>
              <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline underline-offset-4">{event.name} · {event.organiser} ↗</a>
            </li>)}</ul>
          </section>}
        </div>
      </main>
      <div className="bg-[var(--background-dark)]"><Footer /></div>
    </div>
  );
}
