import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  MAX_PAGES_DEFAULT,
  MEDIA_PAGE_LIMIT,
  buildFrontmatter,
  buildPostBody,
  collectDownloadableMedia,
  collectExistingInstagramIds,
  descriptionFromCaption,
  extensionFromContentType,
  fetchMediaPages,
  formatReport,
  graphUrl,
  missingTokenMessage,
  insertFrontmatterTags,
  instagramShortcodeFromUrl,
  isWpInstagramShare,
  parseArgs,
  parseHashtags,
  parseInstagramIdFromFrontmatter,
  postFilename,
  pubDateFromTimestamp,
  runSync,
  stripHashtags,
  titleFromCaption,
  truncate,
} from "./instagram-sync.mjs";

describe("hashtags", () => {
  it("parses lowercase, preserves order, and dedupes", () => {
    const tags = parseHashtags("Hello #Travel #Food #travel more #HongKong");
    assert.deepEqual(tags, ["travel", "food", "hongkong"]);
  });

  it("keeps unicode hashtags", () => {
    assert.deepEqual(parseHashtags("#香港 #food"), ["香港", "food"]);
  });

  it("strips hashtags from caption body", () => {
    const body = stripHashtags("Lunch in Macau\n\n#macau #food\nSee you");
    assert.equal(body.includes("#"), false);
    assert.match(body, /Lunch in Macau/);
    assert.match(body, /See you/);
  });

  it("keeps inline hashtags as words instead of leaving holes", () => {
    assert.equal(
      stripHashtags("Pretty good #chocolate and #wafer. Especially the #DarkChocolate"),
      "Pretty good Chocolate and Wafer. Especially the Dark Chocolate",
    );
  });
});

describe("title and description", () => {
  it("uses the first non-empty caption line", () => {
    const title = titleFromCaption("\n  Harbour City  \n#hongkong", "2026-09-14");
    assert.equal(title, "Harbour City");
  });

  it("falls back when caption is empty", () => {
    assert.equal(titleFromCaption("", "2026-09-14"), "Instagram post 2026-09-14");
    assert.equal(titleFromCaption(null, "2026-09-14"), "Instagram post 2026-09-14");
  });

  it("fits long titles on a word boundary without a mid-word ellipsis", () => {
    const long = `${"word ".repeat(40)}end`;
    const title = titleFromCaption(long, "2026-09-14");
    assert.ok(title.length <= 90);
    assert.equal(title.includes("…"), false);
    assert.equal(title.includes("#"), false);
    assert.match(title, /word$/);
  });

  it("builds a description without hashtags", () => {
    const description = descriptionFromCaption("Dim sum morning #food #macau");
    assert.equal(description, "Dim sum morning");
  });

  it("does not editorialize one-liners like a Tromsø transit note", () => {
    assert.equal(titleFromCaption("Final leg to Tromsø", "2026-01-28"), "Final leg to Tromsø");
  });

  it("writes an SEO title for the Apple I anniversary post", () => {
    const caption =
      "43 years ago this day (April 1). Apple made history with Apple I without too much fan fare. Now 43 years later Apple has made a big impact in many people’s lives. Especially mine. Thank you Steve’s #apple #applehistory #stevewozniak #stevejobs";
    assert.equal(
      titleFromCaption(caption, "2019-04-01"),
      "Apple I at 43: Why That Quiet Launch Still Matters",
    );
  });

  it("writes an SEO title for a Tonkatsu review in Tsim Sha Tsui", () => {
    const caption = `One of the better #Tonkatsu outside of #Japan. For better quality I suggest choosing the top tier pork classification, which are much more tender

📍Tonkichi Tonkatsu Seafood, The One, Kowloon

#tsimshatsui #hongkongfoodie #HongKong`;
    assert.equal(
      titleFromCaption(caption, "2026-09-10"),
      "Tonkatsu in Tsim Sha Tsui: Skip the Cheap Cut",
    );
  });

  it("prefers an existing 'best dish' sentence over a redundant Topic: Hook", () => {
    assert.equal(
      titleFromCaption(
        "Although it’s 0700, I cannot bring myself to give this pass. The best Southern fried chicken in Hong Kong",
        "2017-01-01",
      ),
      "The best Southern fried chicken in Hong Kong",
    );
  });
});

