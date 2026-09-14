/**
 * Caption cleaning + SEO titles for Instagram → Astro posts.
 * Heuristic only (no external AI). Never writes draft: false.
 */

export const TITLE_MAX = 70;
export const DESCRIPTION_MAX = 160;
export const HASHTAG_RE = /#([\p{L}\p{N}_]+)/gu;

const META_TAGS = new Set([
  "nofilter",
  "latergram",
  "vsco",
  "vscocam",
  "larkfilter",
  "clarendonfilter",
  "portrairmode",
  "portraitmode",
  "instagram",
  "instagood",
  "photooftheday",
]);

const PLACE_LABELS = {
  amsterdam: "Amsterdam",
  california: "California",
  causewaybay: "Causeway Bay",
  civicsquare: "Civic Square",
  coloane: "Coloane",
  coloanevillage: "Coloane",
  copenhagen: "Copenhagen",
  cotai: "Cotai",
  cupertino: "Cupertino",
  denmark: "Denmark",
  fukuoka: "Fukuoka",
  galaxymacau: "Galaxy Macau",
  harbourcity: "Harbour City",
  holland: "Netherlands",
  hongkong: "Hong Kong",
  japan: "Japan",
  kowloon: "Kowloon",
  kowloonstation: "Kowloon Station",
  lasvegas: "Las Vegas",
  macao: "Macau",
  macau: "Macau",
  netherlands: "Netherlands",
  norway: "Norway",
  osaka: "Osaka",
  paloalto: "Palo Alto",
  pasadena: "Pasadena",
  rome: "Rome",
  stanford: "Stanford",
  tokyo: "Tokyo",
  tromso: "Tromsø",
  tromsø: "Tromsø",
  tsimshatsui: "Tsim Sha Tsui",
  tst: "Tsim Sha Tsui",
  venice: "Venice",
  wanchai: "Wan Chai",
  zurich: "Zurich",
};

const PLACE_RANK = {
  tsimshatsui: 22,
  tst: 21,
  harbourcity: 20,
  kowloonstation: 18,
  coloanevillage: 17,
  coloane: 16,
  causewaybay: 16,
  wanchai: 15,
  civicsquare: 15,
  cotai: 14,
  galaxymacau: 13,
  kowloon: 12,
  paloalto: 12,
  cupertino: 12,
  copenhagen: 11,
  amsterdam: 11,
  tromsø: 11,
  tromso: 11,
  zurich: 11,
  osaka: 11,
  tokyo: 11,
  rome: 11,
  fukuoka: 11,
  california: 9,
  hongkong: 6,
  macau: 6,
  macao: 6,
  japan: 4,
  norway: 4,
  denmark: 4,
  holland: 4,
  netherlands: 4,
};

const FOOD_LABELS = {
  angusbeef: "Angus Beef",
  bbqporkbun: "BBQ Pork Bun",
  burger: "Burger",
  calamari: "Calamari",
  cheese: "Cheese",
  chestnut: "Chestnut",
  chocolate: "Chocolate",
  coffee: "Coffee",
  darkchocolate: "Dark Chocolate",
  dimsum: "Dim Sum",
  gelato: "Gelato",
  greekyogurt: "Greek Yogurt",
  instantnoodles: "Instant Noodles",
  mango: "Mango",
  pasta: "Pasta",
  phonoodles: "Pho",
  pizza: "Pizza",
  porkbun: "Pork Bun",
  poutine: "Poutine",
  ramen: "Ramen",
  ribeye: "Ribeye",
  salad: "Salad",
  steak: "Steak",
  sushi: "Sushi",
  tempura: "Tempura",
  tonkatsu: "Tonkatsu",
  wafer: "Wafer",
  waffle: "Waffle",
  wonton: "Wonton",
  yogurt: "Yogurt",
};

const PERSON_LABELS = {
  stevejobs: "Steve Jobs",
  stevewozniak: "Woz",
  gordonramsay: "Gordon Ramsay",
};

const FOOD_RE =
  /\b(tonkatsu|dim\s*sum|ramen|sushi|pizza|burger|pho|steak|ribeye|noodle|noodles|chocolate|cheese|coffee|gelato|taco|pasta|oyster|calamari|chicken|pork|mango|sago|tempura|waffle|pancake|dessert|michelin|gourmet|foodie|yogurt|wafer|wonton|poutine|salad)\b/i;
