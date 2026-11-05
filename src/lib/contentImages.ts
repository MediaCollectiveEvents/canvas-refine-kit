const deliveryVariants: Record<string, string> = {
  "/src/assets/sponsors/dce-agency.png": "/src/assets/sponsors/dce-agency.webp",
  "/src/assets/sponsors/giant-worldwide.png": "/src/assets/sponsors/giant-worldwide.webp",
  "/src/assets/sponsors/rsg-media.png": "/src/assets/sponsors/rsg-media.webp",
  "/src/assets/sponsors/zille.png": "/src/assets/sponsors/zille.webp",
  "/src/assets/sponsors/Netactuate-Black-Logo-H (2).png": "/src/assets/sponsors/Netactuate-Black-Logo-H (2).webp"
};
// Vite emits repository assets for production while preserving stored CMS paths.
const assets = import.meta.glob<string>("/src/assets/{sponsors,blog}/*", { eager: true, query: "?url", import: "default" });
export function contentImage(src?: string): string | undefined {
  const resolved = src ? assets[deliveryVariants[src] ?? src] ?? src : undefined;
  return resolved && !/^data:image\/[^;]+;base64,$/.test(resolved) ? resolved : undefined;
}
