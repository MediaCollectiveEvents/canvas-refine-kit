// src/lib/SectionStyleProvider.tsx

import React, { createContext, useContext, ReactNode, useMemo } from "react";
import type {
  SiteStyleDefaults,
  StyleTitle,
  StyleWrapper,
  EventsDefaults,
} from "@/lib/sectionStyles";
import siteDefaults from "@/content/site-settings.json";

// ----------------------------------------------
// FALLBACK VALUES – must include ALL keys
// ----------------------------------------------
const FALLBACK: SiteStyleDefaults = {
  styleTitle: {
    align: "left",
    tone: "default",
    disableEmphasis: false,
    eyebrow: "",
    sub: "",
    size: "2rem",
    sizeSm: "2.2rem",
    sizeMd: "2.35rem",
    lineHeight: "1.15",
    weight: "300",
    accentWeight: "400",
  },
  styleWrapper: {
    variant: "clean",
    padding: "regular",
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

// ----------------------------------------------
// CONTEXT
// ----------------------------------------------
const SectionStyleContext = createContext<SiteStyleDefaults>(FALLBACK);

// ----------------------------------------------
// PROVIDER
// ----------------------------------------------
export function SectionStyleProvider({ children }: { children: ReactNode }) {
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

        // typography overrides
        size: st.size ?? FALLBACK.styleTitle.size,
        sizeSm: st.sizeSm ?? FALLBACK.styleTitle.sizeSm,
        sizeMd: st.sizeMd ?? FALLBACK.styleTitle.sizeMd,
        lineHeight: st.lineHeight ?? FALLBACK.styleTitle.lineHeight,
        weight: st.weight ?? FALLBACK.styleTitle.weight,
        accentWeight: st.accentWeight ?? FALLBACK.styleTitle.accentWeight,
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

// ----------------------------------------------
// HOOK
// ----------------------------------------------
export function useSectionStyleDefaults() {
  return useContext(SectionStyleContext);
}

export default SectionStyleProvider;