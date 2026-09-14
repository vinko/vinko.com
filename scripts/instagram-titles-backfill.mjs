#!/usr/bin/env node
/**
 * One-shot backfill: SEO titles + missing tags on existing `source: instagram` posts.
 * Never sets draft: false. Does not deploy to www.vinko.com.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  cleanCaptionProse,
  countMarkdownImages,
  descriptionFromCaption,
  descriptionLooksBroken,
  isImportantCaption,
  mergeFrontmatterTags,
  parseDescriptionFromFrontmatter,
  parseFrontmatterTags,
  parseHashtags,
  parseTitleFromFrontmatter,
  reconstructCaption,
  replaceFrontmatterScalar,
  retitleImageAlts,
  shouldReplaceTitle,
  splitMarkdown,
  titleFromCaption,
  uniqueTags,
  upsertBodyCaption,
} from "./instagram-caption.mjs";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const POSTS_DIR = join(ROOT, "src/content/posts");

function isInstagramMarkdown(name, text) {
  return (
    name.startsWith("instagram-") ||
    /^source:\s*instagram$/m.test(text) ||
    /^instagramId:/m.test(text)
  );
}

function pubDateFromMarkdown(markdown) {
  return markdown.match(/^pubDate:\s*(\d{4}-\d{2}-\d{2})/m)?.[1] || "1970-01-01";
}

async function listPostFiles(dir) {
  const names = await readdir(dir);
  return names.filter((name) => name.endsWith(".md")).map((name) => join(dir, name));
}

export function rewriteInstagramPost(markdown, { name = "" } = {}) {
  const draftBefore = markdown.match(/^draft:\s*.+$/m)?.[0] || null;
  const { body } = splitMarkdown(markdown);
  const currentTitle = parseTitleFromFrontmatter(markdown);
  const currentDescription = parseDescriptionFromFrontmatter(markdown);
  const existingTags = parseFrontmatterTags(markdown);
  const caption = reconstructCaption({ title: currentTitle, body });
  const tags = uniqueTags(existingTags, parseHashtags(caption), parseHashtags(currentTitle), parseHashtags(body));
  const imageCount = countMarkdownImages(body);
  const pubDate = pubDateFromMarkdown(markdown);
  const important = isImportantCaption(caption, { tags, imageCount });
  const nextTitle = titleFromCaption(caption, pubDate, { tags, imageCount });
  const nextDescription = descriptionFromCaption(caption);

  let next = markdown;
  let titleChanged = false;
  let tagsChanged = false;
  let bodyChanged = false;
  let descriptionChanged = false;

  if (shouldReplaceTitle(currentTitle, nextTitle, { important })) {
    const replaced = replaceFrontmatterScalar(next, "title", nextTitle);
    next = replaced.markdown;
    titleChanged = replaced.changed;
  }

  if (tags.length) {
    const merged = mergeFrontmatterTags(next, tags);
    next = merged.markdown;
    tagsChanged = merged.changed;
  }

  if (titleChanged) {
    const cleanedBody = cleanCaptionProse(caption);
    if (cleanedBody && !/vinko['’]s thoughts on/i.test(currentTitle)) {
      const withBody = upsertBodyCaption(next, caption);
      next = withBody.markdown;
      bodyChanged = withBody.changed;
    }
    if (nextDescription) {
      const desc = replaceFrontmatterScalar(next, "description", nextDescription);
      next = desc.markdown;
      descriptionChanged = desc.changed;
    }
  } else if (descriptionLooksBroken(currentDescription) && nextDescription) {
    const desc = replaceFrontmatterScalar(next, "description", nextDescription);
    next = desc.markdown;
    descriptionChanged = desc.changed;
  }

  if (titleChanged) {
    const alts = retitleImageAlts(next, nextTitle);
    next = alts.markdown;
  }

  const draftAfter = next.match(/^draft:\s*.+$/m)?.[0] || null;
  if (draftBefore !== draftAfter) {
    throw new Error(`${name || "post"}: backfill must not change draft (${draftBefore} → ${draftAfter})`);
  }
  if (/^draft:\s*false$/m.test(next)) {
    throw new Error(`${name || "post"}: backfill must not set draft: false`);
  }

  return {
    markdown: next,
    changed: next !== markdown,
    titleChanged,
    tagsChanged,
    bodyChanged,
    descriptionChanged,
    important,
    beforeTitle: currentTitle,
    afterTitle: titleChanged ? nextTitle : currentTitle,
    tags,
    name,
  };
}

export async function backfillInstagramTitles({
  postsDir = POSTS_DIR,
  dryRun = false,
} = {}) {
  const files = await listPostFiles(postsDir);
  const results = [];
  let scanned = 0;

  for (const file of files) {
    const name = file.split(/[/\\]/).pop();
    const text = await readFile(file, "utf8");
    if (!isInstagramMarkdown(name, text)) continue;
    scanned += 1;
    const result = rewriteInstagramPost(text, { name });
    if (!result.changed) continue;
    if (!dryRun) await writeFile(file, result.markdown, "utf8");
    results.push({ ...result, file, markdown: undefined });
  }

  return {
    scanned,
    updated: results.length,
    titles: results.filter((item) => item.titleChanged).length,
    tags: results.filter((item) => item.tagsChanged).length,
    bodies: results.filter((item) => item.bodyChanged).length,
    dryRun,
    samples: results
      .filter((item) => item.titleChanged)
      .slice(0, 12)
      .map((item) => ({
        file: item.name,
        before: item.beforeTitle,
        after: item.afterTitle,
        important: item.important,
      })),
    updatedFiles: results.map((item) => item.name),
  };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const result = await backfillInstagramTitles({ dryRun });
  console.log(JSON.stringify(result, null, 2));
}

const isMain =
  process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  main();
}
