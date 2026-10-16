import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { generateApacheRouting } from "./generate-apache-routing.mjs";

const stagingHeader = '# Staging only: requires Apache mod_headers; fail rather than silently omit noindex.\nHeader always set X-Robots-Tag "noindex, nofollow"\n\n';

export function deployTarget(value = process.env.DEPLOY_TARGET ?? "production") {
  if (value !== "production" && value !== "staging") throw new Error(`Unsupported deployment target: ${value}`);
  return value;
}

export function routingForTarget(base, target = deployTarget()) {
  deployTarget(target);
  if (/^\s*Header\b[^\n]*X-Robots-Tag/im.test(base)) throw new Error("Base Apache routing must not contain a target-specific robots header.");
  return target === "staging" ? stagingHeader + base : base;
}

// Operate on the built artifact only. Production routing/content stay unchanged.
export function prepareStagingPayload(root = process.cwd(), payload = "dist", target = deployTarget()) {
  if (deployTarget(target) !== "staging") throw new Error("Staging payload preparation requires DEPLOY_TARGET=staging.");
  const content = JSON.parse(readFileSync(resolve(root, "src/content/events.json"), "utf8"));
  const base = generateApacheRouting(content);
  const expected = routingForTarget(base, target);
  const file = resolve(root, payload, ".htaccess");
  const current = readFileSync(file, "utf8");
  if (current !== base && current !== expected) throw new Error("Unexpected Apache routing; refusing staging preparation.");
  writeFileSync(file, expected);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  prepareStagingPayload();
}
