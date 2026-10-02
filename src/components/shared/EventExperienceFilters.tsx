import { Button } from "@/components/ui/button";
import { EVENT_EXPERIENCE_FILTERS, type EventExperienceFilter } from "@/lib/events";

interface EventExperienceFiltersProps {
  value: EventExperienceFilter;
  onChange: (value: EventExperienceFilter) => void;
  resultsId: string;
  light?: boolean;
}

export default function EventExperienceFilters({ value, onChange, resultsId, light = false }: EventExperienceFiltersProps) {
  return (
    <div role="group" aria-label="Event experience" className="flex flex-wrap items-center justify-start gap-2 md:gap-3">
      {EVENT_EXPERIENCE_FILTERS.map(({ value: category, label }) => (
        <Button key={category} type="button" size="default"
          variant={value === category ? "brand" : "ghost"}
          aria-pressed={value === category}
          aria-controls={resultsId}
          onClick={() => onChange(category)}
          className={`h-10 rounded-full px-4 py-2 font-body text-sm leading-5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${light ? "focus-visible:ring-offset-white text-[#0B1F36]" : "focus-visible:ring-offset-background"}`}>
          {label}
        </Button>
      ))}
    </div>
  );
}
