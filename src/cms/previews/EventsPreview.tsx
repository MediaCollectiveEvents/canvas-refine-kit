import EventsListing from "../../components/sections/EventsListing";
import { getEventIssues } from "../../lib/events";
import type { PreviewEntry } from "./HomepagePreview";
import PreviewLayout from "./PreviewLayout";
import eventsPageContent from "@/content/eventsPage.json";
import { readPreviewData } from "./previewData";

export default function EventsPreview({ entry }: { entry: PreviewEntry }) {
  const value = entry.getIn(["data"]);
  const content = value && typeof value === "object" && "toJS" in value && typeof value.toJS === "function"
    ? value.toJS() : value;
  const issues = getEventIssues(content);
  return (
    <PreviewLayout route="/events" ownMain>
      {issues.length > 0 && <div role="alert" className="p-4 text-red-300">{issues.join(" ")}</div>}
      <EventsListing content={content} showPastEventsInitially />
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
