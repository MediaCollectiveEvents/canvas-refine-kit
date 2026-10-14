import Community from "@/pages/Community";
import communityContent from "@/content/community.json";
import { PreviewProviders } from "./PreviewLayout";
import { readPreviewData, type PreviewEntry } from "./previewData";

export default function CommunityPreview({ entry }: { entry: PreviewEntry }) {
  const draft = readPreviewData<Partial<typeof communityContent>>(entry);
  const content = { ...communityContent, ...draft, hero: { ...communityContent.hero, ...draft.hero } };
  return <PreviewProviders route="/community"><Community content={content} /></PreviewProviders>;
}
