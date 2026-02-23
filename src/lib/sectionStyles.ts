// src/lib/sectionStyles.ts
export type Align = "center" | "left" | "right";
export type Tone = "default" | "muted";
export type Variant = "clean" | "tint" | "glow";
export type Padding = "lux" | "regular";

export interface StyleTitle {
  eyebrow?: string;
  sub?: string;
  align?: Align;
  tone?: Tone;
  disableEmphasis?: boolean;
}

export interface StyleWrapper {
  variant?: Variant;
  padding?: Padding;
  noise?: boolean;
  grid?: boolean;
  withFades?: boolean;
}

export interface EventsDefaults {
  imageAspect?: "3:2" | "16:9" | "1:1";
  imageFit?: "contain" | "cover";
  imagePadding?: boolean;
  hidePastEvents?: boolean;
  sort?: "nearest" | "none";
}

export interface SiteStyleDefaults {
  styleTitle: StyleTitle;
  styleWrapper: StyleWrapper;
  eventsDefaults: EventsDefaults;
}
