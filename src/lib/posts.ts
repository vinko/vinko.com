import type { CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

export function publishedPosts(posts: Post[]): Post[] {
  return posts
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function firstImage(body: string | undefined): { src: string; alt: string } | undefined {
  if (!body) return undefined;
  const md = body.match(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  if (md) return { alt: md[1], src: md[2] };
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
