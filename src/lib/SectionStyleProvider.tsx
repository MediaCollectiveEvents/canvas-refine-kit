// src/context/SectionStyleProvider.tsx
import React, { createContext, useContext, ReactNode, useMemo } from "react";
import type {
  SiteStyleDefaults,
  StyleTitle,
  StyleWrapper,
  EventsDefaults,
} from "@/lib/sectionStyles";
import siteDefaults from "@/content/site-settings.json";

const FALLBACK: SiteStyleDefaults = {
  styleTitle: {
    align: "center",
    tone: "default",
    disableEmphasis: false,
    eyebrow: "",
    sub: "",
  },
  styleWrapper: {
    variant: "clean",
    padding: "lux",
    noise: false,
    grid: false,
    withFades: true,
  },
  eventsDefaults: {
    imageAspect: "3:2",
    imageFit: "contain",
    imagePadding: true,
    hidePastEvents: true,
    sort: "nearest",
  },
};

// ❗ Pass an OBJECT, not a function, to createContext
const SectionStyleContext = createContext<SiteStyleDefaults>(FALLBACK);

export function SectionStyleProvider({ children }: { children: ReactNode }) {
  // Merge JSON with FALLBACK so all keys are always present
  const merged = useMemo<SiteStyleDefaults>(() => {
    const raw = siteDefaults as any;

    const st = (raw?.styleTitle ?? {}) as StyleTitle;
    const sw = (raw?.styleWrapper ?? {}) as StyleWrapper;
    const ev = (raw?.eventsDefaults ?? {}) as EventsDefaults;

    return {
      styleTitle: {
        align: st.align ?? FALLBACK.styleTitle.align,
        tone: st.tone ?? FALLBACK.styleTitle.tone,
        disableEmphasis:
          st.disableEmphasis ?? FALLBACK.styleTitle.disableEmphasis,
        eyebrow: st.eyebrow ?? FALLBACK.styleTitle.eyebrow,
        sub: st.sub ?? FALLBACK.styleTitle.sub,
      },
      styleWrapper: {
        variant: sw.variant ?? FALLBACK.styleWrapper.variant,
        padding: sw.padding ?? FALLBACK.styleWrapper.padding,
        noise: sw.noise ?? FALLBACK.styleWrapper.noise,
        grid: sw.grid ?? FALLBACK.styleWrapper.grid,
        withFades: sw.withFades ?? FALLBACK.styleWrapper.withFades,
      },
      eventsDefaults: {
        imageAspect: ev.imageAspect ?? FALLBACK.eventsDefaults.imageAspect,
        imageFit: ev.imageFit ?? FALLBACK.eventsDefaults.imageFit,
        imagePadding: ev.imagePadding ?? FALLBACK.eventsDefaults.imagePadding,
        hidePastEvents:
          ev.hidePastEvents ?? FALLBACK.eventsDefaults.hidePastEvents,
        sort: ev.sort ?? FALLBACK.eventsDefaults.sort,
      },
    };
  }, []);

  return (
    <SectionStyleContext.Provider value={merged}>
      {children}
    </SectionStyleContext.Provider>
  );
}

export function useSectionStyleDefaults() {
  return useContext(SectionStyleContext);
}

// Export default too, so you can import SectionStyleProvider either way
export default SectionStyleProvider;
