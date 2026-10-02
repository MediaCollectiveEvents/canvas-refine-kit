// Vite emits repository assets for production while preserving stored CMS paths.
const assets = import.meta.glob<string>("/src/assets/{sponsors,blog}/*", { eager: true, query: "?url", import: "default" });
export function contentImage(src?: string): string | undefined {
  const resolved = src ? assets[src] ?? src : undefined;
  return resolved && !/^data:image\/[^;]+;base64,$/.test(resolved) ? resolved : undefined;
}
