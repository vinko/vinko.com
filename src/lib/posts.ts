import type { CollectionEntry } from "astro:content";
import { withBase } from "./url";

export type Post = CollectionEntry<"posts">;

/** Image-card grid: 6 rows × 3 columns on desktop. */
export const PAGE_SIZE = 18;

export function publishedPosts(posts: Post[]): Post[] {
  return posts
    .filter((p) => !p.data.draft)
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
