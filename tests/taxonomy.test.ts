import test from "node:test";
import assert from "node:assert/strict";
import { getTaxonomy, getTaxonomyIssues, getAreaById, getTopicById, validateTaxonomyIds, normalizeTaxonomyMetadata } from "../src/lib/taxonomy";
import { normalizeArticles, getArticleBySlug } from "../src/lib/articles";
import { normalizeEvents, filterEventsByExperience, getAllEvents } from "../src/lib/events";
import { getContributors } from "../src/lib/contributors";
import type { Article } from "../src/lib/contentMetadata";

const value = (id: string, active = true) => ({id, label:id, description:`Definition of ${id}`, active});
const retired = getTaxonomy({areas:[value("production"),value("retired-area",false)],topics:[value("security"),value("retired-topic",false)]});
const article: Article = {title:"Example",slug:"example",date:"2025-01-01",category:"Community",excerpt:"Example"};

test("canonical taxonomy contains approved labels and complete unique definitions", () => {
 const taxonomy=getTaxonomy(); assert.equal(taxonomy.areas.length,7); assert.equal(taxonomy.topics.length,13);
 assert.deepEqual(getTaxonomyIssues(),[]);
 assert.equal(getAreaById("operations")?.label,"Media operations");
 assert.equal(getTopicById("industry-strategy")?.label,"Industry strategy");
 assert.ok([...taxonomy.areas,...taxonomy.topics].every(v=>v.active&&v.description));
});
test("duplicate IDs within and across dimensions are reported and never ambiguously resolved", () => {
 const input={areas:[value("duplicate"),value("duplicate"),value("cross")],topics:[value("cross")]};
 assert.deepEqual(getTaxonomyIssues(input),["Duplicate taxonomy ID: duplicate","Duplicate taxonomy ID: cross"]);
 assert.deepEqual(getTaxonomy(input),{areas:[],topics:[]});
 assert.equal(getAreaById("cross",getTaxonomy(input)),undefined);
});
test("invalid taxonomy records are reported and excluded without failing reads", () => {
 const input={areas:[{id:"bad id",label:"",active:"yes"}],topics:[]};
 assert.equal(getTaxonomyIssues(input).length,2); assert.deepEqual(getTaxonomy(input),{areas:[],topics:[]});
 assert.equal(getTaxonomyIssues({}).length,2);
});
test("unknown, wrong-dimension and repeated IDs are safely excluded and diagnosed", () => {
 const result=validateTaxonomyIds("areas",["production","security","missing","production",2]);
 assert.deepEqual(result.ids,["production"]); assert.equal(result.issues.length,4);
 assert.ok(result.issues.some(issue=>issue.includes("other taxonomy dimension")));
 assert.equal(getAreaById("security"),undefined); assert.equal(getTopicById("production"),undefined);
 assert.equal(getTopicById("missing"),undefined);
 assert.deepEqual(validateTaxonomyIds("topics","security").ids,[]);
});
test("historical inactive values resolve and survive reads, but cannot pass new-selection validation", () => {
 assert.equal(getAreaById("retired-area",retired)?.active,false);
 assert.deepEqual(validateTaxonomyIds("areas",["retired-area"],{},retired).ids,["retired-area"]);
 assert.deepEqual(validateTaxonomyIds("topics",["retired-topic"],{includeInactive:false},retired),{ids:[],issues:["Inactive topics ID: retired-topic"]});
 assert.deepEqual(normalizeTaxonomyMetadata({areas:["retired-area"],topics:["retired-topic"]},retired),{areas:["retired-area"],topics:["retired-topic"]});
});
test("absent metadata stays absent and explicit empty arrays remain empty", () => {
 assert.deepEqual(normalizeTaxonomyMetadata({}),{});
 assert.deepEqual(normalizeTaxonomyMetadata({areas:[],topics:[]}),{areas:[],topics:[]});
 assert.deepEqual(normalizeTaxonomyMetadata({areas:"production",topics:null}),{});
 for(const row of [...normalizeArticles([article]),...getContributors({contributors:[{id:"writer",displayName:"Writer"}]})]) {
  assert.equal(Object.hasOwn(row,"areas"),false); assert.equal(Object.hasOwn(row,"topics"),false);
 }
 const events=getAllEvents();
 const nab=events.find(event=>event.id===1);
 const offAir=events.find(event=>event.id===4);
 assert.ok(nab); assert.ok(offAir);
 assert.deepEqual(nab.areas,["strategy-leadership"]);
 assert.deepEqual(nab.topics,["security","organisational-change","industry-strategy"]);
 assert.deepEqual(offAir.areas,["strategy-leadership"]);
 assert.deepEqual(offAir.topics,["industry-strategy"]);
 for(const id of [2,3]) {
  const event=events.find(row=>row.id===id);
  assert.ok(event);
  assert.equal(Object.hasOwn(event,"areas"),false); assert.equal(Object.hasOwn(event,"topics"),false);
 }
});
test("article metadata survives canonical helper normalization without changing existing identity", () => {
 const input={...article,areas:["production","security"],topics:["security","production","security"],writerId:"writer"};
 const result=normalizeArticles([input])[0];
 assert.deepEqual(result.areas,["production"]);assert.deepEqual(result.topics,["security"]);
 assert.equal(result.writerId,"writer");assert.equal(result.date,article.date);
 assert.deepEqual(getArticleBySlug("example",[input]),result);
 assert.deepEqual(input.areas,["production","security"]);
});
test("event metadata survives explicit normalization independently of experience filtering", () => {
 const input={...getAllEvents()[0],areas:["production"],topics:["security","missing"]};
 const events=normalizeEvents({events:[input]});
 assert.deepEqual(events[0].areas,["production"]);assert.deepEqual(events[0].topics,["security"]);
 assert.deepEqual(events[0].experienceCategories,input.experienceCategories);
 assert.equal(filterEventsByExperience(events,"networking-social").length,1);
 assert.equal(filterEventsByExperience(getAllEvents(),"conference-aligned").length,3);
 assert.equal(filterEventsByExperience(getAllEvents(),"knowledge-discussion").length,2);
});
test("contributor metadata is preserved as expertise without inheriting article tags", () => {
 const rows=getContributors({contributors:[{id:"writer",displayName:"Writer",areas:["technology","missing"],topics:["security","technology"]}]});
 assert.deepEqual(rows[0].areas,["technology"]);assert.deepEqual(rows[0].topics,["security"]);
});
