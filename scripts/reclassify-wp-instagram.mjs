#!/usr/bin/env node
/**
 * Reclassify WordPress-migrated Instagram shares into Social Network.
 *
 * Adds `source: instagram`, caption hashtags → tags, and resolved permalinks.
 * Never sets draft: false. Does not deploy.
 */

import { readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  extractBitlyUrl,
  insertFrontmatterTags,
  instagramShortcodeFromUrl,
  isWpInstagramShare,
  parseHashtags,
  parseInstagramIdFromFrontmatter,
  splitMarkdown,
  yamlScalar,
} from "./instagram-sync.mjs";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const POSTS_DIR = join(ROOT, "src/content/posts");
const REDIRECTS_PATH = join(ROOT, "src/data/instagram-duplicate-redirects.json");

export function normalizeCaption(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/from instagram:.*$/gim, " ")
    .replace(/originally posted on \[instagram\].*$/gim, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/#([\p{L}\p{N}_]+)/gu, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function captionsNearlyMatch(a, b) {
  const left = normalizeCaption(a);
  const right = normalizeCaption(b);
  if (!left || !right) return false;
  if (left === right) return true;
  if (left.length < 16 || right.length < 16) return false;
  return left.includes(right) || right.includes(left);
}

export function pubDateFromFrontmatter(markdown) {
  return markdown.match(/^pubDate:\s*(\d{4}-\d{2}-\d{2})/m)?.[1] || "";
}

export function duplicateReason(wpText, importItem, permalink) {
  const importLink = importItem.text.match(/instagramPermalink:\s*"([^"]+)"/)?.[1] || "";
  const wpCode = instagramShortcodeFromUrl(permalink);
  const importCode = instagramShortcodeFromUrl(importLink);
  if (wpCode && importCode && wpCode === importCode) return "permalink";
  const sameDay =
    Boolean(pubDateFromFrontmatter(wpText)) &&
    pubDateFromFrontmatter(wpText) === pubDateFromFrontmatter(importItem.text);
  if (sameDay && captionsNearlyMatch(wpText, importItem.text)) return "caption";
  return null;
}

export function permalinkFromResolved(url) {
  const shortcode = instagramShortcodeFromUrl(url);
  if (!shortcode) return null;
  const kind = /instagram\.com\/reel\//i.test(url) ? "reel" : "p";
  return `https://www.instagram.com/${kind}/${shortcode}/`;
}

export function upsertWpInstagramFrontmatter(markdown, { tags, permalink }) {
  const { fm, body, hasFrontmatter } = splitMarkdown(markdown);
  if (!hasFrontmatter) return { markdown, changed: false };

  let nextFm = fm;
  let changed = false;

  if (!/^source: instagram$/m.test(nextFm)) {
    nextFm = `${nextFm}\nsource: instagram`;
    changed = true;
  }

  if (permalink && !/^instagramPermalink:/m.test(nextFm)) {
    nextFm = `${nextFm}\ninstagramPermalink: ${yamlScalar(permalink)}`;
    changed = true;
  }

  const withSource = `---\n${nextFm}\n---\n${body.startsWith("\n") ? body : `\n${body}`}`;
  const tagged = tags?.length ? insertFrontmatterTags(withSource, tags) : { markdown: withSource, changed: false };
  return { markdown: tagged.markdown, changed: changed || tagged.changed };
}

export function rewriteFromInstagramLine(markdown, permalink) {
  if (!permalink) return markdown;
  return markdown.replace(
    /from Instagram:\s*https?:\/\/bit\.ly\/[A-Za-z0-9]+/gi,
    `from Instagram: ${permalink}`,
  );
}

async function listPostFiles(dir) {
  const names = await readdir(dir);
  return names.filter((name) => name.endsWith(".md")).map((name) => join(dir, name));
}

export async function resolveBitly(url, fetchImpl = fetch) {
  let current = url;
  for (let hop = 0; hop < 8; hop++) {
    const permalink = permalinkFromResolved(current);
    if (permalink) return permalink;
    const response = await fetchImpl(current, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        Accept: "*/*",
      },
      signal: AbortSignal.timeout(15_000),
    });
    const location = response.headers?.get?.("location") || response.headers?.get?.("Location");
    let nextUrl = location || response.url;
    if (nextUrl && !/^https?:/i.test(nextUrl) && current) {
      try {
        nextUrl = new URL(nextUrl, current).toString();
      } catch {
        break;
      }
    }
    if (!nextUrl || nextUrl === current) break;
    current = nextUrl;
    if (permalinkFromResolved(current)) return permalinkFromResolved(current);
  }
  return permalinkFromResolved(current);
}

