import { getAudienceSnapshotIssues } from "@/lib/audienceSnapshot";
import { getEventEditIssues } from "@/lib/events";

interface CmsEntry {
  get(key: string): unknown;
  getIn(path: string[]): unknown;
}

export function getCmsContentIssues(path: string, data: unknown): string[] {
  if (path === "src/content/events.json") return getEventEditIssues(data);
  if (path === "src/content/community.json") return getAudienceSnapshotIssues(data);
  return [];
}

export function validateCmsEntry({ entry }: { entry: CmsEntry }) {
  const value = entry.getIn(["data"]);
  const data = value && typeof value === "object" && "toJS" in value && typeof value.toJS === "function" ? value.toJS() : value;
  const issues = getCmsContentIssues(String(entry.get("path") ?? ""), data);
  if (issues.length) throw new Error(`Nothing was saved. ${issues.join(" ")}`);
}

export interface ContentValidationCMS {
  registerEventListener(listener: { name: "preSave"; handler: typeof validateCmsEntry }): void;
}

export function registerContentValidation(cms: ContentValidationCMS) {
  cms.registerEventListener({ name: "preSave", handler: validateCmsEntry });
}
