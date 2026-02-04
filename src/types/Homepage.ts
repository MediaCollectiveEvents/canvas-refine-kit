// src/ts/Homepage.ts

import { AnySection } from "./Section";

export interface Homepage {
  heroTitle: string;
  heroSubtitle: string;
  heroButtonLabel?: string;
  heroButtonUrl?: string;

  // Homepage uses generic sections driven by JSON
  sections: AnySection[];
}

export default Homepage;