const REVIEW_RE =
  /\b(recommend|suggest|better|skip|tender|taste|tasty|worth|must visit|overcooked|quality|perfection|best |not at the standards|too expensive|not crunchy|cooked|hype|mediocre|not impress)\b/i;
const TECH_RE =
  /\b(Apple I|Steve Jobs|Wozniak|iPhone|Macintosh|HomePod|AirPods|\d+\s+years ago|years later)\b/i;
const TRAVEL_RE =
  /\b(harbour|landmark|temple|museum|cathedral|tower|canal|gondola|downtown|clock ?tower|observation|palace|resort)\b/i;

const HOOK_PATTERNS = [
  { re: /fan\s*fare|without too much fan/i, hook: "Why That Quiet Launch Still Matters" },
  { re: /top tier|pork classification|better quality i suggest/i, hook: "Skip the Cheap Cut" },
  { re: /toast the buns|from the fridge/i, hook: "Toast the Buns" },
  { re: /must visit/i, hook: "Worth a Stop" },
  { re: /not at the standards|not tasty enough/i, hook: "Not Quite Gourmet" },
  { re: /thin but not crunchy|made on order/i, hook: "Thin Crust, Made to Order" },
  { re: /cooked to perfection/i, hook: "Cooked to Perfection" },
  { re: /best southern fried chicken/i, hook: "The Best in Hong Kong" },
  { re: /too expensive/i, hook: "Skip If Price Matters" },
  { re: /mediocre|borderline bad/i, hook: "Service Misses the Mark" },
  { re: /suppose[d]? to be the best/i, hook: "Does It Live Up to the Hype?" },
  { re: /not impress|preferred the black forest/i, hook: "Macau Branch Falls Short" },
  { re: /if you.?re in a hurry/i, hook: "Go If You’re in a Hurry" },
];

export function parseHashtags(caption) {
  if (!caption) return [];
  const seen = new Set();
  const tags = [];
  for (const match of String(caption).matchAll(HASHTAG_RE)) {
    const tag = match[1].toLowerCase();
    if (!seen.has(tag)) {
      seen.add(tag);
      tags.push(tag);
    }
  }
  return tags;
}

export function isMetaHashtag(tag) {
  const value = String(tag || "").toLowerCase();
  if (!value) return true;
  if (META_TAGS.has(value)) return true;
  if (value.startsWith("shotoniphone")) return true;
  if (value.startsWith("dogwood")) return true;
  if (value.endsWith("foodie") && value.length > 6) return false;
  return false;
}

