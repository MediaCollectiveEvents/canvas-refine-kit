import { CalendarPlus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { downloadCalendarFile, getEventCalendar } from "@/lib/eventCalendar";
import type { EventItem } from "@/lib/events";

export default function EventCalendarControl({ event, light = false, contextualLabel = false }: {
  event: EventItem;
  light?: boolean;
  contextualLabel?: boolean;
}) {
  const calendar = getEventCalendar(event);
  if (!calendar) return null;
  const itemClass = light ? "focus:bg-slate-100 focus:text-[#0B1F36]" : "focus:bg-white/10 focus:text-white";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost"
          aria-label={contextualLabel ? `Add ${event.title} to calendar` : undefined}
          className={`rounded-full font-display text-base focus-visible:ring-2 focus-visible:ring-primary ${light ? "text-[#0B1F36] hover:bg-slate-100 hover:text-[#0B1F36]" : ""}`}>
          <CalendarPlus aria-hidden="true" className="h-4 w-4" />
          Add to calendar
          <ChevronDown aria-hidden="true" className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={`max-w-[calc(100vw-48px)] font-display [&_[role=menuitem]]:text-base ${light ? "bg-white text-[#0B1F36] border-slate-200" : "bg-[var(--popover)]"}`}>
        <DropdownMenuItem asChild className={itemClass}>
          <a href={calendar.googleUrl} target="_blank" rel="noopener noreferrer" aria-label="Add event to Google Calendar (opens in a new tab)">Google Calendar</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={itemClass}>
          <a href={calendar.outlookUrl} target="_blank" rel="noopener noreferrer" aria-label="Add event to Outlook Calendar (opens in a new tab)">Outlook Calendar</a>
        </DropdownMenuItem>
        <DropdownMenuItem className={itemClass} onSelect={() => downloadCalendarFile(calendar.ics, calendar.filename)} aria-label="Download event calendar file for Apple and other calendars">Apple &amp; other calendars (.ics)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
