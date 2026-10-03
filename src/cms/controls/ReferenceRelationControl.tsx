import React from "react";
import eventSource from "@/content/events.json";
import organisationSource from "@/content/sponsors.json";
import { directoryRows, eligibleReferenceRows, getStableDirectoryIssues, preserveHistoricalReferences, validateEditorialReferences, type ReferenceKind } from "@/lib/editorialRelationships";
import { getEventIssues } from "@/lib/events";

type Hit = { data?: unknown; [key: string]: unknown };
type QueryResult = { payload: { hits?: Hit[]; [key: string]: unknown }; [key: string]: unknown };
type ListValue = { toJS(): unknown; clear(): { concat(values: unknown[]): unknown } };
export interface ReferenceControlProps {
 field: { get(key: string, fallback?: unknown): unknown };
 value?: unknown;
 queryHits: Hit[];
 query: (...args: unknown[]) => Promise<QueryResult>;
 onChange: (value: unknown, metadata?: unknown) => void;
 [key: string]: unknown;
}
export interface ReferenceWidgetCMS {
 getWidget(name: string): { control: React.ComponentType<ReferenceControlProps> };
 registerWidget(name: string, control: React.ComponentType<ReferenceControlProps>): void;
}
const values = (value: unknown): unknown[] => {
 const raw=value && typeof value === "object" && "toJS" in value && typeof value.toJS === "function" ? value.toJS() : value;
 return Array.isArray(raw) ? raw : [];
};

function createControl(kind: ReferenceKind, Relation: React.ComponentType<ReferenceControlProps>) {
 return class ReferenceRelationControl extends React.Component<ReferenceControlProps> {
  source: unknown = kind === "event" ? eventSource : organisationSource;
  filterHits = (hits: Hit[]) => hits.map(hit => {
   const key = kind === "event" ? "events" : "logos";
   if(hit.data && typeof hit.data === "object" && key in hit.data) this.source=hit.data;
   return {...hit,data:hit.data && typeof hit.data === "object" ? {...hit.data,[key]:eligibleReferenceRows(kind,hit.data)} : hit.data};
  });
  render() {
   const props=this.props;
   const queryHits=this.filterHits(props.queryHits ?? []);
   const previous=values(props.value);
   const issues=[...validateEditorialReferences(kind,previous,this.source),...(kind === "event" ? getEventIssues(this.source) : getStableDirectoryIssues(this.source,"logos",true))];
   const eligible=eligibleReferenceRows(kind,this.source);
   const emptyLegacy=kind === "organisation" && !eligible.length && directoryRows(this.source,"logos").length>0;
   return <div>
    <Relation {...props} queryHits={queryHits}
     query={async(...args)=>{const result=await props.query(...args);return {...result,payload:{...result.payload,hits:this.filterHits(result.payload.hits ?? [])}};}}
     onChange={(value,metadata)=>{
      const merged=preserveHistoricalReferences(kind,values(this.props.value),values(value),this.source);
      const output=value && typeof value === "object" && "clear" in value && typeof value.clear === "function" ? (value as ListValue).clear().concat(merged) : merged;
      this.props.onChange(output,metadata);
     }} />
    {emptyLegacy && <p>No organisations with a unique stable ID and name are available. Complete an organisation’s identity before linking it.</p>}
    {issues.length>0 && <div role="status" aria-live="polite"><p>Saved references need review. Invalid or repeated values are retained until explicitly corrected.</p><ul>{issues.map((issue,index)=><li key={`${issue}-${index}`}>{issue}</li>)}</ul></div>}
   </div>;
  }
 };
}

export function registerReferenceWidgets(cms: ReferenceWidgetCMS) {
 const Relation=cms.getWidget("relation").control;
 cms.registerWidget("event-relation",createControl("event",Relation));
 cms.registerWidget("organisation-relation",createControl("organisation",Relation));
}