export function isPlaceholderTitle(text) {
  return /vinko['’]s thoughts on/i.test(String(text || ""));
}

export function humanizeHashtag(tag) {
  const raw = String(tag || "").replace(/^#/, "");
  const lower = raw.toLowerCase();
  if (PLACE_LABELS[lower]) return PLACE_LABELS[lower];
  if (FOOD_LABELS[lower]) return FOOD_LABELS[lower];
  if (PERSON_LABELS[lower]) return PERSON_LABELS[lower];
  const camel = raw.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
  if (/\s/.test(camel)) return camel.replace(/\s+/g, " ").trim();
  if (!raw) return "";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function uniqueTags(...groups) {
  const seen = new Set();
  const out = [];
  for (const group of groups) {
    for (const tag of group || []) {
      const value = String(tag || "").trim().toLowerCase();
      if (!value || seen.has(value)) continue;
      seen.add(value);
      out.push(value);
    }
  }
  return out;
}

export function truncate(text, max) {
  const value = (text || "").trim();
  if (value.length <= max) return value;
  const sliced = value.slice(0, max - 1);
  const space = sliced.lastIndexOf(" ");
  const base = space >= Math.min(40, max / 2) ? sliced.slice(0, space) : sliced;
  return `${base.trimEnd()}…`;
}

export function fitTitle(text, max = TITLE_MAX) {
  let value = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[\s:;,\-–—]+$/g, "");
  if (value.length <= max) return value;
  const sliced = value.slice(0, max);
  const space = sliced.lastIndexOf(" ");
  const base = space >= 24 ? sliced.slice(0, space) : sliced;
  return base.trim().replace(/[\s:;,\-–—]+$/g, "");
}

function stripHashtagOnlyLines(text) {
  return String(text || "")
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      return !/^(?:#[\p{L}\p{N}_]+\s*)+$/u.test(trimmed);
    })
    .join("\n");
}

function stripTrailingHashtagDump(text) {
  return String(text || "").replace(/[ \t](?:#[\p{L}\p{N}_]+){2,}\s*$/gmu, "");
}

const HASHTAG_GLUE = new Set([
  "the",
  "a",
  "an",
  "of",
  "in",
  "on",
  "at",
  "and",
  "or",
  "to",
  "for",
  "with",
  "from",
  "by",
  "as",
  "our",
  "their",
  "my",
  "this",
  "that",
]);

export function cleanCaptionProse(caption, { forTitle = false } = {}) {
  if (!caption) return "";
  let text = String(caption);
  text = stripHashtagOnlyLines(text);
  text = stripTrailingHashtagDump(text);
  text = text.replace(HASHTAG_RE, (full, tag, offset, str) => {
    if (isMetaHashtag(tag)) return "";
    const after = str.slice(offset + full.length);
    const before = str.slice(0, offset);
    const next = after.trimStart()[0] || "";
    if (next && next !== "#") return humanizeHashtag(tag);
    const prevWord = before
      .trim()
      .split(/\s+/)
      .pop()
      ?.toLowerCase()
      .replace(/[^\p{L}\p{N}]/gu, "");
    if (HASHTAG_GLUE.has(prevWord)) return humanizeHashtag(tag);
    return "";
  });
  text = text.replace(/@([A-Za-z0-9._]+)/g, "$1");
  if (forTitle) {
    text = text.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]+/gu, " ");
    text = text.replace(/^[\s]*📍.*$/gmu, "");
  }
  text = text
    .replace(/[ \t]+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/ +([.,;:!?])/g, "$1")
    .replace(/(^|\n)[.,;:!?]+/g, "$1")
    .replace(/\s+\/\s+/g, " ")
    .trim();
  return text;
}

/** Expand inline hashtags to words; drop hashtag-only dumps. */
export function stripHashtags(text) {
  return cleanCaptionProse(text);
}

export function splitSentences(text) {
  const value = String(text || "").replace(/\s+/g, " ").trim();
  if (!value) return [];
  const parts = value.split(/(?<=[.!?])\s+(?=[A-Z0-9“"(\p{Lu}])/u).map((item) => item.trim()).filter(Boolean);
  return parts.length ? parts : [value];
}

export function isImportantCaption(caption, { tags = [], imageCount = 0 } = {}) {
  if (isPlaceholderTitle(caption)) return false;
  const cleaned = cleanCaptionProse(caption, { forTitle: true });
  if (!cleaned) return false;
  const sentences = splitSentences(cleaned);
  const blob = `${cleaned} ${tags.join(" ")}`;
  const food = FOOD_RE.test(blob) || tags.some((tag) => FOOD_LABELS[String(tag).toLowerCase()]);
  const review = REVIEW_RE.test(cleaned);
  const tech = TECH_RE.test(cleaned) || tags.some((tag) => ["apple", "applehistory", "stevejobs", "stevewozniak"].includes(String(tag).toLowerCase()));
  const travel = TRAVEL_RE.test(blob);
  const michelin = /michelin|gourmet dining|omakase|tasting menu/i.test(cleaned);
  const substantial = cleaned.length >= 90 || sentences.length >= 2;
  const shortOneLiner = cleaned.length <= 48 && sentences.length <= 1 && !review && !tech && !michelin;

  if (shortOneLiner && imageCount < 4) return false;
  if (tech && (substantial || /\bApple I\b/i.test(cleaned))) return true;
  if (michelin) return true;
  if (food && (review || substantial || sentences.length >= 2)) return true;
  if (travel && review && substantial) return true;
  if (imageCount >= 3 && substantial && (food || review || michelin)) return true;
  return false;
}

function extractPlace(cleaned, tags) {
  let best = null;
  let rank = -1;
  const consider = (key) => {
    const label = PLACE_LABELS[key];
    if (!label) return;
    const score = PLACE_RANK[key] || 1;
    if (score > rank) {
      rank = score;
      best = label;
    }
  };
  for (const tag of tags) consider(String(tag).toLowerCase());
  for (const [key, label] of Object.entries(PLACE_LABELS)) {
    const re = new RegExp(`\\b${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(cleaned)) consider(key);
  }
  return best;
}

function extractDish(cleaned, tags) {
  for (const tag of tags) {
    const key = String(tag).toLowerCase();
    if (FOOD_LABELS[key]) return FOOD_LABELS[key];
  }
  const fromText = cleaned.match(FOOD_RE);
  if (fromText) {
    const key = fromText[1].toLowerCase().replace(/\s+/g, "");
    return FOOD_LABELS[key] || humanizeHashtag(fromText[1]);
  }
  return null;
}

export function extractPatternedHook(cleaned) {
  for (const pattern of HOOK_PATTERNS) {
    if (pattern.re.test(cleaned)) return pattern.hook;
  }
  return null;
}

export function appleITitle(cleaned) {
  if (!/\bApple I\b/i.test(cleaned)) return null;
  const years = cleaned.match(/(\d+)\s*years/i)?.[1];
  if (!years) return null;
  if (/fan\s*fare|quietly|without too much/i.test(cleaned)) {
    return `Apple I at ${years}: Why That Quiet Launch Still Matters`;
  }
  return `Apple I at ${years}: thank you, Steve Jobs & Woz`;
}

export function composeSeoTitle(caption, tags = []) {
  const cleaned = cleanCaptionProse(caption, { forTitle: true });
  const apple = appleITitle(cleaned);
  if (apple) return fitTitle(apple);

  const sentences = splitSentences(cleaned);
  const titleish = sentences.find(
    (sentence) => /^(the\s+)?best\b/i.test(sentence) && sentence.length <= TITLE_MAX,
  );
  if (titleish) return fitTitle(titleish.replace(/[.!?]+$/, ""));

  const dish = extractDish(cleaned, tags);
  const place = extractPlace(cleaned, tags);
  const hook = extractPatternedHook(cleaned);

  if (dish && place && hook) {
    const candidate = `${dish} in ${place}: ${hook}`;
    if (candidate.length <= TITLE_MAX) return candidate;
    const shorter = `${dish}: ${hook}`;
    if (shorter.length <= TITLE_MAX) return fitTitle(shorter);
    return fitTitle(`${dish} in ${place}`);
  }
  if (dish && hook) return fitTitle(`${dish}: ${hook}`);
  if (dish && place) return fitTitle(`${dish} in ${place}`);
  if (place && hook) return fitTitle(`${place}: ${hook}`);
  if (hook && hook.length >= 24 && hook.length <= TITLE_MAX) return hook;

  const first = (sentences[0] || cleaned).replace(/[.!?]+$/, "");
  if (dish && first.length > 55) return fitTitle(`${dish}${place ? ` in ${place}` : ""}`);
  return fitTitle(first);
}

export function titleFromTags(tags = []) {
  const places = uniqueTags(tags)
    .filter((tag) => PLACE_LABELS[tag] && !isMetaHashtag(tag))
    .sort((a, b) => (PLACE_RANK[b] || 0) - (PLACE_RANK[a] || 0))
    .map((tag) => PLACE_LABELS[tag]);
  const dishes = uniqueTags(tags)
    .map((tag) => FOOD_LABELS[tag])
    .filter(Boolean);
  if (dishes[0] && places[0]) return `${dishes[0]} in ${places[0]}`;
  if (places.length) return [...new Set(places)].slice(0, 2).join(", ");
  if (dishes[0]) return dishes[0];
  const useful = uniqueTags(tags)
    .filter((tag) => !isMetaHashtag(tag) && !String(tag).endsWith("foodie"))
    .slice(0, 2)
    .map(humanizeHashtag);
  return useful.join(", ");
}

function plainTitle(cleaned, tags) {
  if (!cleaned) return titleFromTags(tags);
  const first = splitSentences(cleaned)[0] || cleaned;
  return first.replace(/[.!?]+$/, "") || titleFromTags(tags);
}

export function titleFromCaption(caption, dateStr, options = {}) {
  const fallback = `Instagram post ${dateStr}`;
  if (isPlaceholderTitle(caption)) {
    const line = String(caption || "")
      .split(/\r?\n/)
      .map((item) => item.trim())
      .find(Boolean);
    return line || fallback;
  }
  const tags = uniqueTags(options.tags, parseHashtags(caption));
  const imageCount = options.imageCount || 0;
  const cleaned = cleanCaptionProse(caption, { forTitle: true });
  if (!cleaned && !tags.length) return fallback;
  if (isImportantCaption(caption, { tags, imageCount })) {
    const seo = composeSeoTitle(caption, tags);
    if (seo) return seo;
  }
  const plain = plainTitle(cleaned, tags) || fallback;
  if (plain.length <= 90) return plain;
  return fitTitle(plain, 90);
}

export function descriptionFromCaption(caption) {
  const stripped = cleanCaptionProse(caption, { forTitle: true });
  if (!stripped) return "";
  const first = stripped.split(/\r?\n/).map((item) => item.trim()).find(Boolean) || stripped;
  return truncate(first.replace(/\s+/g, " "), DESCRIPTION_MAX);
}

export function shouldReplaceTitle(current, next, { important = false } = {}) {
  const from = String(current || "").trim();
  const to = String(next || "").trim();
  if (!to || from === to) return false;
  if (isPlaceholderTitle(from)) return false;
  if (/#/.test(from)) return true;
  if (/…$/.test(from)) return true;
  if (important && from.length > TITLE_MAX && to !== from) return true;
  return false;
}

export function yamlScalar(value) {
  return JSON.stringify(String(value));
}

export function splitMarkdown(markdown) {
  const match = String(markdown).match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { fm: "", body: String(markdown), hasFrontmatter: false };
  return { fm: match[1], body: match[2], hasFrontmatter: true };
}

function parseYamlScalarLine(markdown, key) {
  const match = String(markdown).match(new RegExp(`^${key}:\\s*("(?:\\\\.|[^"\\\\])*"|\\S.*)\\s*$`, "m"));
  if (!match) return "";
  const raw = match[1];
  if (raw.startsWith('"')) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw.slice(1, -1);
    }
  }
  return raw.trim();
}

export function parseTitleFromFrontmatter(markdown) {
  return parseYamlScalarLine(markdown, "title");
}

export function parseDescriptionFromFrontmatter(markdown) {
  return parseYamlScalarLine(markdown, "description");
}

export function parseFrontmatterTags(source) {
  const block = String(source).match(/^---\n([\s\S]*?)\n---/);
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

export function mergeFrontmatterTags(markdown, tags) {
  const existing = parseFrontmatterTags(markdown);
  const merged = uniqueTags(existing, tags);
  if (!merged.length) return { markdown, changed: false };
  if (merged.length === existing.length && existing.every((tag, i) => tag.toLowerCase() === merged[i])) {
    return { markdown, changed: false };
  }
  if (!existing.length) return insertFrontmatterTags(markdown, merged);

  const { fm, body, hasFrontmatter } = splitMarkdown(markdown);
  if (!hasFrontmatter) return { markdown, changed: false };
  const tagBlock = ["tags:", ...merged.map((tag) => `  - ${yamlScalar(tag)}`)].join("\n");
  const nextFm = fm.replace(/^tags:\s*(?:\n[ \t]+-.*)*/m, tagBlock);
  const nextBody = body.startsWith("\n") ? body : `\n${body}`;
  return { markdown: `---\n${nextFm}\n---\n${nextBody}`, changed: nextFm !== fm };
}

export function replaceFrontmatterScalar(markdown, key, value) {
  const { fm, body, hasFrontmatter } = splitMarkdown(markdown);
  if (!hasFrontmatter) return { markdown, changed: false };
  const line = `${key}: ${yamlScalar(value)}`;
  let nextFm = fm;
  if (!new RegExp(`^${key}:`, "m").test(fm)) {
    if (/^title: .+$/m.test(fm) && key === "description") {
      nextFm = fm.replace(/^(title: .+)$/m, `$1\n${line}`);
    } else {
      nextFm = `${fm}\n${line}`;
    }
  } else {
    nextFm = fm.replace(new RegExp(`^${key}:\\s*.*$`, "m"), line);
  }
  if (nextFm === fm) return { markdown, changed: false };
  const nextBody = body.startsWith("\n") ? body : `\n${body}`;
  return { markdown: `---\n${nextFm}\n---\n${nextBody}`, changed: true };
}

export function countMarkdownImages(body) {
  return [...String(body || "").matchAll(/!\[[^\]]*\]\([^)]+\)/g)].length;
}

export function reconstructCaption({ title = "", body = "" }) {
  const prose = String(body || "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/Originally posted on \[Instagram\]\([^)]+\)\./gi, "")
    .replace(/from Instagram:.*/gi, "")
    .replace(/^> .+$/gm, "")
    .trim();
  if (isPlaceholderTitle(title)) return prose;
  let caption = String(title || "").trim();
  if (/[…]$/.test(caption) || /\.\.\.$/.test(caption)) {
    return stitchTruncatedCaption(caption, prose);
  }
  if (prose) {
    const extra = uniqueCaptionExtras(prose, cleanCaptionProse(caption));
    if (extra) caption = `${caption}\n\n${extra}`;
  }
  return caption.trim();
}

function stitchTruncatedCaption(title, prose) {
  const stem = String(title).replace(/[…]+$/, "").replace(/\.\.\.$/, "").trim();
  const cleanedStem = cleanCaptionProse(stem);
  const location = [...String(prose).matchAll(/^📍.*$/gm)].map((match) => match[0]);
  const bodyText = String(prose)
    .replace(/^📍.*$/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleanedStem.split(/\s+/).filter(Boolean);
  const needle = words.slice(-4).join(" ").toLowerCase();
  let continuation = "";
  const idx = needle ? bodyText.toLowerCase().indexOf(needle) : -1;
  if (idx >= 0) {
    continuation = bodyText.slice(idx + needle.length).trim();
  }
  return [stem, continuation, ...location].filter(Boolean).join("\n\n").trim();
}

function uniqueCaptionExtras(prose, cleanedTitle) {
  const title = cleanedTitle.toLowerCase().replace(/\s+/g, " ");
  const keep = [];
  for (const raw of String(prose).split(/\n+/)) {
    const line = raw.trim();
    if (!line) continue;
    if (/^📍/.test(line) || /^@/.test(line)) {
      keep.push(line);
      continue;
    }
    const norm = line.toLowerCase().replace(/\s+/g, " ");
    if (descriptionLooksBroken(line)) continue;
    if (title.includes(norm.slice(0, Math.min(40, norm.length)))) continue;
    keep.push(line);
  }
  return keep.join("\n\n");
}

export function upsertBodyCaption(markdown, caption) {
  const cleaned = cleanCaptionProse(caption);
  if (!cleaned || isPlaceholderTitle(cleaned)) return { markdown, changed: false };
  const { fm, body, hasFrontmatter } = splitMarkdown(markdown);
  if (!hasFrontmatter) return { markdown, changed: false };

  const images = [...body.matchAll(/!\[[^\]]*\]\([^)]+\)/g)].map((match) => match[0]);
  const quotes = [...body.matchAll(/^> .+$/gm)].map((match) => match[0]);
  const attribution =
    body.match(/Originally posted on \[Instagram\]\([^)]+\)\./)?.[0] ||
    body.match(/from Instagram:.*/i)?.[0] ||
    "";

  const parts = [];
  if (images.length) {
    parts.push(images.join("\n"), "");
  }
  parts.push(cleaned, "");
  if (quotes.length) {
    parts.push(quotes.join("\n"), "");
  }
  if (attribution) parts.push(attribution, "");
  const nextBody = `${parts.join("\n").trim()}\n`;
  const prevBody = body.startsWith("\n") ? body.slice(1) : body;
  if (nextBody.trim() === prevBody.trim()) return { markdown, changed: false };
  return { markdown: `---\n${fm}\n---\n\n${nextBody}`, changed: true };
}

export function retitleImageAlts(markdown, title) {
  const safe = String(title || "").replaceAll("[", "\\[").replaceAll("]", "\\]").replaceAll("\n", " ");
  const { fm, body, hasFrontmatter } = splitMarkdown(markdown);
  if (!hasFrontmatter || !safe) return { markdown, changed: false };
  let index = 0;
  const nextBody = body.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_full, _alt, src) => {
    const alt = index === 0 ? safe : `${safe} (${index + 1})`;
    index += 1;
    return `![${alt}](${src})`;
  });
  if (nextBody === body) return { markdown, changed: false };
  const wrapped = nextBody.startsWith("\n") ? nextBody : `\n${nextBody}`;
  return { markdown: `---\n${fm}\n---\n${wrapped}`, changed: true };
}

export function descriptionLooksBroken(description) {
  const value = String(description || "");
  if (!value) return false;
  if (/#/.test(value)) return true;
  if (/ \. /.test(value) || / , /.test(value) || / of \./.test(value)) return true;
  if (/outside of \./.test(value)) return true;
  return false;
}
