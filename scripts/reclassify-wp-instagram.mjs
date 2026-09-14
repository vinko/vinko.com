#!/usr/bin/env node
/**
 * Reclassify WordPress-migrated Instagram shares into Social Network.
 *
 * Adds `source: instagram`, caption hashtags → tags, and resolved permalinks.
 * `--polish` / `--dedupe` removes long-slug permalink duplicates and rewrites
 * `from Instagram:` lines to `Originally posted on [Instagram](url).`
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

export function instagramAttributionMarkdown(permalink) {
  return `Originally posted on [Instagram](${permalink}).`;
}

export function titleFromFrontmatter(markdown) {
  const quoted = markdown.match(/^title:\s*"([^"]*)"/m)?.[1];
  if (quoted != null) return quoted;
  return markdown.match(/^title:\s*(.+)$/m)?.[1]?.trim() || "";
}

export function permalinkFromPost(markdown) {
  const fromFm = markdown.match(/instagramPermalink:\s*"([^"]+)"/)?.[1] || "";
  return permalinkFromResolved(fromFm) || permalinkFromResolved(markdown);
}

export function isCaptionAsSlug(slug, title) {
  const s = String(slug || "");
  if (s.length < 48) return false;
  const t = String(title || "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!t) return false;
  return t.startsWith(s.slice(0, 32)) || s.startsWith(t.slice(0, 32));
}

export function chooseDuplicateKeeper(items) {
  return [...items].sort((a, b) => {
    const graphA = a.name.startsWith("instagram-") ? 0 : 1;
    const graphB = b.name.startsWith("instagram-") ? 0 : 1;
    if (graphA !== graphB) return graphA - graphB;
    const captionA = isCaptionAsSlug(a.slug, a.title) ? 1 : 0;
    const captionB = isCaptionAsSlug(b.slug, b.title) ? 1 : 0;
    if (captionA !== captionB) return captionA - captionB;
    if (a.slug.length !== b.slug.length) return a.slug.length - b.slug.length;
    const descA = /^description:/m.test(a.text) ? 0 : 1;
    const descB = /^description:/m.test(b.text) ? 0 : 1;
    if (descA !== descB) return descA - descB;
    return a.slug.localeCompare(b.slug);
  })[0];
}

export function mergeDuplicateKeeper(keeperText, dropText) {
  const { fm, body, hasFrontmatter } = splitMarkdown(keeperText);
  if (!hasFrontmatter) return keeperText;
  let nextFm = fm;
  const dropUpdated = dropText.match(/^updatedDate:\s*(.+)$/m)?.[1];
  if (dropUpdated && !/^updatedDate:/m.test(nextFm)) {
    if (/^pubDate: .+$/m.test(nextFm)) {
      nextFm = nextFm.replace(/^(pubDate: .+)$/m, `$1\nupdatedDate: ${dropUpdated}`);
    } else {
      nextFm = `${nextFm}\nupdatedDate: ${dropUpdated}`;
    }
  }
  const dropDesc = dropText.match(/^description:\s*(.+)$/m)?.[1];
  if (dropDesc && !/^description:/m.test(nextFm)) {
    if (/^title: .+$/m.test(nextFm)) {
      nextFm = nextFm.replace(/^(title: .+)$/m, `$1\ndescription: ${dropDesc}`);
    } else {
      nextFm = `${nextFm}\ndescription: ${dropDesc}`;
    }
  }
  const nextBody = body.startsWith("\n") ? body : `\n${body}`;
  let next = `---\n${nextFm}\n---\n${nextBody}`;
  const keepAlt = next.match(/!\[([^\]]*)\]\(/);
  const dropAlt = dropText.match(/!\[([^\]]*)\]\(/);
  if (keepAlt && dropAlt && !keepAlt[1].trim() && dropAlt[1].trim()) {
    next = next.replace(/!\[\]\(/, `![${dropAlt[1]}](`);
  }
  return next;
}

/** Match Graph API imports: hyperlink the word Instagram. */
export function rewriteFromInstagramLine(markdown, permalink) {
  return String(markdown).replace(
    /from Instagram:\s*(https?:\/\/[^\s]+)/gi,
    (_match, url) => {
      const cleaned = String(url).replace(/[.,;]+$/g, "");
      const resolved =
        permalinkFromResolved(permalink || cleaned) || permalink || cleaned;
      return instagramAttributionMarkdown(resolved);
    },
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

export async function polishWpInstagramPosts({
  postsDir = POSTS_DIR,
  redirectsPath = REDIRECTS_PATH,
  dryRun = false,
} = {}) {
  const files = await listPostFiles(postsDir);
  const loaded = [];
  for (const file of files) {
    const text = await readFile(file, "utf8");
    const name = file.split(/[/\\]/).pop();
    const slug = name.replace(/\.md$/, "");
    const permalink = permalinkFromPost(text);
    const isInstagram =
      name.startsWith("instagram-") ||
      /^source:\s*instagram$/m.test(text) ||
      Boolean(parseInstagramIdFromFrontmatter(text)) ||
      isWpInstagramShare(text) ||
      /Originally posted on \[Instagram\]/i.test(text);
    loaded.push({
      file,
      name,
      slug,
      title: titleFromFrontmatter(text),
      text,
      permalink,
      shortcode: instagramShortcodeFromUrl(permalink || text),
      isInstagram,
    });
  }

  const byCode = new Map();
  for (const item of loaded.filter((post) => post.isInstagram && post.shortcode)) {
    const group = byCode.get(item.shortcode) || [];
    group.push(item);
    byCode.set(item.shortcode, group);
  }

  const duplicates = [];
  const deleted = new Set();
  const redirects = {};
  if (redirectsPath) {
    try {
      Object.assign(redirects, JSON.parse(await readFile(redirectsPath, "utf8")));
    } catch {
      // New redirects file.
    }
  }

  for (const group of byCode.values()) {
    if (group.length < 2) continue;
    const keeper = chooseDuplicateKeeper(group);
    let keeperText = keeper.text;
    for (const drop of group.filter((item) => item.name !== keeper.name)) {
      keeperText = mergeDuplicateKeeper(keeperText, drop.text);
      duplicates.push({ drop: drop.name, keep: keeper.name, reason: "permalink" });
      redirects[drop.slug] = keeper.slug;
      deleted.add(drop.file);
      if (!dryRun) await unlink(drop.file);
    }
    if (keeperText !== keeper.text) {
      keeper.text = keeperText;
      if (!dryRun) await writeFile(keeper.file, keeperText, "utf8");
    }
  }

  const rewrittenFiles = [];
  for (const item of loaded) {
    if (deleted.has(item.file) || !item.isInstagram) continue;
    if (item.name.startsWith("instagram-") || parseInstagramIdFromFrontmatter(item.text)) {
      continue;
    }
    const next = rewriteFromInstagramLine(item.text, item.permalink);
    if (next === item.text) continue;
    rewrittenFiles.push(item.name);
    if (!dryRun) await writeFile(item.file, next, "utf8");
  }

  if (!dryRun && redirectsPath) {
    const sorted = Object.fromEntries(
      Object.entries(redirects).sort(([left], [right]) => left.localeCompare(right)),
    );
    await writeFile(redirectsPath, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
  }

  return {
    duplicates: duplicates.length,
    duplicatePairs: duplicates,
    rewritten: rewrittenFiles.length,
    rewrittenFiles,
    redirects,
    dryRun,
  };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const polish = process.argv.includes("--polish") || process.argv.includes("--dedupe");
  if (polish) {
    const result = await polishWpInstagramPosts({ dryRun });
    console.log(JSON.stringify(result, null, 2));
    return;
  }
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
