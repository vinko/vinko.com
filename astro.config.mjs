import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

// Preview on GitHub Pages (project site). Not www.vinko.com / ICDSoft.
const site = "https://vinko.github.io";
const base = "/vinko.com/";

function normalizeBase(value) {
  if (!value || value === "/") return "/";
  return value.endsWith("/") ? value : `${value}/`;
}

function prefixRootAbsolute(url, prefix) {
  if (typeof url !== "string") return url;
  if (!url.startsWith("/") || url.startsWith("//")) return url;
  if (prefix === "/" || url.startsWith(prefix)) return url;
  return `${prefix}${url.slice(1)}`;
}

function rehypePrefixBase() {
  return (tree) => {
    const prefix = normalizeBase(base);
    const visit = (node) => {
      if (node?.type === "element" && node.properties) {
        for (const key of ["href", "src"]) {
          node.properties[key] = prefixRootAbsolute(node.properties[key], prefix);
        }
      }
      for (const child of node.children ?? []) visit(child);
    };
    visit(tree);
  };
}

function prefixBuiltHtml(prefix) {
  const attr = /\b(href|src)=("|')(\/[^"']*)\2/g;
  return {
    name: "prefix-root-absolute-urls",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const normalized = normalizeBase(prefix);
        if (normalized === "/") return;
        const root = fileURLToPath(dir);
        const files = [];
        async function walk(current) {
          for (const entry of await readdir(current, { withFileTypes: true })) {
            const next = join(current, entry.name);
            if (entry.isDirectory()) await walk(next);
            else if (entry.name.endsWith(".html")) files.push(next);
          }
        }
        await walk(root);
        await Promise.all(
          files.map(async (file) => {
            const html = await readFile(file, "utf8");
            const next = html.replace(attr, (full, name, quote, url) => {
              const prefixed = prefixRootAbsolute(url, normalized);
              return prefixed === url ? full : `${name}=${quote}${prefixed}${quote}`;
            });
            if (next !== html) await writeFile(file, next);
          }),
        );
      },
    },
  };
}

export default defineConfig({
  site,
  base,
  output: "static",
  trailingSlash: "always",
  markdown: {
    rehypePlugins: [rehypePrefixBase],
  },
  integrations: [prefixBuiltHtml(base)],
});
