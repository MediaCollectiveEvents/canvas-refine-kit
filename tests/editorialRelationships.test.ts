import test from "node:test";
import assert from "node:assert/strict";
import { eligibleReferenceRows, validateEditorialReferences, getStableDirectoryIssues, preserveHistoricalReferences } from "../src/lib/editorialRelationships";
import { getOrganisations, getOrganisationIssues } from "../src/lib/organisations";
import { getContributorIssues } from "../src/lib/contributors";
import { registerReferenceWidgets, type ReferenceControlProps } from "../src/cms/controls/ReferenceRelationControl";
import React from "react";

const source={logos:[{id:"valid",name:"Valid organisation",src:"/uploads/valid.png"},{name:"Legacy",src:"/uploads/legacy.png"},{id:"duplicate",name:"First",src:"a.png"},{id:"duplicate",name:"Second",src:"b.png"},{id:"bad id",name:"Bad",src:"c.png"}]};
test("valid canonical numeric event references resolve; unknown, missing and string IDs do not",()=>{
 assert.deepEqual(validateEditorialReferences("event",[1,2,3,4]),[]);
 assert.deepEqual(validateEditorialReferences("event",undefined),[]);
 for(const value of [0,999,undefined,"1",null,1.5]) assert.equal(validateEditorialReferences("event",[value]).length,1);
 assert.equal(validateEditorialReferences("event","1").length,1);
});
test("repeated event references are reported rather than silently removed",()=>{
 assert.deepEqual(validateEditorialReferences("event",[1,1]),["Duplicate event reference: 1"]);
});
test("only uniquely identified named organisations are eligible and stable IDs are never inferred",()=>{
 assert.deepEqual(eligibleReferenceRows("organisation",source).map(row=>row.id),["valid"]);
 assert.deepEqual(validateEditorialReferences("organisation",["valid"],source),[]);
 for(const id of ["Legacy","missing","duplicate","bad id",undefined]) assert.equal(validateEditorialReferences("organisation",[id],source).length,1);
 assert.deepEqual(eligibleReferenceRows("organisation"),[]);
});
test("duplicate organisation references and duplicate stable directory IDs have clear diagnostics",()=>{
 assert.deepEqual(validateEditorialReferences("organisation",["valid","valid"],source),["Duplicate organisation reference: valid"]);
 assert.ok(getStableDirectoryIssues(source,"logos",true).includes("Duplicate organisation ID: duplicate"));
 assert.deepEqual(getContributorIssues({contributors:[{id:"person"},{id:"person"}]}),["Duplicate contributor ID: person"]);
 assert.deepEqual(getContributorIssues({contributors:[{}]}),["contributors[0] needs a valid stable ID."]);
});
test("organisation event relationships are checked against canonical IDs",()=>{
 const rows=getOrganisations({logos:[{id:"valid",name:"Valid",src:"a.png",relatedEventIds:[1,999,1]}]});
 assert.deepEqual(getOrganisationIssues(rows),["logos[0]: Unresolved event reference: 999","logos[0]: Duplicate event reference: 1"]);
});
test("legacy logo-only records remain unchanged and do not acquire IDs or roles",()=>{
 const rows=getOrganisations();assert.equal(rows.length,14);
 assert.ok(rows.every(row=>row.id===undefined&&row.partnershipTypes===undefined));
 assert.deepEqual(getOrganisationIssues(),[]);
});
test("changing picker choices preserves invalid and repeated historical references",()=>{
 assert.deepEqual(preserveHistoricalReferences("event",[1,999,"2"],[4],{}),[4,1,999,"2"]);
 assert.deepEqual(preserveHistoricalReferences("organisation",["valid","missing","valid"],["valid"],source),["valid","missing","valid"]);
 assert.deepEqual(preserveHistoricalReferences("event",[1,2],[4],{events:[{id:1},{id:2},{id:4}]}),[4]);
});
test("shared picker forwards numeric arrays and metadata, reports invalid history and filters organisations",()=>{
 const widgets:Record<string,React.ComponentType<ReferenceControlProps>>={};
 const Native=()=>null;
 registerReferenceWidgets({getWidget:()=>({control:Native}),registerWidget:(name,control)=>{widgets[name]=control;}});
 let output:unknown;let metadata:unknown;
 const props:ReferenceControlProps={field:{get:()=>undefined},value:[999],queryHits:[{data:{events:[{id:1,title:"NAB",date:"2026-05-06"},{id:4,title:"OFF AIR",date:"2026-11-24"}]}}],query:async()=>({payload:{hits:[]}}),onChange:(value,meta)=>{output=value;metadata=meta;}};
 const Event=widgets["event-relation"] as React.ComponentClass<ReferenceControlProps>;
 const eventControl=new Event(props);
 const element=eventControl.render() as React.ReactElement<{children:React.ReactElement[]}>;
 const picker=element.props.children[0] as React.ReactElement<ReferenceControlProps>;
 picker.props.onChange([1,4],{test:true});assert.deepEqual(output,[1,4,999]);assert.deepEqual(metadata,{test:true});
 const Organisation=widgets["organisation-relation"] as React.ComponentClass<ReferenceControlProps>;
 const orgControl=new Organisation({...props,value:[],queryHits:[{data:source}]});
 const orgElement=orgControl.render() as React.ReactElement<{children:React.ReactElement[]}>;
 const orgPicker=orgElement.props.children[0] as React.ReactElement<ReferenceControlProps>;
 assert.deepEqual((orgPicker.props.queryHits[0].data as typeof source).logos.map(row=>row.id),["valid"]);
});
