import { getOrganisations } from "../../lib/organisations";

export interface PreviewEntry {
  getIn(path: string[]): { toJS(): unknown } | unknown;
}

export function readPreviewData<T>(entry: PreviewEntry): T {
  const value = entry.getIn(["data"]);
  const raw = value && typeof value === "object" && "toJS" in value && typeof value.toJS === "function" ? value.toJS() : value;
  return (raw || {}) as T;
}

// Decap relation metadata contains the queried source file, separate from event
// content. Use it for staging-only sponsors without copying records into events.
export function previewSponsorSources(fieldsMetaData: unknown) {
  const raw = fieldsMetaData && typeof fieldsMetaData === "object" && "toJS" in fieldsMetaData && typeof fieldsMetaData.toJS === "function"
    ? fieldsMetaData.toJS() : fieldsMetaData;
  const organisations = new Map(getOrganisations().filter(row => row.id).map(row => [row.id, row]));
  let found = false;
  function visit(value: unknown) {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (key === "sponsors" && child && typeof child === "object") {
        for (const source of Object.values(child)) {
          for (const row of getOrganisations(source)) {
            if (row.id) { organisations.set(row.id, row); found = true; }
          }
        }
      } else visit(child);
    }
  }
  visit(raw);
  return found ? { organisations: [...organisations.values()] } : undefined;
}
