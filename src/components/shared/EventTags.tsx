import { normalizeEventThemeTags, type EventItem } from "@/lib/events";
import { getEventTags } from "@/lib/eventTags";

export default function EventTags({ event }: { event: EventItem }) {
  const themes = normalizeEventThemeTags(event.themeTags);
  return (
    <div className="space-y-2">
    <ul aria-label="Event tags" className="mt-4 flex flex-wrap gap-x-3 gap-y-2 font-display text-sm font-medium uppercase tracking-wide text-[#8FC7C1]">
      {getEventTags(event).map(tag => <li key={tag}>{tag.replaceAll("-", " ")}</li>)}
    </ul>
    {themes.length > 0 && <ul aria-label="Event themes" className="flex flex-wrap gap-x-3 gap-y-2 font-display text-sm uppercase tracking-wide text-white/65">
      {themes.map(theme => <li key={theme}>{theme}</li>)}
    </ul>}
    </div>
  );
}
