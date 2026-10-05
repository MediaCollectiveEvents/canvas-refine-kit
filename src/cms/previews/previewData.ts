export interface PreviewEntry {
  getIn(path: string[]): { toJS(): unknown } | unknown;
}

export function readPreviewData<T>(entry: PreviewEntry): T {
  const value = entry.getIn(["data"]);
  const raw = value && typeof value === "object" && "toJS" in value && typeof value.toJS === "function" ? value.toJS() : value;
  return (raw || {}) as T;
}
