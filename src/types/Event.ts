export interface Event {
  id: number;
  title: string;
  location: string;
  venue: string;
  imageKey: string;
  keywordIds: string[];
  date?: string;
  slug?: string;
}

export interface EventsFile {
  events: Event[];
}
