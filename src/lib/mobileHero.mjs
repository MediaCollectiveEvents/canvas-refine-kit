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

function secondaryHero(name) {
  const base = `/uploads/website-hero-${name}-mobile`;
  return Object.freeze({
    source: `${base}.png`, fallback: `${base}.webp`, width: 675, height: 844,
    media: mobileHeroDelivery.media, sizes: mobileHeroDelivery.sizes,
    srcSet: [320, 480, 640].map(width => `${base}-${width}.webp ${width}w`)
      .concat(`${base}.webp 675w`).join(", "),
  });
}

const eventsHero = secondaryHero("events");
const communityHero = secondaryHero("community");
export const mobileHeroes = Object.freeze({
  "/": mobileHeroDelivery,
  "/events": eventsHero,
  "/community": communityHero,
  "/partners": communityHero,
});

export function mobileHeroPreload(path = "/") {
  const { fallback, media, sizes, srcSet } = mobileHeroes[path] ?? mobileHeroDelivery;
  return `<link rel="preload" as="image" type="image/webp" href="${fallback}" media="${media}" imagesrcset="${srcSet}" imagesizes="${sizes}" fetchpriority="high">`;
}
