import source from "@/content/taxonomy.json";

export type TaxonomyDimension = "areas" | "topics";
export interface TaxonomyValue { id: string; label: string; description: string; active: boolean }
export interface Taxonomy { areas: TaxonomyValue[]; topics: TaxonomyValue[] }
export interface TaxonomyMetadata { areas?: string[]; topics?: string[] }
const dimensions: TaxonomyDimension[] = ["areas", "topics"];
const validId = (id: unknown): id is string => typeof id === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

function rows(value: unknown, dimension: TaxonomyDimension): Record<string, unknown>[] {
  const items = record(value)[dimension];
  return Array.isArray(items) ? items.map(record) : [];
}

/** IDs must be unique across both dimensions, not just within a list. */
export function getTaxonomyIssues(value: unknown = source): string[] {
  const issues: string[] = [];
  const counts = new Map<string, number>();
  for (const dimension of dimensions) {
    if (!Array.isArray(record(value)[dimension])) issues.push(`${dimension} must be an array.`);
    rows(value, dimension).forEach((row, index) => {
      if (!validId(row.id)) issues.push(`${dimension}[${index}] needs a valid stable ID.`);
      else counts.set(row.id, (counts.get(row.id) ?? 0) + 1);
      if (typeof row.label !== "string" || !row.label.trim() || typeof row.description !== "string" || !row.description.trim() || typeof row.active !== "boolean") issues.push(`${dimension}[${index}] needs a label, description and boolean active value.`);
    });
  }
  counts.forEach((count, id) => { if (count > 1) issues.push(`Duplicate taxonomy ID: ${id}`); });
  return issues;
}

export function getTaxonomy(value: unknown = source): Taxonomy {
  const allRows = dimensions.flatMap(dimension => rows(value, dimension));
  const normalize = (dimension: TaxonomyDimension): TaxonomyValue[] => rows(value, dimension).flatMap(row => {
    if (!validId(row.id) || allRows.filter(other => other.id === row.id).length !== 1 || typeof row.label !== "string" || !row.label.trim() || typeof row.description !== "string" || !row.description.trim() || typeof row.active !== "boolean") return [];
    return [{ id: row.id, label: row.label, description: row.description, active: row.active }];
  });
  return { areas: normalize("areas"), topics: normalize("topics") };
}

function resolve(dimension: TaxonomyDimension, id: unknown, taxonomy: Taxonomy): TaxonomyValue | undefined {
  if (!validId(id)) return undefined;
  const matches = [...taxonomy.areas, ...taxonomy.topics].filter(value => value.id === id);
  return matches.length === 1 && taxonomy[dimension].includes(matches[0]) ? matches[0] : undefined;
}
export const getAreaById = (id: unknown, taxonomy = getTaxonomy()) => resolve("areas", id, taxonomy);
export const getTopicById = (id: unknown, taxonomy = getTaxonomy()) => resolve("topics", id, taxonomy);

/** Historical reads retain inactive IDs. New-selection validation must pass includeInactive: false. */
export function validateTaxonomyIds(dimension: TaxonomyDimension, value: unknown, options: { includeInactive?: boolean } = {}, taxonomy = getTaxonomy()): { ids: string[]; issues: string[] } {
  if (value === undefined) return { ids: [], issues: [] };
  if (!Array.isArray(value)) return { ids: [], issues: [`${dimension} must be an array.`] };
  const ids: string[] = [];
  const issues: string[] = [];
  for (const id of value) {
    const item = resolve(dimension, id, taxonomy);
    if (!item) {
      const other = resolve(dimension === "areas" ? "topics" : "areas", id, taxonomy);
      issues.push(other ? `${String(id)} belongs to the other taxonomy dimension.` : `Unknown ${dimension} ID: ${String(id)}`);
    } else if (!item.active && options.includeInactive === false) issues.push(`Inactive ${dimension} ID: ${id}`);
    else if (!ids.includes(item.id)) ids.push(item.id);
    else issues.push(`Repeated ${dimension} ID: ${id}`);
  }
  return { ids, issues };
}

/** Never add absent arrays or mutate stored content. Unknown IDs remain diagnosable above. */
export function normalizeTaxonomyMetadata(value: unknown, taxonomy = getTaxonomy()): TaxonomyMetadata {
  const result: TaxonomyMetadata = {};
  for (const dimension of dimensions) {
    const items = record(value)[dimension];
    if (Array.isArray(items)) result[dimension] = validateTaxonomyIds(dimension, items, {}, taxonomy).ids;
  }
  return result;
}
