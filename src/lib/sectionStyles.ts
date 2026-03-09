// src/lib/sectionStyles.ts

export interface StyleTitle {
  align?: "left" | "center";
  tone?: "default" | "brand" | "soft";
  disableEmphasis?: boolean;
  eyebrow?: string;
  sub?: string;

  // NEW TYPOGRAPHY TOKENS (required for SectionStyleProvider)
  size?: string;
  sizeSm?: string;
  sizeMd?: string;
  lineHeight?: string;
  weight?: string;
  accentWeight?: string;
}

export interface StyleWrapper {
  variant?: "clean" | "tint" | "glow" | "glass" | "light" | "dark" | "transparent";
  padding?: "regular" | "lux";
  noise?: boolean;
  grid?: boolean;
  withFades?: boolean;
}

export interface EventsDefaults {
  imageAspect?: string;
  imageFit?: string;
  imagePadding?: boolean;
  hidePastEvents?: boolean;
  sort?: "nearest" | "latest";
}

export interface SiteStyleDefaults {
  styleTitle: StyleTitle;
  styleWrapper: StyleWrapper;
  eventsDefaults: EventsDefaults;
}