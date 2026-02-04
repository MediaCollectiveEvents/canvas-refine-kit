export interface BaseSection {
  type: string;
  id?: string;
  title?: string;
  body?: string;
  [key: string]: any;
}

// Homepage
export interface HomeIntroSection extends BaseSection {
  type: "homeIntro";
  title: string;
  body: string;
}

export interface WhoAttendsSection extends BaseSection {
  type: "whoAttends";
  title: string;
  items: string[];
}

export interface EventFormatsSection extends BaseSection {
  type: "eventFormats";
  title: string;
  formats: { title: string; description: string }[];
}

export interface TestimonialsSection extends BaseSection {
  type: "testimonials";
  title: string;
  testimonials: { quote: string; author: string }[];
}

// Topic Pages
export interface TopicHeroSection extends BaseSection {
  type: "hero";
  title: string;
  subtitle?: string;
}

export interface TopicTextSection extends BaseSection {
  type: "text";
  title: string;
  body: string;
}

export interface TopicRelatedContentSection extends BaseSection {
  type: "relatedContent";
  title: string;
  keywordIds: string[];
}

export interface TopicsPreviewSection extends BaseSection {
  type: "topicsPreview";
  title: string;
  subtitle?: string;
}

export type AnySection =
  | HomeIntroSection
  | WhoAttendsSection
  | EventFormatsSection
  | TestimonialsSection
  | TopicHeroSection
  | TopicTextSection
  | TopicRelatedContentSection
  | TopicsPreviewSection
  | BaseSection;
