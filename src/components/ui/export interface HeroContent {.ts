export interface HeroContent {
  eyebrow: string;
  title: string;
  description: string;
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

export interface AboutContent {
  bio: string;
  skills: string[];
  experience: string;
}

export interface SiteContent {
  home: { hero: HeroContent; intro: string };
  work: { hero: HeroContent; projects: Project[] };
  services: { hero: HeroContent; services: Service[] };
  about: { hero: HeroContent; content: AboutContent };
  clients: ClientLogo[];
}

const defaultContent: SiteContent = {
  home: {
    hero: {
      eyebrow: "Media Professional",
      title: "Creative Excellence",
      description: "Delivering innovative media solutions for modern brands",
    },
    intro: "Welcome to our portfolio showcasing creative media work",
  },
  work: {
    hero: {
      eyebrow: "Portfolio",
      title: "Our Work",
      description: "Explore our latest projects and creative solutions",
    },
    projects: [],
  },
  services: {
    hero: {
      eyebrow: "What We Do",
      title: "Services",
      description: "Professional media services tailored to your needs",
    },
    services: [],
  },
  about: {
    hero: {
      eyebrow: "About Us",
      title: "Our Story",
      description: "Learn more about our journey and expertise",
    },
    content: {
      bio: "Add your bio here",
      skills: [],
      experience: "Add your experience here",
    },
  },
  clients: [],
};

const STORAGE_KEY = "site-content";

export const contentStore = {
  get(): SiteContent {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...defaultContent, ...JSON.parse(stored) };
    } catch {}
    return defaultContent;
  },

  save(content: SiteContent): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  },

  export(): void {
    const content = this.get();
    const dataStr = JSON.stringify(content, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `site-content-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  import(file: File): Promise<SiteContent> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          this.save(content);
          resolve(content);
        } catch {
          reject(new Error("Invalid JSON file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  },

  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
};
