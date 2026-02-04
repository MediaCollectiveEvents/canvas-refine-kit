import { AnySection } from "./Section";

export interface Topic {
  id: string;
  title: string;
  description: string;
  keywordIds: string[];
  sections: AnySection[];
}

export interface TopicsFile {
  topics: Topic[];
}
