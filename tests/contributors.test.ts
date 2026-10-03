import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { getContributors, getContributorById, getArticleContributor, getArticleAttribution } from "../src/lib/contributors";
import ContributorBiography from "../src/components/shared/ContributorBiography";
import ArticleAttribution from "../src/components/shared/ArticleAttribution";
import type { Article } from "../src/lib/contentMetadata";

const contributors = getContributors({ contributors: [
  { id: "guest-writer", displayName: "Guest Writer", role: "Editor", organisation: "Example organisation", biography: "Approved biography.", image: "/uploads/writer.png" },
  { id: "name-only", displayName: "Name Only" },
  { id: "duplicate", displayName: "First" }, { id: "duplicate", displayName: "Second" },
] });
const article: Article = { title: "Example", slug: "example", date: "2025-01-01", category: "Analysis", excerpt: "Example excerpt", author: "Legacy Author", organisation: "Legacy Organisation" };

test("stable IDs resolve contributors without inferring IDs from names", () => {
  assert.equal(getContributorById("guest-writer", contributors)?.displayName, "Guest Writer");
  assert.equal(getContributorById("Guest Writer", contributors), undefined);
  for (const id of [undefined, "", "unknown", "duplicate"]) assert.equal(getContributorById(id, contributors), undefined);
});
test("malformed records and unsafe images fail safely; optional fields stay absent", () => {
  assert.deepEqual(getContributors({contributors:[null, {}, {id:"bad id",displayName:"Bad"}, {id:"blank",displayName:" "}]}), []);
  assert.deepEqual(getContributors({contributors:[{id:"valid", displayName:"Valid", image:"javascript:alert(1)"}]}), [{id:"valid",displayName:"Valid"}]);
  assert.deepEqual(getContributorById("name-only", contributors), {id:"name-only",displayName:"Name Only"});
  assert.deepEqual(getContributors(), []);
});
test("writer identity takes precedence over legacy attribution", () => {
  const authored = {...article, writerId:"guest-writer"};
  assert.equal(getArticleContributor(authored, contributors)?.role, "Editor");
  assert.deepEqual(getArticleAttribution(authored, contributors), {author:"Guest Writer",organisation:"Example organisation"});
  assert.deepEqual(getArticleAttribution({...article,writerId:"name-only"},contributors), {author:"Name Only",organisation:undefined});
});
test("missing and unresolved contributors retain exact legacy author/organisation values", () => {
  for (const writerId of [undefined,"unknown","duplicate"]) {
    assert.deepEqual(getArticleAttribution({...article,writerId},contributors), {author:"Legacy Author",organisation:"Legacy Organisation"});
  }
  assert.deepEqual(getArticleAttribution({},contributors), {author:undefined,organisation:undefined});
});
test("article with contributor shows restrained identity and biography; image stays hidden until loaded", () => {
  const markup = renderToStaticMarkup(createElement(ContributorBiography,{article:{...article,writerId:"guest-writer"},contributors}));
  for (const text of ["Guest Writer","Editor","Example organisation","Approved biography."]) assert.ok(markup.includes(text));
  assert.match(markup, /src="\/uploads\/writer.png"/);
  assert.match(markup, /class="hidden"/);
  assert.doesNotMatch(markup, /Legacy Author|Legacy Organisation/);
});
test("article without a resolved contributor omits biography and keeps legacy attribution", () => {
  assert.equal(renderToStaticMarkup(createElement(ContributorBiography,{article,contributors})), "");
  assert.equal(renderToStaticMarkup(createElement(ContributorBiography,{article:{...article,writerId:"unknown"},contributors})), "");
  const markup = renderToStaticMarkup(createElement(ArticleAttribution,{article}));
  assert.ok(markup.includes("By Legacy Author")); assert.ok(markup.includes("Legacy Organisation"));
});
test("CMS relation references file-list IDs while preserving optional single-writer metadata", () => {
  const config = readFileSync("public/admin/config.yml","utf8");
  assert.match(config, /name: writerId\s+widget: relation\s+required: false\s+collection: contributors\s+file: contributors/);
  assert.match(config, /value_field: "contributors\.\*\.id"\s+multiple: false/);
  assert.match(config, /file: "src\/content\/contributors.json"/);
});
