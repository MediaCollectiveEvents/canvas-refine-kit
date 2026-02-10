// src/hooks/useBlog.ts
// Loads blog posts from src/content/blog/*.json (filename = slug)

export type BlogPost = {
  slug: string; // derived from filename
  title: string;
  date?: string; // ISO string
  excerpt?: string;
  coverImage?: string;
  content?: string; // HTML (Decap can generate or you can pre-render)
  tags?: string[];
  [key: string]: any;
};

// NOTE: path is relative to this file (src/hooks → ../content/blog/*.json)
const postModules = import.meta.glob("../content/blog/*.json", { eager: true });

function fileSlug(path: string) {
  const filename = path.split("/").pop()!;
  return filename.replace(/\.json$/, "");
}

export function getAllPosts(): BlogPost[] {
  const posts: BlogPost[] = [];
  for (const [path, mod] of Object.entries(postModules)) {
    const slug = fileSlug(path);
    // @ts-ignore - Vite eager JSON may be under .default
    const data = (mod as any).default ?? mod;
    posts.push({ slug, ...data });
  }
  // newest first if date present
  posts.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  return posts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const key = Object.keys(postModules).find((k) => k.endsWith(`${slug}.json`));
  if (!key) return undefined;
  // @ts-ignore
  const mod = (postModules as any)[key];
  const data = (mod?.default ?? mod) as Record<string, any>;
  return { slug, ...data } as BlogPost;
}
