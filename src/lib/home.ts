import {
  firstImage,
  instagramPosts,
  instagramTagCounts,
  postTags,
  publishedPosts,
  socialTagHref,
  type Post,
} from "./posts";
import { withBase } from "./url";

export type HomeLaneId = "travel" | "food" | "ai";

export type HomeLane = {
  id: HomeLaneId;
  heading: string;
  posts: Post[];
  seeAllHref: string;
  seeAllLabel: string;
};

const TRAVEL_TAGS = [
  "travel",
  "japan",
  "tokyo",
  "osaka",
  "kyoto",
  "fukuoka",
  "hongkong",
  "macau",
  "macao",
  "taiwan",
  "singapore",
  "seoul",
  "vancouver_canada",
  "coloane",
  "cotai",
  "tsimshatsui",
];

const FOOD_TAGS = [
  "food",
  "foodie",
  "burger",
  "ramen",
  "sushi",
  "dessert",
  "pizza",
  "steak",
  "coffee",
  "dimsum",
  "breakfast",
  "macaofoodie",
  "hongkongfoodie",
  "tokyofoodie",
  "osakafoodie",
  "kyotofoodie",
  "vancouverfoodie",
  "japanesefood",
];

const AI_TAGS = ["ai", "artificialintelligence", "machinelearning"];

const TRAVEL_TITLE =
  /\b(trip|travel|vacation|hotel|airport|visit|destinations?|waterfront|suspension bridge|day in|1st day|first day)\b/i;
const TRAVEL_PLACES =
  /\b(bangkok|sydney|seoul|tokyo|osaka|kyoto|fukuoka|macau|macao|venice|paris|london|beijing|shanghai|vancouver|capilano|thailand|california|omotesando|helmsley|crown macau)\b/i;
const FOOD_TITLE =
  /\b(food|bbq|barbecue|burger|dinner|lunch|breakfast|restaurant|dessert|ramen|sushi|steak|pizza|mango|chicken|pancake|vegan|cuisine|coffee|dim\s?sum)\b/i;
const AI_TITLE =
  /\b(ai|artificial intelligence|machine learning|neural|chatgpt|siri|algorithm|privacy|html5|technology|versatilist|futurist)\b/i;
const TECH_NOISE =
  /\b(iphone|ipad|3g|lte|tariff|sim|carrier|unlocked|hacked|itunes|wifi|broadband|android|windows|os x)\b/i;
const MOVIE_REVIEW = /\bmovie review\b/i;

const PLACE_PLATE_PREFERRED = [
  "japan",
  "hongkong",
  "macau",
  "food",
  "tokyo",
  "osaka",
  "macao",
];

const TAG_LABELS: Record<string, string> = {
  hongkong: "Hong Kong",
  macau: "Macau",
  macao: "Macao",
  japan: "Japan",
  tokyo: "Tokyo",
  osaka: "Osaka",
  food: "Food",
};

function hasTag(post: Post, needles: string[]): boolean {
  const tags = new Set(postTags(post).map((tag) => tag.toLowerCase()));
  return needles.some((needle) => tags.has(needle));
}

function scoreLane(post: Post, lane: HomeLaneId): number {
  const title = post.data.title;
  const movie = MOVIE_REVIEW.test(title);

  if (lane === "travel") {
    if (hasTag(post, TRAVEL_TAGS)) return 6;
    let score = 0;
    if (TRAVEL_TITLE.test(title)) score += 4;
    if (TRAVEL_PLACES.test(title)) score += 3;
    if (TECH_NOISE.test(title) && !TRAVEL_TITLE.test(title)) return 0;
    if (movie && score < 4) return 0;
    return score;
  }

  if (lane === "food") {
    if (hasTag(post, FOOD_TAGS)) return 6;
    if (movie) return 0;
    return FOOD_TITLE.test(title) ? 4 : 0;
  }

  if (hasTag(post, AI_TAGS)) return 6;
  if (movie || /\b(conspiracy|caused death)\b/i.test(title)) return 0;
  return AI_TITLE.test(title) ? 4 : 0;
}

