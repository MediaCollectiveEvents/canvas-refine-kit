import EventsListing from "../../components/sections/EventsListing";
import { getEventIssues } from "../../lib/events";
import type { PreviewEntry } from "./HomepagePreview";
import PreviewLayout from "./PreviewLayout";

export default function EventsPreview({ entry }: { entry: PreviewEntry }) {
  const value = entry.getIn(["data"]);
  const content = value && typeof value === "object" && "toJS" in value && typeof value.toJS === "function"
    ? value.toJS() : value;
  const issues = getEventIssues(content);
  return (
    <PreviewLayout route="/events" ownMain>
      {issues.length > 0 && <div role="alert" className="p-4 text-red-300">{issues.join(" ")}</div>}
      <EventsListing content={content} />
    </PreviewLayout>
  );
}

// eventsPage.json is a legacy collection; /events reads events.json instead.
export function LegacyEventsPagePreview() {
  return <PreviewLayout route="/events" ownMain>
    <div role="note" className="relative z-[60] bg-[#101d24] p-4 text-sm text-slate-300">
      This legacy configuration is not used by the live Events page. The preview below shows current Events Content &amp; List; edit that collection to update /events.
    </div>
    <EventsListing />
  </PreviewLayout>;
}
