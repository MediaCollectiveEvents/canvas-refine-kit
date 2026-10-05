import Home from "@/pages/Home";
import homepageContent from "@/content/homepage.json";
import { PreviewProviders } from "./PreviewLayout";
import { readPreviewData, type PreviewEntry } from "./previewData";

export type { PreviewEntry } from "./previewData";

export default function HomepagePreview({ entry }: { entry: PreviewEntry }) {
  const raw = readPreviewData<Partial<typeof homepageContent> & { content?: Partial<typeof homepageContent>; homepage?: Partial<typeof homepageContent> }>(entry);
  const data = raw.hero || raw.sections ? raw : raw.content || raw.homepage || raw;
  const content = { ...homepageContent, ...data, hero: { ...homepageContent.hero, ...data.hero } };
  return <PreviewProviders route="/"><Home content={content} /></PreviewProviders>;
}
