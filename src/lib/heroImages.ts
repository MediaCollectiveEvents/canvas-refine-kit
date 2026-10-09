// Lossless delivery variants only: source artwork and CMS image paths stay intact.
const losslessHeroes: Readonly<Record<string, string>> = {
  "/uploads/home-hero-v14.png": "/uploads/home-hero-v14.webp",
  "/uploads/events-hero-event-v3.png": "/uploads/events-hero-event-v3.webp",
  "/uploads/partners-hero-v2.png": "/uploads/partners-hero-v2.webp",
  "/uploads/website-hero-mobile.png": "/uploads/website-hero-mobile.webp",
};

export function losslessHeroSource(source: string): string | undefined {
  return losslessHeroes[source];
}

export function heroBackground(source: string): string {
  const fallback = `url(${JSON.stringify(source)})`;
  const optimized = losslessHeroSource(source);
  if (!optimized) return fallback;
  const responsive = `image-set(url(${JSON.stringify(optimized)}) type("image/webp"), ${fallback} type("image/png"))`;
  return typeof CSS !== "undefined" && CSS.supports("background-image", responsive) ? responsive : fallback;
}
