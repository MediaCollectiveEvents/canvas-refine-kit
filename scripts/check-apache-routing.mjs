// Run against a local Apache DocumentRoot pointing at this workspace's dist.
// No enquiries, credentials, deployment or production requests are involved.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { getCanonicalRoutes, ERROR_SHELL_FILE } from "../src/lib/canonicalRoutes.mjs";
const origin = process.argv[2];
if (!origin || !/^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/.test(origin)) {
  throw new Error("Pass a local Apache origin, e.g. http://127.0.0.1:4175");
}
const events = JSON.parse(readFileSync("src/content/events.json", "utf8"));
let checks = 0;
async function check(path, status, file) {
  const response = await fetch(`${origin}${path}`, { redirect: "manual" });
  assert.equal(response.status, status, path);
  assert.equal(response.headers.get("location"), null, path);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), readFileSync(`dist/${file}`), path);
  console.log(`${status} ${path} → ${file}`);
  checks++;
}
for (const route of getCanonicalRoutes(events)) {
  await check(route.path, 200, route.file);
  await check(`${route.path}?utm_source=apache-test&context=retained`, 200, route.file);
  if (route.path !== "/") await check(`${route.path}/`, 200, route.file);
}
for (const path of ["/events/999", "/unknown-route", "/events/01", "/events/1/extra", "/blog/a/b", "/assets/missing.js"]) {
  await check(path, 404, ERROR_SHELL_FILE);
}
for (const path of ["/about", "/events/calendar", "/blog", "/blog/example", "/manage", "/manage/?context=retained"]) {
  await check(path, 200, "index.html");
}
await check("/admin/", 200, "admin/index.html");
await check("/admin/config.yml", 200, "admin/config.yml");
for (const path of ["robots.txt", "sitemap.xml", "uploads/off-air.png", ...readdirSync("dist/assets").filter(file => /\.(js|css)$/.test(file)).slice(0, 2).map(file => `assets/${file}`)]) {
  await check(`/${path}`, 200, path);
}
assert.equal(readFileSync("dist/.htaccess", "utf8"), readFileSync("public/.htaccess", "utf8"));
console.log(`Passed ${checks} actual Apache HTTP status/body checks.`);
