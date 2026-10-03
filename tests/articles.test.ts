import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { articleDate, formatArticleDate, sortArticles, getArticleBySlug, getArticleEvents, getArticlesForEvent, getArticles } from "../src/lib/articles";
import ArticleRelatedEvents from "../src/components/shared/ArticleRelatedEvents";
import type { Article } from "../src/lib/contentMetadata";
const article = (slug: string, date: string, ids?: number[]): Article => ({ slug, date, title: slug, category: "Community", excerpt: "", relatedEventIds: ids });

test("valid dates sort newest first, ties use slug, invalid dates sort last without mutating input", () => {
  const input = [article("invalid", "2025-02-30"), article("z", "2025-01-01"), article("new", "2026-01-01"), article("a", "2025-01-01")];
  assert.deepEqual(sortArticles(input).map(a => a.slug), ["new", "a", "z", "invalid"]);
  assert.equal(input[0].slug, "invalid");
});
test("date formatting is readable and independent of local timezone", () => {
  assert.equal(formatArticleDate("2025-01-01"), "1 January 2025");
  assert.equal(formatArticleDate("2026-05-06T09:30:00+01:00"), "6 May 2026");
  assert.equal(formatArticleDate("2026-01-01T00:30:00+01:00"), "31 December 2025");
  assert.equal(formatArticleDate("2024-02-29"), "29 February 2024");
});
test("invalid dates never roll over or render Invalid Date", () => {
  for (const value of ["", "unknown", "2025-02-29", "2026-04-31", "2026-13-01", "2026-01-01T25:00:00Z", "2026-01-01T24:00:00Z"]) {
    assert.equal(articleDate(value), undefined);
    assert.equal(formatArticleDate(value), "Publication date unavailable");
  }
});
test("slug lookup returns canonical article and safely handles unknown or missing slugs", () => {
  assert.equal(getArticleBySlug("authentic-relationships")?.date, "2025-01-01");
  assert.equal(getArticleBySlug("missing"), undefined);
  assert.equal(getArticleBySlug(undefined), undefined);
});
test("only existing numeric event references resolve, without duplicates", () => {
  assert.deepEqual(getArticleEvents(article("a", "2025-01-01", [1, 4, 1, 999, 0, -1, 1.5])).map(e => e.id), [1, 4]);
  assert.deepEqual(getArticleEvents({}), []);
  assert.deepEqual(getArticleEvents({ relatedEventIds: ["1"] as unknown as number[] }), []);
});
test("reverse lookup uses explicit valid relationships and publication ordering only", () => {
  const posts = [article("old", "2025-01-01", [1]), article("none", "2026-01-01"), article("new", "2026-01-01", [1, 4]), article("invalid", "2026-01-01", [999])];
  assert.deepEqual(getArticlesForEvent(1, posts).map(p => p.slug), ["new", "old"]);
  assert.deepEqual(getArticlesForEvent(4, posts).map(p => p.slug), ["new"]);
  assert.deepEqual(getArticlesForEvent(999, posts), []);
  assert.deepEqual(getArticlesForEvent(1), []);
  assert.equal(getArticles().length, 1);
});
test("article relationship UI is conditional and uses numeric detail routes", () => {
  const render = (post: Article) => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ArticleRelatedEvents, { article: post })));
  assert.equal(render(article("none", "2025-01-01", [999])), "");
  const markup = render(article("yes", "2025-01-01", [1, 4]));
  assert.match(markup, /href="\/events\/1"/);
  assert.match(markup, /href="\/events\/4"/);
  assert.doesNotMatch(markup, /calendar|Register/);
});
