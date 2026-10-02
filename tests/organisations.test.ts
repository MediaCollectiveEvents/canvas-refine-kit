import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ArticleContent from "../src/components/shared/ArticleContent";
import test from "node:test";
import assert from "node:assert/strict";
import { getOrganisations, getOrganisationById, getOrganisationIssues, getRelatedArticles, getRelatedOrganisations } from "../src/lib/organisations";
import { articleParagraphs, type Article } from "../src/lib/contentMetadata";
const organisations = getOrganisations({logos:[{src:"logo.png"},{id:"company-one",src:"one.png",name:"One"},{id:"duplicate",src:"two.png"},{id:"duplicate",src:"three.png"},{id:"bad id",src:"bad.png",website:"javascript:alert(1)"}]});
const article: Article = {title:"Test",slug:"test",date:"2026-10-02",category:"Analysis",excerpt:"Example",relatedPartnerIds:["company-one","missing","duplicate","company-one"]};
test("legacy records remain valid and unsafe metadata remains unlinked",()=>{
 assert.deepEqual(organisations[0],{src:"logo.png"}); assert.equal(organisations[4].id,undefined);assert.equal(organisations[4].website,undefined);
 assert.equal(getOrganisations().length,14);
});
test("only unique stable IDs resolve; duplicate IDs produce diagnostics",()=>{
 assert.equal(getOrganisationById("company-one",organisations)?.name,"One");
 assert.equal(getOrganisationById("duplicate",organisations),undefined);assert.equal(getOrganisationById("One",organisations),undefined);
 assert.deepEqual(getOrganisationIssues(organisations),["Duplicate organisation ID: duplicate"]);
});
test("article references resolve explicitly, deduplicate and ignore unknown/ambiguous IDs",()=>{
 assert.deepEqual(getRelatedOrganisations(article,organisations).map(row=>row.id),["company-one"]);
 assert.deepEqual(getRelatedArticles("company-one",[article],organisations),[article]);
 assert.deepEqual(getRelatedArticles("duplicate",[article],organisations),[]);
 assert.deepEqual(getRelatedOrganisations({...article,relatedPartnerIds:undefined},organisations),[]);
});
test("plain text paragraphs support LF/CRLF breaks without interpreting HTML",()=>{
 assert.deepEqual(articleParagraphs("First\r\n\r\nSecond\n\n\nThird"),["First","Second","Third"]);
 assert.deepEqual(articleParagraphs("<script>example</script>\nOne line"),["<script>example</script>\nOne line"]);
 assert.deepEqual(articleParagraphs(),[]);
});

test("production/preview article component emits paragraphs and escapes HTML", () => {
 const markup = renderToStaticMarkup(createElement(ArticleContent, {body:"First\n\n<script>Second</script>"}));
 assert.equal((markup.match(/<p /g) ?? []).length,2);
 assert.ok(markup.includes("&lt;script&gt;Second&lt;/script&gt;"));
 assert.ok(!markup.includes("<script>"));
});
