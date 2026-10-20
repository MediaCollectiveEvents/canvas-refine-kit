// Shared by the React picture and build-time preload so candidate selection matches.
export const mobileHeroDelivery = Object.freeze({
  source: "/uploads/website-hero-mobile-v2.png",
  fallback: "/uploads/website-hero-mobile-v2.webp",
  width: 1080,
  height: 1350,
  media: "(width < 640px)",
  // Public mobile heroes fill the viewport width, anchored bottom-left.
  // The picture and initial preload must use the same painted-width hint.
  sizes: "100vw",
  srcSet: [320, 480, 640, 800].map(width => `/uploads/website-hero-mobile-v2-${width}.webp ${width}w`)
    .concat("/uploads/website-hero-mobile-v2.webp 1080w").join(", "),
});

export function mobileHeroPreload() {
  const { fallback, media, sizes, srcSet } = mobileHeroDelivery;
  return `<link rel="preload" as="image" type="image/webp" href="${fallback}" media="${media}" imagesrcset="${srcSet}" imagesizes="${sizes}" fetchpriority="high">`;
}
