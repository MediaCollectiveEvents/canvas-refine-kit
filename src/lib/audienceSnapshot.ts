export const AUDIENCE_SNAPSHOT_ID = "community-audience-snapshot";

export function parseAudienceSnapshot(value: unknown) {
  const stats: { value: string; label: string }[] = [];
  const issues: string[] = [];
  const lines = typeof value === "string" ? value.split(/\r?\n/).map(line => line.trim()).filter(Boolean) : [];
  if (lines.length !== 3) issues.push("Audience snapshot needs exactly three lines, each written as number — label.");
  const labels = new Set<string>();
  lines.forEach((line, index) => {
    const match = line.match(/^((?:0|[1-9]\d*))\s*—\s*([^—]+)$/u);
    if (!match || !Number.isSafeInteger(Number(match[1])) || !match[2].trim()) {
      issues.push(`Audience snapshot line ${index + 1}: use a whole number, an em dash (—), and a label.`);
      return;
    }
    const label = match[2].trim();
    if (labels.has(label.toLocaleLowerCase("en-GB"))) issues.push(`Audience snapshot repeats the label “${label}”.`);
    labels.add(label.toLocaleLowerCase("en-GB"));
    stats.push({ value: match[1], label });
  });
  // Never display a partially parsed set of figures.
  return { stats: issues.length ? [] : stats, issues };
}

export function getAudienceSnapshotIssues(source: unknown): string[] {
  const sections = source && typeof source === "object" && "sections" in source && Array.isArray(source.sections) ? source.sections : [];
  const snapshots = sections.filter(section => section?.id === AUDIENCE_SNAPSHOT_ID);
  if (snapshots.length !== 1 || snapshots[0].type !== "editorial") {
    return [`Keep exactly one editorial section with ID ${AUDIENCE_SNAPSHOT_ID}.`];
  }
  return parseAudienceSnapshot(snapshots[0].heading).issues;
}
