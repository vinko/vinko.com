#!/usr/bin/env node
/**
 * Fetch @vinko Instagram Business/Creator media and write Astro Markdown drafts.
 *
 * Always creates posts with `draft: true` (Ask-First). Never sets draft:false.
 * Does not deploy to www.vinko.com or any host.
 *
 * Env:
 *   INSTAGRAM_ACCESS_TOKEN  required (GitHub Actions secret; never commit)
 *   INSTAGRAM_USER_ID       optional; `/me` is used when omitted
 *   INSTAGRAM_GRAPH_HOST    optional, default graph.instagram.com
 *   INSTAGRAM_GRAPH_VERSION optional, default v21.0
 */

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

export const GRAPH_HOST_DEFAULT = "graph.instagram.com";
export const GRAPH_VERSION_DEFAULT = "v21.0";
/** Graph `/media` page size. 25 × 400 pages = 10,000, matching the ~10k most-recent ceiling. */
export const MEDIA_PAGE_LIMIT = 25;
/**
 * Safety ceiling for Graph pagination. `fetchMediaPages` also stops when `paging.next` is gone,
 * so this is a cap (≈10k items), not a requirement to fetch that many.
 */
export const MAX_PAGES_DEFAULT = 400;
export const TITLE_MAX = 90;
export const DESCRIPTION_MAX = 160;

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const HASHTAG_RE = /#([\p{L}\p{N}_]+)/gu;

