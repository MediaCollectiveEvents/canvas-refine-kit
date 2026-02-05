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

export interface HeroContent {
  eyebrow: string;
  title: string;
  description: string;
  backgroundImage?: string;
  variant?: "primary" | "image" | "muted";
}

export type SectionType =
  | "hero"
  | "intro"
  | "projects"
  | "services"
  | "about"
  | "events"
  | "blog"
  | "clients"
  | "custom";

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  order: number;
  enabled: boolean;
  data: any; // Flexible data structure based on section type
}

export interface Page {
  id: string;
  slug: string;
  name: string;
  sections: Section[];
}

interface ContentData {
  pages: Page[];
  // Legacy structure for backward compatibility
  home: {
    hero: HeroContent;
    intro: string;
  };
  work: {
    hero: HeroContent;
    projects: Project[];
  };
  services: {
    hero: HeroContent;
    services: Service[];
  };
  about: {
    hero: HeroContent;
    content: {
      bio: string;
      skills: string[];
      experience: string;
    };
  };
  events: {
    hero: HeroContent;
    events: Event[];
  };
  blog: {
    hero: HeroContent;
    posts: BlogPost[];
  };
  clients: ClientLogo[];
}

class ContentStore {
  private data: ContentData = {
    pages: [
      {
        id: "home",
        slug: "/",
        name: "Home",
        sections: [
          {
            id: "home-hero",
            type: "hero",
            title: "Hero Section",
            order: 0,
            enabled: true,
            data: {
              eyebrow: "Welcome",
              title: "Your Portfolio",
              description: "Showcase your amazing work",
              variant: "primary",
            },
          },
          {
            id: "home-intro",
            type: "intro",
            title: "Introduction",
            order: 1,
            enabled: true,
            data: {
              content: "Introduction text goes here",
            },
          },
          {
            id: "home-clients",
            type: "clients",
            title: "Client Logos",
            order: 2,
            enabled: true,
            data: {
              clients: [],
            },
          },
        ],
      },
      {
        id: "work",
        slug: "/work",
        name: "Work",
        sections: [
          {
            id: "work-hero",
            type: "hero",
            title: "Work Hero",
            order: 0,
            enabled: true,
            data: {
              eyebrow: "Our Work",
              title: "Portfolio",
              description: "View our projects",
              variant: "primary",
            },
          },
          {
            id: "work-projects",
            type: "projects",
            title: "Projects",
            order: 1,
            enabled: true,
            data: {
              projects: [],
            },
          },
        ],
      },
      {
        id: "services",
        slug: "/services",
        name: "Services",
        sections: [
          {
            id: "services-hero",
            type: "hero",
            title: "Services Hero",
            order: 0,
            enabled: true,
            data: {
              eyebrow: "What We Do",
              title: "Services",
              description: "Our service offerings",
              variant: "primary",
            },
          },
          {
            id: "services-list",
            type: "services",
            title: "Services List",
            order: 1,
            enabled: true,
            data: {
              services: [],
            },
          },
        ],
      },
      {
        id: "about",
        slug: "/about",
        name: "About",
        sections: [
          {
            id: "about-hero",
            type: "hero",
            title: "About Hero",
            order: 0,
            enabled: true,
            data: {
              eyebrow: "About Us",
              title: "Our Story",
              description: "Learn more about us",
              variant: "primary",
            },
          },
          {
            id: "about-content",
            type: "about",
            title: "About Content",
            order: 1,
            enabled: true,
            data: {
              bio: "Your bio goes here",
              skills: [],
              experience: "Your experience goes here",
            },
          },
        ],
      },
      {
        id: "events",
        slug: "/events",
        name: "Events",
        sections: [
          {
            id: "events-hero",
            type: "hero",
            title: "Events Hero",
            order: 0,
            enabled: true,
            data: {
              eyebrow: "Upcoming",
              title: "Events",
              description: "Join us at our events",
              variant: "primary",
            },
          },
          {
            id: "events-list",
            type: "events",
            title: "Events List",
            order: 1,
            enabled: true,
            data: {
              events: [],
            },
          },
        ],
      },
      {
        id: "blog",
        slug: "/blog",
        name: "Blog",
        sections: [
          {
            id: "blog-hero",
            type: "hero",
            title: "Blog Hero",
            order: 0,
            enabled: true,
            data: {
              eyebrow: "Insights",
              title: "Blog",
              description: "Read our latest posts",
              variant: "primary",
            },
          },
          {
            id: "blog-posts",
            type: "blog",
            title: "Blog Posts",
            order: 1,
            enabled: true,
            data: {
              posts: [],
            },
          },
        ],
      },
    ],
    // Legacy structure
    home: {
      hero: {
        eyebrow: "Welcome",
        title: "Your Portfolio",
        description: "Showcase your amazing work",
      },
      intro: "Introduction text goes here",
    },
    work: {
      hero: {
        eyebrow: "Our Work",
        title: "Portfolio",
        description: "View our projects",
      },
      projects: [],
    },
    services: {
      hero: {
        eyebrow: "What We Do",
        title: "Services",
        description: "Our service offerings",
      },
      services: [],
    },
    about: {
      hero: {
        eyebrow: "About Us",
        title: "Our Story",
        description: "Learn more about us",
      },
      content: {
        bio: "Your bio goes here",
        skills: [],
        experience: "Your experience goes here",
      },
    },
    events: {
      hero: {
        eyebrow: "Upcoming",
        title: "Events",
        description: "Join us at our events",
      },
      events: [],
    },
    blog: {
      hero: {
        eyebrow: "Insights",
        title: "Blog",
        description: "Read our latest posts",
      },
      posts: [],
    },
    clients: [],
  };

