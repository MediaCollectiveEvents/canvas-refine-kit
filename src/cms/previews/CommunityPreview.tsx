import Community from "@/pages/Community";
import communityContent from "@/content/community.json";
import { PreviewProviders } from "./PreviewLayout";
import { readPreviewData, type PreviewEntry } from "./previewData";
import { getAudienceSnapshotIssues } from "@/lib/audienceSnapshot";

export default function CommunityPreview({ entry }: { entry: PreviewEntry }) {
  const draft = readPreviewData<Partial<typeof communityContent>>(entry);
  const content = { ...communityContent, ...draft, hero: { ...communityContent.hero, ...draft.hero } };
  const issues = getAudienceSnapshotIssues(content);
  if (!issues.length) return <PreviewProviders route="/community"><Community content={content} /></PreviewProviders>;
  return <PreviewProviders route="/community">
    <div role="alert" className="relative z-[60] bg-[#101d24] p-4 text-red-300">{issues.join(" ")} Correct the format or restore the saved section ID before saving. The last saved figures are used for malformed snapshot rows.</div>
    <Community content={content} />
  </PreviewProviders>;
}
