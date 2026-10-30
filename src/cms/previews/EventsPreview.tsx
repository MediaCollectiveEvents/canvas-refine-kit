import EventsListing from "../../components/sections/EventsListing";
import { getEventParticipantIssues } from "../../lib/eventParticipants";
import { useState } from "react";
import { getEventEditIssues, normalizeEvents } from "../../lib/events";
import EventPageTemplate from "../../components/shared/EventPageTemplate";
import type { PreviewEntry } from "./HomepagePreview";
import PreviewLayout from "./PreviewLayout";
import eventsPageContent from "@/content/eventsPage.json";
import { readPreviewData } from "./previewData";

export default function EventsPreview({ entry, initialEventId }: { entry: PreviewEntry; initialEventId?: number }) {
  const [selection, setSelection] = useState(initialEventId ? String(initialEventId) : "listing");
  const value = entry.getIn(["data"]);
  const content = value && typeof value === "object" && "toJS" in value && typeof value.toJS === "function"
    ? value.toJS() : value;
  const events = normalizeEvents(content);
  const selected = events.find(event => String(event.id) === selection);
  const issues = [...getEventEditIssues(content), ...events.flatMap(event => getEventParticipantIssues(event))];
  return (
    <PreviewLayout key={selected ? selected.id : "listing"} route={selected ? `/events/${selected.id}` : "/events"} ownMain>
      <label className="relative z-[60] block bg-[#101d24] p-4 text-sm text-slate-300">
        Preview
        <select aria-label="Event preview" className="ml-3 max-w-full rounded border border-slate-500 bg-[#101d24] p-2" value={selected ? selection : "listing"} onChange={event => setSelection(event.target.value)}>
          <option value="listing">Events listing</option>
          {events.map(event => <option key={event.id} value={event.id}>{event.title || `Event ${event.id}`}</option>)}
        </select>
      </label>
      {issues.length > 0 && <div role="alert" className="p-4 text-red-300">{issues.join(" ")}</div>}
      {selected ? <main className="site-header-clearance font-body"><EventPageTemplate event={selected} onRequest={() => {}} /></main>
        : <EventsListing content={content} showPastEventsInitially />}
    </PreviewLayout>
  );
}

// Hero and individual events remain in events.json; this collection controls editorial sections.
export function LegacyEventsPagePreview({ entry }: { entry: PreviewEntry }) {
  const draft = readPreviewData<Partial<typeof eventsPageContent>>(entry);
  const layoutContent = { ...eventsPageContent, ...draft };
  return <PreviewLayout route="/events" ownMain>
    <div role="note" className="relative z-[60] bg-[#101d24] p-4 text-sm text-slate-300">
      This collection controls the introduction, event formats and categories. Edit Events Content &amp; List for the hero and individual events.
    </div>
    <EventsListing layoutContent={layoutContent} showPastEventsInitially />
  </PreviewLayout>;
}
