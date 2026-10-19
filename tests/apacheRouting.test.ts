import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { generateApacheRouting } from "../scripts/generate-apache-routing.mjs";
import { getCanonicalRoutes } from "../src/lib/canonicalRoutes.mjs";
import events from "../src/content/events.json";

test("Apache source matches the shared canonical inventory exactly", () => {
  const rules = generateApacheRouting(events);
  assert.equal(readFileSync("public/.htaccess", "utf8"), rules);
  const mappings = [...rules.matchAll(/^RewriteRule (\S+) \/(seo-pages\/\S+) \[END,NC\]$/gm)];
  assert.equal(mappings.length, 14);
  for (const route of getCanonicalRoutes(events)) {
    const matches = mappings.filter(([, pattern]) => new RegExp(pattern, "i").test(route.path.slice(1)));
    assert.equal(matches.length, 1, route.path);
    assert.equal(matches[0][2], route.file);
  }
  for (const path of ["events/999", "events/01", "events/1/extra", "unknown", "blog/a/b"]) {
    assert.ok(mappings.every(([, pattern]) => !new RegExp(pattern, "i").test(path)), path);
  }
  assert.match(rules, /ErrorDocument 404 \/seo-pages\/404.html/);
  assert.match(rules, /RewriteRule \^ - \[R=404,END\]/);
  assert.ok(rules.indexOf("RewriteRule ^$") < rules.indexOf("%{REQUEST_FILENAME}"));
});

test("Apache preserves compatibility routes, manage, files and directories", () => {
  const rules = generateApacheRouting(events);
  const pattern = rules.match(/^RewriteRule (\S+) \/index.html/gm)?.[0].split(" ")[1];
  assert.ok(pattern);
  for (const path of ["about", "events/calendar", "blog", "blog/example", "manage", "manage/"]) {
    assert.ok(new RegExp(pattern, "i").test(path), path);
  }
  assert.match(rules, /RewriteCond %{REQUEST_FILENAME} -f \[OR\]\nRewriteCond %{REQUEST_FILENAME} -d\nRewriteRule \^ - \[END\]/);
  assert.doesNotMatch(rules, /\[.*QSD|Redirect|https?:/);
});

test("Apache event rules follow inventory changes rather than a blanket event fallback", () => {
  const rules = generateApacheRouting([{ id: 42 }]);
  assert.match(rules, /\^events\/42\/\?\$/);
  assert.doesNotMatch(rules, /\^events\/1\/\?\$/);
});

test("compression keeps HTML enabled and caches only hashed assets immutably", () => {
  const rules = generateApacheRouting(events);
  assert.match(rules, /<IfModule mod_filter.c>/);
  assert.match(rules, /<IfModule mod_brotli.c>/);
  assert.match(rules, /<IfModule mod_deflate.c>/);
  for (const line of rules.split("\n").filter(line => line.includes("AddOutputFilterByType"))) {
    assert.match(line, /text\/html text\/css text\/javascript application\/javascript/);
  }
  assert.match(rules, /max-age=31536000, immutable/);
  assert.match(rules, /FilesMatch "-\[A-Za-z0-9_-\]\{8,\}/);
  assert.match(rules, /m#\^\/assets\/#/);
  assert.match(rules, /max-age=3600, must-revalidate/);
  assert.match(rules, /Header always set Cache-Control "no-cache"/);
});
