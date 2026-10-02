import EventsListing from "../../components/sections/EventsListing";
import { getEventIssues } from "../../lib/events";
import type { PreviewEntry } from "./HomepagePreview";

export default function EventsPreview({ entry }: { entry: PreviewEntry }) {
  const value = entry.getIn(["data"]);
  const content = value && typeof value === "object" && "toJS" in value && typeof value.toJS === "function"
    ? value.toJS() : value;
  const issues = getEventIssues(content);
  return (
    <div className="min-h-screen text-white bg-[var(--background-dark)]">
      {issues.length > 0 && <div role="alert" className="p-4 text-red-300">{issues.join(" ")}</div>}
      <EventsListing content={content} />
    </div>
  );
}
