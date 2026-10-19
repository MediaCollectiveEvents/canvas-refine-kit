// Shared by the React picture and build-time preload so candidate selection matches.
export const mobileHeroDelivery = Object.freeze({
  source: "/uploads/website-hero-mobile.png",
  fallback: "/uploads/website-hero-mobile.webp",
  media: "(width < 640px)",
  sizes: "100vw",
  srcSet: [480, 640, 960, 1280].map(width => `/uploads/website-hero-mobile-${width}.webp ${width}w`)
    .concat("/uploads/website-hero-mobile.webp 1620w").join(", "),
});

export function mobileHeroPreload() {
  const { fallback, media, sizes, srcSet } = mobileHeroDelivery;
  return `<link rel="preload" as="image" type="image/webp" href="${fallback}" media="${media}" imagesrcset="${srcSet}" imagesizes="${sizes}" fetchpriority="high">`;
}
