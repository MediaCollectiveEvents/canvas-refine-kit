import { useEffect, useState } from "react";
import { contentStore, SiteContent } from "@/lib/contentStore";

export function useContent() {
  const [content, setContent] = useState<SiteContent>(contentStore.get());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setContent(contentStore.get());
  }, []);

  const saveContent = (newContent: SiteContent) => {
    try {
      setIsLoading(true);
      setError(null);
      contentStore.save(newContent);
      setContent(newContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSection = <K extends keyof SiteContent>(
    section: K,
    data: SiteContent[K],
  ) => {
    const newContent = { ...content, [section]: data };
    saveContent(newContent);
  };

  const exportContent = () => contentStore.export();

  const importContent = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      const imported = await contentStore.import(file);
      setContent(imported);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import");
    } finally {
      setIsLoading(false);
    }
  };

  const resetContent = () => {
    if (confirm("Are you sure? This will reset all content to defaults.")) {
      contentStore.reset();
      setContent(contentStore.get());
    }
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