describe("frontmatter", () => {
  it("always sets draft true and never false", () => {
    const yaml = buildFrontmatter({
      title: 'Quote "here"',
      description: "Desc",
      pubDate: "2026-09-14",
      tags: ["travel", "food"],
      instagramId: "178900",
      instagramPermalink: "https://www.instagram.com/p/abc/",
    });
    assert.match(yaml, /^draft: true$/m);
    assert.doesNotMatch(yaml, /draft:\s*false/);
    assert.match(yaml, /source: instagram/);
    assert.match(yaml, /instagramId: "178900"/);
    assert.match(yaml, /tags:\n {2}- "travel"\n {2}- "food"/);
    assert.match(yaml, /title: "Quote \\"here\\""/);
  });
});

describe("media selection", () => {
  it("uses carousel children images and skips video files", () => {
    const { mediaType, files } = collectDownloadableMedia({
      media_type: "CAROUSEL_ALBUM",
      media_url: "https://example.com/cover.jpg",
      children: {
        data: [
          { media_type: "IMAGE", media_url: "https://example.com/1.jpg" },
          { media_type: "VIDEO", media_url: "https://example.com/clip.mp4", thumbnail_url: "https://example.com/t.jpg" },
          { media_type: "IMAGE", media_url: "https://example.com/2.jpg" },
        ],
      },
    });
    assert.equal(mediaType, "CAROUSEL_ALBUM");
    assert.deepEqual(
      files.map((f) => f.url),
      [
        "https://example.com/1.jpg",
        "https://example.com/t.jpg",
        "https://example.com/2.jpg",
      ],
    );
  });

  it("stubs video without downloading the reel file", () => {
    const { mediaType, files } = collectDownloadableMedia({
      media_type: "VIDEO",
      media_url: "https://example.com/reel.mp4",
      thumbnail_url: "https://example.com/still.jpg",
    });
    assert.equal(mediaType, "VIDEO");
    assert.deepEqual(files, [{ url: "https://example.com/still.jpg", kind: "thumbnail" }]);
  });
});

describe("post body", () => {
  it("includes local image paths and permalink, not ephemeral media_url", () => {
    const body = buildPostBody({
      caption: "Hello #travel",
      permalink: "https://www.instagram.com/p/xyz/",
      mediaType: "IMAGE",
      imagePaths: ["/instagram/1/01.jpg"],
      title: "Hello",
    });
    assert.match(body, /!\[Hello\]\(\/instagram\/1\/01\.jpg\)/);
    assert.match(body, /\[Instagram\]\(https:\/\/www\.instagram\.com\/p\/xyz\/\)/);
    assert.equal(body.includes("Hello #travel"), false);
    assert.match(body, /^Hello$/m);
  });
});

describe("ids and paths", () => {
  it("parses instagramId from existing frontmatter", () => {
    assert.equal(parseInstagramIdFromFrontmatter('instagramId: "123"\n'), "123");
    assert.equal(parseInstagramIdFromFrontmatter("instagramId: 456\n"), "456");
    assert.equal(parseInstagramIdFromFrontmatter("title: hi\n"), null);
  });

  it("uses a stable filename", () => {
    assert.equal(postFilename("1789"), "instagram-1789.md");
  });

  it("maps content types to extensions", () => {
    assert.equal(extensionFromContentType("image/png"), ".png");
    assert.equal(
      extensionFromContentType("image/jpeg; charset=binary"),
      ".jpg",
    );
  });

  it("formats UTC pub dates", () => {
    assert.equal(pubDateFromTimestamp("2026-09-14T07:15:00+00:00"), "2026-09-14");
  });
});

