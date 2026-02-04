import { useEffect, useState } from "react";
import { contentStore, Page, HomepageContent } from "@/lib/contentStore";

export type SiteContent = {
  pages: Page[];
  homepage: HomepageContent;
};

export function useContent() {
  const [content, setContent] = useState<SiteContent>({
    pages: contentStore.getPages(),
    homepage: contentStore.getHomepage(),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setContent({
      pages: contentStore.getPages(),
      homepage: contentStore.getHomepage(),
    });
  }, []);

  const saveContent = (newContent: SiteContent) => {
    try {
      setIsLoading(true);
      setError(null);

      contentStore.setPages(newContent.pages);

      Object.entries(newContent.homepage).forEach(([key, value]) => {
        contentStore.updateHomepageField(key, value);
      });

      setContent(newContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save content");
    } finally {
      setIsLoading(false);
    }
  };

  const exportContent = () => {
    const data = {
      pages: contentStore.getPages(),
      homepage: contentStore.getHomepage(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "site-content.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  const importContent = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);

      const text = await file.text();
      const imported = JSON.parse(text) as SiteContent;

      contentStore.setPages(imported.pages);

      Object.entries(imported.homepage).forEach(([key, value]) => {
        contentStore.updateHomepageField(key, value);
      });

      setContent(imported);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import content");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetContent = () => {
    if (!confirm("Reset homepage and pages to defaults?")) return;

    contentStore.resetHomepage();
    contentStore.setPages([]);

    setContent({
      pages: contentStore.getPages(),
      homepage: contentStore.getHomepage(),
    });
  };

  const updateSection = <K extends keyof SiteContent>(
    section: K,
    value: SiteContent[K],
  ) => {
    const updated = { ...content, [section]: value };
    saveContent(updated);
  };

  return {
    content,
    updateSection,
    exportContent,
    importContent,
    resetContent,
    isLoading,
    error,
  };
}