async function mapPool(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return results;
}

export async function reclassifyWpInstagramPosts({
  postsDir = POSTS_DIR,
  redirectsPath = REDIRECTS_PATH,
  dryRun = false,
  fetchImpl = fetch,
  resolveLinks = true,
} = {}) {
  const files = await listPostFiles(postsDir);
  const loaded = [];
  for (const file of files) {
    const text = await readFile(file, "utf8");
    loaded.push({ file, name: file.split(/[/\\]/).pop(), text });
  }

  const syncImports = loaded.filter(
    (item) =>
      item.name.startsWith("instagram-") ||
      Boolean(parseInstagramIdFromFrontmatter(item.text)),
  );
  const wpShares = loaded.filter(
    (item) =>
      !item.name.startsWith("instagram-") &&
      !parseInstagramIdFromFrontmatter(item.text) &&
      isWpInstagramShare(item.text),
  );

  const importPermalinks = new Map();
  const importCaptions = [];
  for (const item of syncImports) {
    const permalink = item.text.match(/instagramPermalink:\s*"([^"]+)"/)?.[1] || "";
    const shortcode = instagramShortcodeFromUrl(permalink);
    if (shortcode) importPermalinks.set(shortcode, item);
    importCaptions.push({ item, caption: normalizeCaption(item.text) });
  }

  const resolved = resolveLinks
    ? await mapPool(wpShares, 12, async (item) => {
        const bitly = extractBitlyUrl(item.text);
        if (!bitly) return { item, permalink: null, error: null };
        try {
          return { item, permalink: await resolveBitly(bitly, fetchImpl), error: null };
        } catch (error) {
          return { item, permalink: null, error: error.message };
        }
      })
    : wpShares.map((item) => ({ item, permalink: null, error: null }));

  const reclassified = [];
  const duplicates = [];
  const errors = [];

  for (const row of resolved) {
    const { item, permalink, error } = row;
    if (error) errors.push(`${item.name}: ${error}`);
    const tags = parseHashtags(item.text);
    let importHit = null;
    let reason = null;
    const shortcode = instagramShortcodeFromUrl(permalink);
    if (shortcode && importPermalinks.get(shortcode)) {
      importHit = importPermalinks.get(shortcode);
      reason = "permalink";
    } else {
      for (const entry of importCaptions) {
        const match = duplicateReason(item.text, entry.item, permalink);
        if (match) {
          importHit = entry.item;
          reason = match;
          break;
        }
      }
    }

    if (importHit) {
      duplicates.push({
        wp: item.name,
        keep: importHit.name,
        reason,
      });
      if (!dryRun) await unlink(item.file);
      continue;
    }

    const { markdown, changed } = upsertWpInstagramFrontmatter(item.text, { tags, permalink });
    const rewritten = rewriteFromInstagramLine(markdown, permalink);
    const next = rewritten;
    const fileChanged = next !== item.text;
    if (fileChanged && !dryRun) await writeFile(item.file, next, "utf8");
    reclassified.push({
      name: item.name,
      tags,
      permalink,
      changed: fileChanged || changed,
    });
  }

  const redirects = {};
  for (const pair of duplicates) {
    redirects[pair.wp.replace(/\.md$/, "")] = pair.keep.replace(/\.md$/, "");
  }
  if (!dryRun && redirectsPath) {
    await writeFile(redirectsPath, `${JSON.stringify(redirects, null, 2)}\n`, "utf8");
  }

  return {
    scanned: loaded.length,
    wpShares: wpShares.length,
    reclassified: reclassified.length,
    duplicates: duplicates.length,
    duplicatePairs: duplicates,
    errors,
    dryRun,
  };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const result = await reclassifyWpInstagramPosts({ dryRun });
  console.log(
    JSON.stringify(
      {
        wpShares: result.wpShares,
        reclassified: result.reclassified,
        duplicates: result.duplicates,
        duplicatePairs: result.duplicatePairs,
        errors: result.errors,
        dryRun: result.dryRun,
      },
      null,
      2,
    ),
  );
  if (result.errors.length) process.exitCode = 1;
}

const isMain =
  process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main();
}
