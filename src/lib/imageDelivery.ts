// Delivery variants for approved assets only. CMS source paths and originals stay intact.
const variants: Record<string, { name: string; widths: number[] }> = {
  "/uploads/Venue tiles/RAI.png": { name: "rai", widths: [320, 640, 960, 1280, 1920] },
  "/uploads/Venue tiles/Handandflower.png": { name: "hand-and-flower", widths: [320, 640, 960, 1280, 1920] },
  "/uploads/Venue tiles/Eurostar.png": { name: "eurostar", widths: [320, 640, 960, 1280, 1920] },
  "/uploads/off-air.png": { name: "off-air", widths: [320, 640, 960, 1254] },
};

export function responsiveEventImage(src: string, sizes: string) {
  const variant = variants[src];
  if (!variant) return { src };
  const url = (width: number) => `/uploads/optimised/${variant.name}-${width}.webp`;
  return {
    src: url(640),
    srcSet: variant.widths.map(width => `${url(width)} ${width}w`).join(", "),
    sizes,
  };
}

export const eventImageSizes = {
  next: "(min-width: 1024px) 396px, (min-width: 768px) calc((100vw - 96px) * 0.38), (min-width: 488px) 440px, calc(100vw - 48px)",
  discovery: "(min-width: 1280px) 221px, (min-width: 1024px) calc(40vw - 12px), (min-width: 768px) calc(50vw - 44px), calc((100vw - 64px) / 3)",
  listing: "(min-width: 1024px) 440px, (min-width: 640px) calc((100vw - 84px) / 3), calc((100vw - 68px) / 3)",
  detail: "(min-width: 1024px) min(480px, 32vw), (min-width: 640px) calc(100vw - 64px), calc(100vw - 48px)",
};

export const headerLogoImage = {
  src: "/uploads/optimised/header-logo-320.webp",
  srcSet: [160, 320, 540, 800].map(width => `/uploads/optimised/header-logo-${width}.webp ${width}w`).join(", "),
  sizes: "(min-width: 1024px) 180px, 160px",
};