function bestLane(post: Post): HomeLaneId | undefined {
  const scored = (["travel", "food", "ai"] as HomeLaneId[])
    .map((id) => ({ id, score: scoreLane(post, id) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return scored[0]?.id;
}

function firstExistingTag(posts: Post[], preferred: string[]): string | undefined {
  const available = new Map(
    instagramTagCounts(posts).map((item) => [item.tag.toLowerCase(), item.tag]),
  );
  for (const key of preferred) {
    const tag = available.get(key.toLowerCase());
    if (tag) return tag;
  }
  return undefined;
}

function titleKey(post: Post): string {
  return post.data.title.trim().toLowerCase();
}

/** Topic lanes for the Lanes desk home mock: latest matching published blog posts. */
export function homeLanes(posts: Post[], limit = 3): HomeLane[] {
  const blog = publishedPosts(posts);
  const byLane: Record<HomeLaneId, Post[]> = { travel: [], food: [], ai: [] };
  const seenTitles: Record<HomeLaneId, Set<string>> = {
    travel: new Set(),
    food: new Set(),
    ai: new Set(),
  };
  for (const post of blog) {
    const lane = bestLane(post);
    if (!lane || byLane[lane].length >= limit) continue;
    const key = titleKey(post);
    if (seenTitles[lane].has(key)) continue;
    seenTitles[lane].add(key);
    byLane[lane].push(post);
  }

  const travelTag = firstExistingTag(posts, ["japan", "tokyo", "hongkong"]);
  const foodTag = firstExistingTag(posts, ["food"]);

  return [
    {
      id: "travel",
      heading: "Travel",
      posts: byLane.travel,
      seeAllHref: travelTag ? socialTagHref(travelTag) : withBase("/blog/"),
      seeAllLabel: "See all",
    },
    {
      id: "food",
      heading: "Food",
      posts: byLane.food,
      seeAllHref: foodTag ? socialTagHref(foodTag) : withBase("/blog/"),
      seeAllLabel: "See all",
    },
    {
      id: "ai",
      heading: "AI in plain English",
      posts: byLane.ai,
      seeAllHref: withBase("/blog/"),
      seeAllLabel: "See all",
    },
  ];
}

/** Newest Instagram posts for the home strip, preferring published shares. */
export function homeInstagramStrip(posts: Post[], limit = 3): Post[] {
  const all = instagramPosts(posts);
  const live = all.filter((post) => !post.data.draft);
  if (live.length >= limit) return live.slice(0, limit);
  const out = [...live];
  const seen = new Set(out.map((post) => post.id));
  for (const post of all) {
    if (seen.has(post.id)) continue;
    out.push(post);
    if (out.length >= limit) break;
  }
  return out;
}

/** Latest published blog post with a body image, else the newest post. */
export function featuredPublishedPost(posts: Post[]): Post | undefined {
  const blog = publishedPosts(posts);
  return blog.find((post) => firstImage(post.body)) ?? blog[0];
}

export function latestPublishedPosts(posts: Post[], limit = 10, excludeId?: string): Post[] {
  return publishedPosts(posts)
    .filter((post) => post.id !== excludeId)
    .slice(0, limit);
}

/** Destination and food Social Network tags for the Story shelf. */
export function placePlateTags(posts: Post[], limit = 4): string[] {
  const available = new Map(
    instagramTagCounts(posts).map((item) => [item.tag.toLowerCase(), item.tag]),
  );
  const out: string[] = [];
  for (const key of PLACE_PLATE_PREFERRED) {
    const tag = available.get(key);
    if (!tag) continue;
    out.push(tag);
    if (out.length >= limit) break;
  }
  return out;
}

export function tagPlainLabel(tag: string): string {
  return TAG_LABELS[tag.trim().toLowerCase()] ?? tag.trim();
}

export const HARBOUR_HERO = {
  src: "/wp-content/uploads/2019/02/d43b5-50177672_2052021638244499_6986579110545121136_n.jpg",
  alt: "Victoria Harbour, Hong Kong, photographed in 2019",
};
