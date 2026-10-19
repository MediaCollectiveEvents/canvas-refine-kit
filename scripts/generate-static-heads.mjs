import { build } from "vite";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve, relative, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getCanonicalRoutes, ERROR_SHELL_FILE } from "../src/lib/canonicalRoutes.mjs";
import { mobileHeroPreload } from "../src/lib/mobileHero.mjs";

import { writeApacheRouting } from "./generate-apache-routing.mjs";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));

export function initialResourceHints(path) {
  return ["/", "/events", "/community", "/partners"].includes(path) ? mobileHeroPreload() : "";
}

export function injectHead(template, head) {
  if ((template.match(/<title\b/gi) || []).length !== 1 || !/<div id="root"><\/div>/.test(template)) {
    throw new Error("Expected the normal Vite shell with one title and an empty React root.");
  }
  if (/rel="canonical"|data-rh=/.test(template)) throw new Error("Build template already contains route metadata.");
  return template.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, () => head);
}

export async function generateStaticHeads(root = projectRoot) {
  const dist = resolve(root, "dist");
  const templateFile = resolve(dist, "index.html");
  const template = readFileSync(templateFile, "utf8");
  const assets = JSON.parse(readFileSync(resolve(dist, ".vite/manifest.json"), "utf8"));
  const content = JSON.parse(readFileSync(resolve(root, "src/content/events.json"), "utf8"));
  const routes = getCanonicalRoutes(content);

  // Compile only pure metadata functions, not React/the app. No SSR renderer,
  // browser, new dependencies, Vite config changes or persistent server.
  const result = await build({
    configFile: false, root, logLevel: "warn",
    resolve: { alias: { "@": resolve(root, "src") } },
    plugins: [{
      name: "static-head-client-asset-urls", enforce: "pre",
      load(id) {
        if (!/\.(?:png|jpe?g|svg|webp)$/.test(id)) return;
        const key = relative(root, id).split("\\").join("/");
        const asset = assets[key];
        if (!asset?.file) throw new Error(`Missing client asset in Vite manifest: ${key}`);
        return `export default ${JSON.stringify(`/${asset.file}`)};`;
      },
    }],
    build: {
      write: false, emptyOutDir: false, copyPublicDir: false, minify: false,
      lib: { entry: resolve(root, "src/lib/pageSeo.ts"), formats: ["es"] },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap(bundle => bundle.output);
  const entry = outputs.find(output => output.type === "chunk" && output.isEntry);
  if (!entry || outputs.some(output => output.type === "chunk" && output !== entry)) throw new Error("Expected a self-contained metadata module.");
  const { getPageSeo, errorSeo, createSeoHead, renderSeoHead } = await import(`data:text/javascript;base64,${Buffer.from(entry.code).toString("base64")}`);
  const shells = routes.map(route => {
    const props = getPageSeo(route.path);
    if (props.noindex) throw new Error(`Canonical route has no metadata: ${route.path}`);
    const heroHint = initialResourceHints(route.path);
    return { file: route.file, html: injectHead(template, renderSeoHead(createSeoHead(props, route.path)) + heroHint) };
  });
  shells.push({ file: ERROR_SHELL_FILE, html: injectHead(template, renderSeoHead(createSeoHead(errorSeo(), "/"))) });

  // Replace only the generated shells; preserve the normal client entry shell.
  rmSync(resolve(dist, "seo-pages"), { recursive: true, force: true });
  for (const shell of shells) {
    const target = resolve(dist, shell.file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, shell.html);
  }
  writeFileSync(resolve(dist, "seo-pages/manifest.json"), JSON.stringify({ routes, error: { file: ERROR_SHELL_FILE } }, null, 2) + "\n");
  if (readFileSync(templateFile, "utf8") !== template) throw new Error("Normal serving shell was modified.");
  writeApacheRouting(root, "dist/.htaccess");
  console.log(`Generated ${routes.length} route-specific heads, one error shell and inventory-based Apache routing.`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await generateStaticHeads();
}
