// src/lib/homepage.ts

export type HomepageSectionType =
  | "aboutIntro"
  | "whoAttends"
  | "upcomingEventsIntro"
  | "testimonials"
  | "partners"
  | "joinCommunity"
  | "newHere"
  | "forBrands"
  | "cta";

export interface CtaSection {
  type: "cta";
  title?: string;
  accentWord?: string;
  description?: string;
  button?: {
    label: string;
    url: string;
  };
}

export interface AboutIntroSection {
  type: "aboutIntro";
  heading?: string;
  body?: string;
  extended?: string;
}

export interface WhoAttendsSection {
  type: "whoAttends";
  heading?: string;
  audienceGroups?: string[];
  statistics?: {
    companies?: string;
    boardLevel?: string;
    founders?: string;
  };
  highlights?: string[];
}

export interface UpcomingEventsIntroSection {
  type: "upcomingEventsIntro";
  heading?: string;
  description?: string;
  note?: string;
  cta?: { label: string; url: string };
  secondaryCta?: { label: string; url: string };
}

export interface TestimonialsSection {
  type: "testimonials";
  heading?: string;
  items?: {
    quote: string;
    name?: string;
    role?: string;
    company?: string;
  }[];
}

export interface PartnersSection {
  type: "partners";
  heading?: string;
  description?: string;
  logos?: {
    name: string;
    logoUrl: string;
    websiteUrl?: string;
  }[];
}

export interface JoinCommunitySection {
  type: "joinCommunity";
  heading?: string;
  body?: string;
  cta?: { label: string; url: string };
}

export interface NewHereSection {
  type: "newHere";
  heading?: string;
  body?: string;
  cta?: { label: string; url: string };
}

export interface ForBrandsSection {
  type: "forBrands";
  heading?: string;
  body?: string;
  cta?: { label: string; url: string };
}

export type HomepageSection =
  | AboutIntroSection
  | WhoAttendsSection
  | UpcomingEventsIntroSection
  | TestimonialsSection
  | PartnersSection
  | JoinCommunitySection
  | NewHereSection
  | ForBrandsSection
  | CtaSection;

export interface HomepageContent {
  hero: {
    title: string;
    subtitle?: string;
    description?: string;
    primaryCta?: { label: string; url: string };
    secondaryCta?: { label: string; url: string };
  };
  sections: HomepageSection[];
}