describe("idempotency", () => {
  it("collects instagramId values from existing posts", async () => {
    const dir = await mkdtemp(join(tmpdir(), "ig-posts-"));
    try {
      await writeFile(
        join(dir, "instagram-111.md"),
        "---\ntitle: a\ninstagramId: \"111\"\n---\n",
        "utf8",
      );
      await writeFile(join(dir, "other.md"), "---\ntitle: b\n---\n", "utf8");
      const ids = await collectExistingInstagramIds(dir);
      assert.deepEqual([...ids], ["111"]);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("does not rewrite posts that already have instagramId", async () => {
    const root = await mkdtemp(join(tmpdir(), "ig-sync-"));
    const postsDir = join(root, "posts");
    const publicDir = join(root, "public");
    await mkdir(postsDir, { recursive: true });
    await writeFile(
      join(postsDir, "instagram-keep.md"),
      "---\ntitle: keep\ninstagramId: \"aaa\"\n---\n",
      "utf8",
    );
    const downloads = [];
    const result = await runSync({
      token: "test-token",
      userId: "user",
      postsDir,
      publicDir,
      maxPages: 1,
      dryRun: false,
      resolve: async () => ({ id: "user", username: "vinko" }),
      fetchMedia: async () => [
        {
          id: "aaa",
          caption: "Should skip #food",
          media_type: "IMAGE",
          media_url: "https://example.com/skip.jpg",
          permalink: "https://www.instagram.com/p/skip/",
          timestamp: "2026-09-14T00:00:00+0000",
        },
        {
          id: "bbb",
          caption: "New post\n#Travel #Food",
          media_type: "IMAGE",
          media_url: "https://example.com/new.jpg",
          permalink: "https://www.instagram.com/p/new/",
          timestamp: "2026-09-14T00:00:00+0000",
        },
      ],
      download: async (url, dest) => {
        downloads.push(url);
        const path = `${dest}.jpg`;
        await mkdir(join(path, ".."), { recursive: true });
        await writeFile(path, "img");
        return { path, ext: ".jpg" };
      },
    });

    assert.equal(result.skipped, 1);
    assert.equal(result.created.length, 1);
    assert.equal(result.created[0].instagramId, "bbb");
    assert.deepEqual(downloads, ["https://example.com/new.jpg"]);

    const keepMarkdown = await readFile(join(postsDir, "instagram-keep.md"), "utf8");
    assert.match(keepMarkdown, /instagramId: "aaa"/);
    assert.match(keepMarkdown, /tags:\n {2}- "food"/);
    assert.doesNotMatch(keepMarkdown, /draft:\s*false/);

    const markdown = await readFile(join(postsDir, "instagram-bbb.md"), "utf8");
    assert.match(markdown, /^draft: true$/m);
    assert.match(markdown, /tags:\n {2}- "travel"\n {2}- "food"/);
    assert.match(markdown, /!\[.*\]\(\/instagram\/bbb\/01\.jpg\)/);

    const again = await runSync({
      token: "test-token",
      postsDir,
      publicDir,
      maxPages: 1,
      resolve: async () => ({ id: "user", username: "vinko" }),
      fetchMedia: async () => [
        { id: "bbb", caption: "New post", media_type: "IMAGE", media_url: "https://example.com/new.jpg" },
      ],
      download: async () => {
        throw new Error("should not download again");
      },
    });
    assert.equal(again.skipped, 1);
    assert.equal(again.created.length, 0);

    await rm(root, { recursive: true, force: true });
  });
});

describe("runSync", () => {
  it("fails clearly when the access token is missing", async () => {
    await assert.rejects(
      () => runSync({ token: "", postsDir: "/tmp", publicDir: "/tmp" }),
      (error) => {
        assert.match(error.message, /INSTAGRAM_ACCESS_TOKEN/);
        assert.match(error.message, /www\.vinko\.com/);
        assert.equal(error.exitCode, 1);
        return true;
      },
    );
  });
});

describe("cli helpers", () => {
  it("explains missing token without leaking secrets", () => {
    const message = missingTokenMessage();
    assert.match(message, /INSTAGRAM_ACCESS_TOKEN/);
    assert.match(message, /www\.vinko\.com/);
    assert.doesNotMatch(message, /IGQ|EAA/);
  });

  it("parses flags", () => {
    const args = parseArgs(["--dry-run", "--max-pages", "2", "--posts-dir", "/tmp/posts"]);
    assert.equal(args.dryRun, true);
    assert.equal(args.maxPages, 2);
    assert.equal(args.postsDir, "/tmp/posts");
  });

  it("defaults maxPages to the ~10k Graph safety ceiling", () => {
    assert.equal(MEDIA_PAGE_LIMIT, 25);
    assert.equal(MAX_PAGES_DEFAULT, 400);
    assert.equal(MEDIA_PAGE_LIMIT * MAX_PAGES_DEFAULT, 10_000);
    const args = parseArgs([]);
    assert.equal(args.maxPages, 400);
  });

  it("fetchMediaPages stops when paging.next is gone before maxPages", async () => {
    const calls = [];
    const items = await fetchMediaPages("token", {
      host: "graph.instagram.com",
      version: "v21.0",
      userId: "user",
      maxPages: 400,
      get: async (url) => {
        calls.push(url.toString());
        return { data: [{ id: "only-page" }] };
      },
    });
    assert.equal(items.length, 1);
    assert.equal(calls.length, 1);
    assert.match(calls[0], /limit=25/);
  });

  it("fetchMediaPages respects the maxPages safety ceiling", async () => {
    let page = 0;
    const items = await fetchMediaPages("token", {
      host: "graph.instagram.com",
      version: "v21.0",
      userId: "user",
      maxPages: 2,
      get: async () => {
        page += 1;
        return {
          data: [{ id: `p${page}` }],
          paging: { next: `https://graph.instagram.com/v21.0/user/media?after=${page}` },
        };
      },
    });
    assert.equal(items.length, 2);
    assert.equal(page, 2);
  });

  it("builds a graph URL without putting the token in the query", () => {
    const url = graphUrl({
      host: "graph.instagram.com",
      version: "v21.0",
      path: "me/media",
      search: { fields: "id", limit: "25" },
    });
    assert.equal(
      url.toString(),
      "https://graph.instagram.com/v21.0/me/media?fields=id&limit=25",
    );
    assert.equal(url.searchParams.has("access_token"), false);
  });

  it("truncates on word boundaries when possible", () => {
    assert.equal(truncate("short", 10), "short");
    assert.ok(truncate("hello world from instagram caption", 20).endsWith("…"));
  });

  it("lists draft paths in the human report", () => {
    const report = formatReport({
      username: "vinko",
      fetched: 2,
      skipped: 1,
      created: [{ path: "src/content/posts/instagram-1.md", title: "Hello", stub: false }],
      stubbed: [],
      errors: [],
      dryRun: false,
    });
    assert.match(report, /src\/content\/posts\/instagram-1\.md/);
    assert.match(report, /draft: true/);
    assert.match(report, /Tag backfills: 0/);
    assert.match(report, /www\.vinko\.com is \*\*not\*\* updated/);
  });
});

describe("tag backfill helpers", () => {
  it("inserts tags after draft without flipping it", () => {
    const source = `---\ntitle: "Hello"\npubDate: 2026-09-14\ndraft: true\nsource: instagram\ninstagramId: "1"\n---\n\n#Food in the body\n`;
    const { markdown, changed } = insertFrontmatterTags(source, ["food", "macau"]);
    assert.equal(changed, true);
    assert.match(markdown, /^draft: true$/m);
    assert.doesNotMatch(markdown, /draft:\s*false/);
    assert.match(markdown, /tags:\n {2}- "food"\n {2}- "macau"/);
  });

  it("does not overwrite existing tags", () => {
    const source = `---\ntitle: "Hello"\ntags:\n  - "keep"\n---\n\n#food\n`;
    const { markdown, changed } = insertFrontmatterTags(source, ["food"]);
    assert.equal(changed, false);
    assert.equal(markdown, source);
  });

  it("parses Instagram shortcodes", () => {
    assert.equal(
      instagramShortcodeFromUrl("https://www.instagram.com/p/BOsCiueF5cG/"),
      "BOsCiueF5cG",
    );
    assert.equal(isWpInstagramShare("from Instagram: http://bit.ly/2hWxOMg"), true);
    assert.equal(isWpInstagramShare("A blog post about Texas BBQ"), false);
  });
});