  get() {
    return this.data;
  }

  getPages() {
    return this.data.pages;
  }

  getPage(pageId: string) {
    return this.data.pages.find((p) => p.id === pageId);
  }

  updatePage(pageId: string, sections: Section[]) {
    const pageIndex = this.data.pages.findIndex((p) => p.id === pageId);
    if (pageIndex !== -1) {
      this.data.pages[pageIndex].sections = sections;
    }
  }

  addPage(page: Page) {
    this.data.pages.push(page);
  }

  deletePage(pageId: string) {
    this.data.pages = this.data.pages.filter((p) => p.id !== pageId);
  }

  updateSection(pageId: string, sectionId: string, data: any) {
    const page = this.getPage(pageId);
    if (page) {
      const section = page.sections.find((s) => s.id === sectionId);
      if (section) {
        section.data = { ...section.data, ...data };
      }
    }
  }

  reorderSections(pageId: string, sections: Section[]) {
    this.updatePage(pageId, sections);
  }

  toggleSection(pageId: string, sectionId: string) {
    const page = this.getPage(pageId);
    if (page) {
      const section = page.sections.find((s) => s.id === sectionId);
      if (section) {
        section.enabled = !section.enabled;
      }
    }
  }

  moveSection(fromPageId: string, toPageId: string, sectionId: string) {
    const fromPage = this.getPage(fromPageId);
    const toPage = this.getPage(toPageId);

    if (fromPage && toPage) {
      const sectionIndex = fromPage.sections.findIndex(
        (s) => s.id === sectionId,
      );
      if (sectionIndex !== -1) {
        const [section] = fromPage.sections.splice(sectionIndex, 1);
        section.order = toPage.sections.length;
        toPage.sections.push(section);
      }
    }
  }

  set(data: ContentData) {
    this.data = data;
  }

  update(key: keyof ContentData, value: any) {
    this.data[key] = value;
  }

  clear() {
    this.data = {
      pages: [],
      home: { hero: { eyebrow: "", title: "", description: "" }, intro: "" },
      work: { hero: { eyebrow: "", title: "", description: "" }, projects: [] },
      services: {
        hero: { eyebrow: "", title: "", description: "" },
        services: [],
      },
      about: {
        hero: { eyebrow: "", title: "", description: "" },
        content: { bio: "", skills: [], experience: "" },
      },
      events: { hero: { eyebrow: "", title: "", description: "" }, events: [] },
      blog: { hero: { eyebrow: "", title: "", description: "" }, posts: [] },
      clients: [],
    };
  }

  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const contentStore = new ContentStore();
