// src/utils/loadSections.ts
// Loads shared sections from src/content/sections and returns a keyed dictionary
export type SectionEntry = Record<string, any>;

export async function loadSections(
  keys: string[],
): Promise<Record<string, SectionEntry>> {
  // Relative to this file (src/utils → ../content/sections)
  const modules = import.meta.glob("../content/sections/*.json", {
    eager: true,
  });

  const lookup: Record<string, SectionEntry> = {};
  Object.entries(modules).forEach(([path, mod]) => {
    const file = path.split("/").pop()!;
    const name = file.replace(/\.json$/, "");
    // @ts-ignore - Vite eager JSON can be under .default
    const content = (mod as any).default ?? mod;
    lookup[name] = content;
  });

  const result: Record<string, SectionEntry> = {};
  keys.forEach((k) => {
    if (lookup[k]) result[k] = lookup[k];
  });
  return result;
}