export function parseArgs(argv = process.argv.slice(2)) {
  const out = {
    postsDir: join(ROOT, "src/content/posts"),
    publicDir: join(ROOT, "public"),
    reportPath: join(ROOT, "instagram-sync-report.md"),
    maxPages: MAX_PAGES_DEFAULT,
    dryRun: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--dry-run") out.dryRun = true;
    else if (arg === "--posts-dir" && next) {
      out.postsDir = resolve(next);
      i++;
    } else if (arg === "--public-dir" && next) {
      out.publicDir = resolve(next);
      i++;
    } else if (arg === "--report" && next) {
      out.reportPath = resolve(next);
      i++;
    } else if (arg === "--max-pages" && next) {
      out.maxPages = Math.max(1, Number.parseInt(next, 10) || MAX_PAGES_DEFAULT);
      i++;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return out;
}

export function missingTokenMessage() {
  return [
    "Missing INSTAGRAM_ACCESS_TOKEN.",
    "",
    "This script writes Astro Markdown drafts (always `draft: true`) from the",
    "@vinko Instagram Business/Creator account. It does not deploy to www.vinko.com.",
    "",
    "Add a GitHub Actions repository secret named INSTAGRAM_ACCESS_TOKEN",
    "(long-lived Instagram User token from Instagram API with Instagram Login).",
    "Optional: INSTAGRAM_USER_ID (otherwise GET /me is used).",
    "",
    "See docs/instagram-sync.md",
  ].join("\n");
}

export function parseHashtags(caption) {
  if (!caption) return [];
  const seen = new Set();
  const tags = [];
  for (const match of caption.matchAll(HASHTAG_RE)) {
    const tag = match[1].toLowerCase();
    if (!seen.has(tag)) {
      seen.add(tag);
      tags.push(tag);
    }
  }
  return tags;
}

export function stripHashtags(text) {
  if (!text) return "";
  return text
    .replace(HASHTAG_RE, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function truncate(text, max) {
  const value = (text || "").trim();
  if (value.length <= max) return value;
  const sliced = value.slice(0, max - 1);
  const space = sliced.lastIndexOf(" ");
  const base = space >= Math.min(40, max / 2) ? sliced.slice(0, space) : sliced;
  return `${base.trimEnd()}…`;
}

export function pubDateFromTimestamp(timestamp) {
  const date = timestamp ? new Date(timestamp) : new Date();
  if (Number.isNaN(date.valueOf())) {
    return new Date().toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

export function titleFromCaption(caption, dateStr) {
  const fallback = `Instagram post ${dateStr}`;
  if (!caption?.trim()) return fallback;
  const line = caption
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find(Boolean);
  if (!line) return fallback;
  return truncate(line, TITLE_MAX);
}

export function descriptionFromCaption(caption) {
  const stripped = stripHashtags(caption);
  if (!stripped) return "";
  const first = stripped.split(/\r?\n/).map((item) => item.trim()).find(Boolean) || stripped;
  return truncate(first.replace(/\s+/g, " "), DESCRIPTION_MAX);
}

export function yamlScalar(value) {
  return JSON.stringify(String(value));
}

export function buildFrontmatter({
  title,
  description,
  pubDate,
  tags,
  instagramId,
  instagramPermalink,
}) {
  const lines = [
    "---",
    `title: ${yamlScalar(title)}`,
  ];
  if (description) lines.push(`description: ${yamlScalar(description)}`);
  lines.push(`pubDate: ${pubDate}`);
  lines.push("draft: true");
  if (tags?.length) {
    lines.push("tags:");
    for (const tag of tags) lines.push(`  - ${yamlScalar(tag)}`);
  }
  lines.push("source: instagram");
  lines.push(`instagramId: ${yamlScalar(instagramId)}`);
  if (instagramPermalink) {
    lines.push(`instagramPermalink: ${yamlScalar(instagramPermalink)}`);
  }
  lines.push("---");
  return lines.join("\n");
}

export function postFilename(instagramId) {
  return `instagram-${instagramId}.md`;
}

export function imagePublicPath(instagramId, filename) {
  return `/instagram/${instagramId}/${filename}`;
}

export function extensionFromContentType(contentType, fallbackUrl = "") {
  const type = (contentType || "").split(";")[0].trim().toLowerCase();
  const map = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/heic": ".heic",
    "video/mp4": ".mp4",
  };
  if (map[type]) return map[type];
  try {
    const pathname = new URL(fallbackUrl).pathname;
    const ext = extname(pathname).toLowerCase();
    if (ext && ext.length <= 5) return ext;
  } catch {
    // ignore invalid urls
  }
  return ".jpg";
}

export function collectDownloadableMedia(item) {
  const files = [];
  const seen = new Set();
  const push = (url, kind) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    files.push({ url, kind });
  };

  const mediaType = item.media_type || "IMAGE";
  if (mediaType === "CAROUSEL_ALBUM") {
    const children = item.children?.data || [];
    for (const child of children) {
      if (child.media_type === "VIDEO") push(child.thumbnail_url, "thumbnail");
      else push(child.media_url || child.thumbnail_url, "image");
    }
    if (!files.length) push(item.media_url || item.thumbnail_url, "image");
    return { mediaType, files };
  }
  if (mediaType === "VIDEO") {
    push(item.thumbnail_url, "thumbnail");
    return { mediaType, files };
  }
  push(item.media_url || item.thumbnail_url, "image");
  return { mediaType, files };
}

export function buildPostBody({ caption, permalink, mediaType, imagePaths, title }) {
  const parts = [];
  if (imagePaths.length) {
    imagePaths.forEach((src, index) => {
      const alt = index === 0 ? title : `${title} (${index + 1})`;
      parts.push(`![${escapeAlt(alt)}](${src})`);
    });
    parts.push("");
  }

  const bodyCaption = stripHashtags(caption);
  if (bodyCaption) {
    parts.push(bodyCaption);
    parts.push("");
  }

  if (mediaType === "VIDEO" && !imagePaths.length) {
    parts.push(
      "> This Instagram post is a video or reel. A downloadable still was not available, so this draft is a stub.",
    );
    parts.push("");
  } else if (mediaType === "VIDEO") {
    parts.push("> Originally a video or reel on Instagram; the still above is a thumbnail.");
    parts.push("");
  } else if (!imagePaths.length) {
    parts.push("> No local image was downloaded for this Instagram post.");
    parts.push("");
  }

  if (permalink) {
    parts.push(`Originally posted on [Instagram](${permalink}).`);
    parts.push("");
  }
  return `${parts.join("\n").trim()}\n`;
}

function escapeAlt(text) {
  return String(text).replaceAll("[", "\\[").replaceAll("]", "\\]").replaceAll("\n", " ");
}

export function parseInstagramIdFromFrontmatter(source) {
  const match = source.match(/^[ \t]*instagramId:[ \t]*["']?([^\s"']+)/m);
  return match?.[1] || null;
}

export function parseFrontmatterTags(source) {
  const block = source.match(/^---\n([\s\S]*?)\n---/);
  const fm = block?.[1] ?? source;
  const tags = [];
  let inTags = false;
  for (const line of fm.split("\n")) {
    if (/^tags:\s*$/.test(line)) {
      inTags = true;
      continue;
    }
    if (inTags) {
      const item = line.match(/^[ \t]+-[ \t]*["']?(.+?)["']?\s*$/);
      if (item) {
        const tag = item[1].trim();
        if (tag) tags.push(tag);
        continue;
      }
      if (line.trim() === "" || line.startsWith(" ") || line.startsWith("\t")) continue;
      break;
    }
  }
  return tags;
}

export function splitMarkdown(markdown) {
  const match = String(markdown).match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { fm: "", body: String(markdown), hasFrontmatter: false };
  return { fm: match[1], body: match[2], hasFrontmatter: true };
}

/** Insert tags into YAML without changing `draft`. Does nothing when tags already exist. */
export function insertFrontmatterTags(markdown, tags) {
  if (!tags?.length) return { markdown, changed: false };
  const { fm, body, hasFrontmatter } = splitMarkdown(markdown);
  if (!hasFrontmatter) return { markdown, changed: false };
  if (parseFrontmatterTags(markdown).length) return { markdown, changed: false };

  const tagBlock = ["tags:", ...tags.map((tag) => `  - ${yamlScalar(tag)}`)].join("\n");
  let nextFm;
  if (/^tags:\s*$/m.test(fm)) {
    nextFm = fm.replace(/^tags:\s*$/m, tagBlock);
  } else if (/^draft: .+$/m.test(fm)) {
    nextFm = fm.replace(/^(draft: .+)$/m, `$1\n${tagBlock}`);
  } else if (/^pubDate: .+$/m.test(fm)) {
    nextFm = fm.replace(/^(pubDate: .+)$/m, `$1\n${tagBlock}`);
  } else {
    nextFm = `${fm}\n${tagBlock}`;
  }
  const nextBody = body.startsWith("\n") ? body : `\n${body}`;
  return { markdown: `---\n${nextFm}\n---\n${nextBody}`, changed: true };
}

export function instagramShortcodeFromUrl(url) {
  const match = String(url || "").match(
    /instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/i,
  );
  return match?.[1] || null;
}

export function extractBitlyUrl(text) {
  const match = String(text || "").match(/https?:\/\/bit\.ly\/[A-Za-z0-9]+/i);
  return match?.[0] || null;
}

export function isWpInstagramShare(markdown) {
  return /from Instagram:/i.test(String(markdown));
}

export async function collectInstagramPostIndex(postsDir) {
  const byId = new Map();
  const files = await listMarkdownFiles(postsDir);
  for (const file of files) {
    const text = await readFile(file, "utf8");
    const id = parseInstagramIdFromFrontmatter(text);
    if (id) byId.set(id, { file, text });
  }
  return byId;
}

export async function collectExistingInstagramIds(postsDir) {
  const index = await collectInstagramPostIndex(postsDir);
  return new Set(index.keys());
}

export async function backfillMissingTagsForExisting({
  item,
  existing,
  dryRun,
}) {
  if (!existing) return { updated: false };
  if (parseFrontmatterTags(existing.text).length) return { updated: false };
  const fromCaption = parseHashtags(item.caption);
  const fromFile = parseHashtags(existing.text);
  const merged = [];
  const seen = new Set();
  for (const tag of [...fromCaption, ...fromFile]) {
    if (seen.has(tag)) continue;
    seen.add(tag);
    merged.push(tag);
  }
  if (!merged.length) return { updated: false };
  const { markdown, changed } = insertFrontmatterTags(existing.text, merged);
  if (!changed) return { updated: false };
  if (!dryRun) await writeFile(existing.file, markdown, "utf8");
  return { updated: true, path: existing.file, tags: merged, instagramId: item.id };
}

async function listMarkdownFiles(dir) {
  const out = [];
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return out;
    throw error;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listMarkdownFiles(full)));
    else if (entry.isFile() && /\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

export function graphUrl({ host, version, path, search = {} }) {
  const url = new URL(`https://${host}/${version}/${path.replace(/^\//, "")}`);
  for (const [key, value] of Object.entries(search)) {
    if (value != null && value !== "") url.searchParams.set(key, String(value));
  }
  return url;
}

export async function graphGet(url, token) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(60_000),
  });
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Instagram Graph API returned non-JSON (${response.status})`);
  }
  if (!response.ok || payload.error) {
    const err = payload.error || {};
    const message = err.message || response.statusText || "Unknown Graph API error";
    throw new Error(`Instagram Graph API ${response.status}: ${message}`);
  }
  return payload;
}

export async function resolveUser(token, { host, version, userId }) {
  const path = userId || "me";
  const url = graphUrl({
    host,
    version,
    path,
    search: { fields: "id,user_id,username,account_type" },
  });
  const me = await graphGet(url, token);
  return {
    id: userId || me.user_id || me.id,
    username: me.username || "",
    accountType: me.account_type || "",
    raw: me,
  };
}

const MEDIA_FIELDS =
  "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{id,media_type,media_url,thumbnail_url}";

export async function fetchMediaPages(
  token,
  { host, version, userId, maxPages, get = graphGet },
) {
  const items = [];
  let url = graphUrl({
    host,
    version,
    path: `${userId}/media`,
    search: { fields: MEDIA_FIELDS, limit: String(MEDIA_PAGE_LIMIT) },
  });
  for (let page = 0; page < maxPages && url; page++) {
    const payload = await get(url, token);
    items.push(...(payload.data || []));
    url = payload.paging?.next ? new URL(payload.paging.next) : null;
  }
  return items;
}

export async function downloadFile(url, destPath) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000), redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Download failed ${response.status} for ${destPath}`);
  }
  const ext = extensionFromContentType(response.headers.get("content-type"), url);
  const finalPath = destPath.endsWith(ext) ? destPath : `${destPath}${ext}`;
  await mkdir(dirname(finalPath), { recursive: true });
  if (response.body && typeof response.body.getReader === "function") {
    await pipeline(Readable.fromWeb(response.body), createWriteStream(finalPath));
  } else {
    await writeFile(finalPath, Buffer.from(await response.arrayBuffer()));
  }
  return { path: finalPath, ext };
}

async function maybeLoadDotEnv() {
  const envPath = join(ROOT, ".env");
  let text;
  try {
    text = await readFile(envPath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null || process.env[key] === "") process.env[key] = value;
  }
}

export function formatReport({ username, fetched, skipped, created, stubbed, backfilled = [], errors, dryRun }) {
  const lines = [
    "## Instagram → Astro draft sync",
    "",
    "Ask-First: new posts are created with `draft: true`. Live www.vinko.com is **not** updated.",
    "",
    `- Account: @${username || "vinko"}`,
    `- Fetched: ${fetched}`,
    `- Skipped (already imported): ${skipped}`,
    `- New drafts: ${created.length}`,
    `- Tag backfills: ${backfilled.length}`,
    `- Stubs (video/reel or missing media): ${stubbed.length}`,
    `- Dry run: ${dryRun ? "yes" : "no"}`,
    "",
  ];
  if (created.length) {
    lines.push("### New draft paths");
    lines.push("");
    for (const item of created) {
      const extra = item.stub ? " (stub)" : "";
      lines.push(`- \`${item.path}\`${extra} — ${item.title}`);
    }
    lines.push("");
  } else {
    lines.push("No new Instagram drafts.");
    lines.push("");
  }
  if (errors.length) {
    lines.push("### Errors");
    lines.push("");
    for (const err of errors) lines.push(`- ${err}`);
    lines.push("");
  }
  lines.push("Publish later: after Vinko OK, set `draft: false` on the chosen post(s) and merge `instagram-drafts`.");
  lines.push("");
  return lines.join("\n");
}

export async function writePostFiles({
  item,
  postsDir,
  publicDir,
  dryRun,
  download = downloadFile,
}) {
  const instagramId = String(item.id);
  const pubDate = pubDateFromTimestamp(item.timestamp);
  const title = titleFromCaption(item.caption, pubDate);
  const description = descriptionFromCaption(item.caption);
  const tags = parseHashtags(item.caption);
  const permalink = item.permalink || "";
  const { mediaType, files } = collectDownloadableMedia(item);

  const imagePaths = [];
  const saved = [];
  if (!dryRun) {
    for (let i = 0; i < files.length; i++) {
      const destBase = join(
        publicDir,
        "instagram",
        instagramId,
        String(i + 1).padStart(2, "0"),
      );
      try {
        const result = await download(files[i].url, destBase);
        const filename = result.path.split(/[/\\]/).pop();
        imagePaths.push(imagePublicPath(instagramId, filename));
        saved.push(result.path);
      } catch (error) {
        // Keep going; a post with no images becomes a stub and can be retried
        // only if we skip writing — handled below for IMAGE with zero files.
        console.warn(`Could not download media for ${instagramId}: ${error.message}`);
      }
    }
  } else {
    files.forEach((file, i) => {
      imagePaths.push(imagePublicPath(instagramId, `${String(i + 1).padStart(2, "0")}.jpg`));
    });
  }

  const isVideoStub = mediaType === "VIDEO";
  if (files.length && imagePaths.length === 0 && !dryRun && mediaType !== "VIDEO") {
    return { skippedWrite: true, reason: "image-download-failed", instagramId };
  }

  const frontmatter = buildFrontmatter({
    title,
    description,
    pubDate,
    tags,
    instagramId,
    instagramPermalink: permalink,
  });
  const body = buildPostBody({
    caption: item.caption,
    permalink,
    mediaType,
    imagePaths,
    title,
  });
  const filename = postFilename(instagramId);
  const postPath = join(postsDir, filename);
  if (!dryRun) {
    await mkdir(postsDir, { recursive: true });
    await writeFile(postPath, `${frontmatter}\n\n${body}`, "utf8");
  }
  return {
    skippedWrite: false,
    stub: isVideoStub || imagePaths.length === 0,
    instagramId,
    title,
    path: `src/content/posts/${filename}`,
    absPath: postPath,
    images: saved,
  };
}

export async function runSync({
  token,
  userId,
  host = GRAPH_HOST_DEFAULT,
  version = GRAPH_VERSION_DEFAULT,
  postsDir,
  publicDir,
  maxPages,
  dryRun,
  fetchMedia = fetchMediaPages,
  resolve = resolveUser,
  download = downloadFile,
} = {}) {
  if (!token) {
    const error = new Error(missingTokenMessage());
    error.exitCode = 1;
    throw error;
  }

  const user = await resolve(token, { host, version, userId });
  const media = await fetchMedia(token, {
    host,
    version,
    userId: user.id,
    maxPages,
  });
  const existingIndex = await collectInstagramPostIndex(postsDir);
  const existing = new Set(existingIndex.keys());
  const created = [];
  const stubbed = [];
  const backfilled = [];
  const errors = [];
  let skipped = 0;

  for (const item of media) {
    if (!item?.id) continue;
    const id = String(item.id);
    if (existing.has(id)) {
      skipped += 1;
      try {
        const filled = await backfillMissingTagsForExisting({
          item,
          existing: existingIndex.get(id),
          dryRun,
        });
        if (filled.updated) backfilled.push(filled);
      } catch (error) {
        errors.push(`${id}: tag backfill failed: ${error.message}`);
      }
      continue;
    }
    try {
      const result = await writePostFiles({
        item,
        postsDir,
        publicDir,
        dryRun,
        download,
      });
      if (result.skippedWrite) {
        errors.push(`${id}: ${result.reason} (will retry next run)`);
        continue;
      }
      existing.add(id);
      created.push(result);
      if (result.stub) stubbed.push(result);
    } catch (error) {
      errors.push(`${id}: ${error.message}`);
    }
  }

  return {
    username: user.username,
    fetched: media.length,
    skipped,
    created,
    stubbed,
    backfilled,
    errors,
    dryRun,
  };
}

function printHelp() {
  console.log(`Usage: node scripts/instagram-sync.mjs [options]

Fetch @vinko Instagram media and write Astro Markdown drafts (draft: true).
Does not deploy to www.vinko.com.

Options:
  --dry-run          Fetch and report without writing files
  --posts-dir DIR    Markdown posts directory
  --public-dir DIR   Public assets directory
  --report FILE      Markdown report path
  --max-pages N      Graph API pages to fetch (default ${MAX_PAGES_DEFAULT})
  -h, --help         Show this help

Env:
  INSTAGRAM_ACCESS_TOKEN   required
  INSTAGRAM_USER_ID        optional
  INSTAGRAM_GRAPH_HOST     default ${GRAPH_HOST_DEFAULT}
  INSTAGRAM_GRAPH_VERSION  default ${GRAPH_VERSION_DEFAULT}
`);
}

async function appendJobSummary(markdown) {
  const summary = process.env.GITHUB_STEP_SUMMARY;
  if (!summary) return;
  await writeFile(summary, markdown, { encoding: "utf8", flag: "a" });
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    printHelp();
    return 0;
  }
  await maybeLoadDotEnv();
  const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim() || "";
  const userId = process.env.INSTAGRAM_USER_ID?.trim() || "";
  const host = process.env.INSTAGRAM_GRAPH_HOST?.trim() || GRAPH_HOST_DEFAULT;
  const version = process.env.INSTAGRAM_GRAPH_VERSION?.trim() || GRAPH_VERSION_DEFAULT;

  let result;
  try {
    result = await runSync({
      token,
      userId,
      host,
      version,
      postsDir: args.postsDir,
      publicDir: args.publicDir,
      maxPages: args.maxPages,
      dryRun: args.dryRun,
    });
  } catch (error) {
    const message = error.exitCode ? error.message : `Instagram sync failed: ${error.message}`;
    console.error(message);
    const failReport = [
      "## Instagram → Astro draft sync",
      "",
      "Sync did not complete. Live www.vinko.com was not updated.",
      "",
      "```",
      message,
      "```",
      "",
    ].join("\n");
    await writeFile(args.reportPath, failReport, "utf8").catch(() => {});
    await appendJobSummary(failReport).catch(() => {});
    return error.exitCode || 1;
  }

  const report = formatReport(result);
  await writeFile(args.reportPath, report, "utf8");
  await appendJobSummary(report);
  console.log(report);
  if (result.errors.length) {
    console.warn("Completed with per-item errors; successful drafts were still written.");
  }
  return 0;
}

const isMain =
  process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isMain) {
  main().then((code) => {
    process.exitCode = code;
  });
}
