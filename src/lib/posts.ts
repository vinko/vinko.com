import type { CollectionEntry } from "astro:content";
import { withBase } from "./url";

export type Post = CollectionEntry<"posts">;

/** Image-card grid: 6 rows × 3 columns on desktop. */
export const PAGE_SIZE = 18;

/** Public blog posts: omit drafts and anything sourced from Instagram. */
export function publishedPosts(posts: Post[]): Post[] {
  return posts
    .filter((p) => !p.data.draft && !isInstagramPost(p))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Instagram-sourced posts, including drafts (Social Network preview only). */
export function isInstagramPost(post: Post): boolean {
  return post.data.source === "instagram" || Boolean(post.data.instagramId);
}

export function instagramPosts(posts: Post[]): Post[] {
  return posts
    .filter(isInstagramPost)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function postTags(post: Post): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const raw of post.data.tags ?? []) {
    const tag = String(raw).trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }
  return tags;
}

export function blogPostHref(post: Post): string {
  return withBase(`/blog/${post.id}/`);
}

export function socialPostHref(post: Post): string {
  return withBase(`/social-network/${post.id}/`);
}

export function socialTagHref(tag: string): string {
  return withBase(`/social-network/tag/${encodeURIComponent(tag)}/`);
}

export function instagramPostsByTag(posts: Post[], tag: string): Post[] {
  const needle = tag.trim().toLowerCase();
  if (!needle) return [];
  return instagramPosts(posts).filter((post) =>
    postTags(post).some((item) => item.toLowerCase() === needle),
  );
}

export function instagramTagList(posts: Post[]): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const post of instagramPosts(posts)) {
    for (const tag of postTags(post)) {
      const key = tag.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      tags.push(tag);
    }
  }
  return tags.sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
}

export function instagramTagCounts(posts: Post[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of instagramPosts(posts)) {
    for (const tag of postTags(post)) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "en", { sensitivity: "base" }));
}

/** Most-used tags for the Social Network browse row. */
export function instagramPopularTags(posts: Post[], limit = 24, extra?: string): string[] {
  const tags = instagramTagCounts(posts).map((item) => item.tag);
  const out: string[] = [];
  const seen = new Set<string>();
  if (extra?.trim()) {
    out.push(extra.trim());
    seen.add(extra.trim().toLowerCase());
  }
  for (const tag of tags) {
    if (seen.has(tag.toLowerCase())) continue;
    out.push(tag);
    seen.add(tag.toLowerCase());
    if (out.length >= limit) break;
  }
  return out;
}

/** Previous = older, Next = newer, in a newest-first list. */
function chronologicalNeighbors(
  list: Post[],
  current: Post,
): { previous?: Post; next?: Post } {
  const index = list.findIndex((post) => post.id === current.id);
  if (index < 0) return {};
  return {
    previous: list[index + 1],
    next: list[index - 1],
  };
}

/** Previous = older, Next = newer, among published blog posts (no Instagram). */
export function blogNeighbors(
  posts: Post[],
  current: Post,
): { previous?: Post; next?: Post } {
  return chronologicalNeighbors(publishedPosts(posts), current);
}

/** Previous = older, Next = newer, among Instagram posts (including drafts). */
export function instagramNeighbors(
  posts: Post[],
  current: Post,
): { previous?: Post; next?: Post } {
  return chronologicalNeighbors(instagramPosts(posts), current);
}

export function relatedInstagramPosts(posts: Post[], current: Post, limit = 3): Post[] {
  const tags = new Set(postTags(current).map((tag) => tag.toLowerCase()));
  if (!tags.size) return [];
  return instagramPosts(posts)
    .filter((post) => post.id !== current.id)
    .filter((post) => postTags(post).some((tag) => tags.has(tag.toLowerCase())))
    .slice(0, limit);
}

export function firstImage(body: string | undefined): { src: string; alt: string } | undefined {
  if (!body) return undefined;
  const md = body.match(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  if (md) return { alt: md[1], src: withBase(md[2]) };
  return undefined;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function postYears(posts: Post[]): number[] {
  return [...new Set(posts.map((p) => p.data.pubDate.getUTCFullYear()))].sort((a, b) => b - a);
}
