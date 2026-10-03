import events from "@/content/events.json";
import organisations from "@/content/sponsors.json";
import { getAllEvents } from "./events";

export type ReferenceKind = "event" | "organisation";
export const isStableEditorialId = (value: unknown): value is string => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
export function directoryRows(source: unknown, key: string): Record<string, unknown>[] {
 const rows = record(source)[key];
 return Array.isArray(rows) ? rows.map(record) : [];
}

export function getStableDirectoryIssues(source: unknown, key: string, allowMissing: boolean): string[] {
 const issues: string[] = [];
 const counts = new Map<string, number>();
 directoryRows(source,key).forEach((row,index) => {
  if (row.id === undefined && allowMissing) return;
  if (!isStableEditorialId(row.id)) issues.push(`${key}[${index}] needs a valid stable ID.`);
  else counts.set(row.id,(counts.get(row.id) ?? 0)+1);
 });
 counts.forEach((count,id)=>{if(count>1)issues.push(`Duplicate ${key === "logos" ? "organisation" : "contributor"} ID: ${id}`);});
 return issues;
}

export function eligibleReferenceRows(kind: ReferenceKind, source: unknown = kind === "event" ? events : organisations): Record<string, unknown>[] {
 if(kind === "event") return getAllEvents(source).map(event=>({...event}));
 const rows=directoryRows(source,"logos");
 return rows.filter(row=>isStableEditorialId(row.id) && rows.filter(other=>other.id===row.id).length===1 && typeof row.src === "string" && !!row.src && typeof row.name === "string" && !!row.name.trim());
}

export function validateEditorialReferences(kind: ReferenceKind, value: unknown, source: unknown = kind === "event" ? events : organisations): string[] {
 if(value === undefined) return [];
 if(!Array.isArray(value))return [`${kind} references must be an array.`];
 const eligible=eligibleReferenceRows(kind,source);
 const issues: string[]=[];
 const seen=new Set<unknown>();
 value.forEach(id=>{
  if(seen.has(id))issues.push(`Duplicate ${kind} reference: ${String(id)}`);
  seen.add(id);
  const valid=kind === "event" ? typeof id === "number" && Number.isSafeInteger(id) && id>0 : isStableEditorialId(id);
  if(!valid || !eligible.some(row=>row.id===id))issues.push(`Unresolved ${kind} reference: ${String(id)}`);
 });
 return issues;
}

/** Invalid/repeated historical values require explicit correction; a picker must not erase them. */
export function preserveHistoricalReferences(kind: ReferenceKind, previous: unknown[], next: unknown[], source: unknown): unknown[] {
 const protectedValues=previous.filter(id=>previous.filter(other=>other===id).length>1 || validateEditorialReferences(kind,[id],source).length>0);
 return [...next.filter(id=>!protectedValues.includes(id)),...protectedValues];
}
