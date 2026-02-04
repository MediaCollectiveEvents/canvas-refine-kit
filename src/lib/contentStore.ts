// src/lib/contentStore.ts
import homepageJson from "@/content/homepage.json";

/* -------------------------------------------------------
   TYPE DEFINITIONS
------------------------------------------------------- */

export type HomepageContent = {
  heroTitle: string;
  heroSubtitle: string;
  heroButtonLabel: string;
  heroButtonUrl: string;
  heroImage?: string;

  homeIntroTitle?: string;
  homeIntroBody?: string;

  whoAttendsTitle?: string;
  whoAttendsItems?: string[];

  eventFormatsTitle?: string;
  eventFormats?: Array<{ title: string; description: string }>;

  testimonialsTitle?: string;
  testimonials?: Array<{ quote: string; author: string }>;

  [key: string]: any;
};

export interface SectionData {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  variant?: string;
  backgroundImage?: string;

  content?: string;
  bio?: string;
  experience?: string;
  skills?: string[];

  projects?: Project[];
  services?: Service[];
  events?: Event[];
  posts?: BlogPost[];
  clients?: ClientLogo[];

  [key: string]: any;
}

export interface Section {
  id: string;
  type: string;
  title: string;
  order: number;
  enabled: boolean;
  data: SectionData;
}

export interface Page {
  id: string;
  slug: string;
  name: string;
  sections: Section[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  link?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ClientLogo {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  registrationLink?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  imageUrl?: string;
  tags: string[];
}

/* -------------------------------------------------------
   IN‑MEMORY STATE
------------------------------------------------------- */

let pages: Page[] = [];

let homepage: HomepageContent = { ...(homepageJson as HomepageContent) };

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/* -------------------------------------------------------
   CONTENT STORE
------------------------------------------------------- */

export const contentStore = {
  /* -----------------------
     ID UTILITY
  ----------------------- */
  generateId,

  /* -----------------------
     PAGE BUILDER API
  ----------------------- */

  getPages(): Page[] {
    return pages;
  },

  setPages(nextPages: Page[]): void {
    pages = nextPages;
  },

  addPage(page: Page): void {
    pages = [...pages, page];
  },

  deletePage(pageId: string): void {
    pages = pages.filter((p) => p.id !== pageId);
  },

  updatePage(pageId: string, sections: Section[]): void {
    pages = pages.map((page) =>
      page.id === pageId ? { ...page, sections } : page,
    );
  },

  toggleSection(pageId: string, sectionId: string): void {
    pages = pages.map((page) => {
      if (page.id !== pageId) return page;
      return {
        ...page,
        sections: page.sections.map((section) =>
          section.id === sectionId
            ? { ...section, enabled: !section.enabled }
            : section,
        ),
      };
    });
  },

  /* -----------------------
     SECTION COPY API
  ----------------------- */

  getAllCopy(): Record<string, string> {
    const result: Record<string, string> = {};

    for (const page of pages) {
      for (const section of page.sections ?? []) {
        const fields: (keyof SectionData)[] = [
          "eyebrow",
          "title",
          "subtitle",
          "description",
          "content",
          "bio",
          "experience",
        ];

        for (const field of fields) {
          const value = section.data?.[field];
          if (typeof value === "string" && value.trim().length > 0) {
            result[`${page.id}-${section.id}-${field}`] = value;
          }
        }
      }
    }

    return result;
  },

  updateCopy(key: string, value: string): void {
    const [pageId, sectionId, field] = key.split("-");
    const fieldKey = field as keyof SectionData;

    pages = pages.map((page) => {
      if (page.id !== pageId) return page;

      return {
        ...page,
        sections: page.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                data: {
                  ...section.data,
                  [fieldKey]: value,
                },
              }
            : section,
        ),
      };
    });
  },

  /* -----------------------
     HOMEPAGE API
  ----------------------- */

  getHomepage(): HomepageContent {
    return homepage;
  },

  updateHomepageField(key: keyof HomepageContent | string, value: any): void {
    homepage = {
      ...homepage,
      [key]: value,
    };
  },

  resetHomepage(): void {
    homepage = { ...(homepageJson as HomepageContent) };
  },
};
