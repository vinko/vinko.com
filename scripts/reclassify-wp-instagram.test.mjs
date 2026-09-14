import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  duplicateReason,
  permalinkFromResolved,
  reclassifyWpInstagramPosts,
  rewriteFromInstagramLine,
  upsertWpInstagramFrontmatter,
} from "./reclassify-wp-instagram.mjs";

describe("wp instagram reclassify helpers", () => {
  it("builds a canonical permalink from a resolved URL", () => {
    assert.equal(
      permalinkFromResolved("https://www.instagram.com/p/BOsCiueF5cG/?utm_source=ig"),
      "https://www.instagram.com/p/BOsCiueF5cG/",
    );
  });

  it("adds source and tags without setting draft false", () => {
    const source = `---\ntitle: "#HarbourCity #HongKong"\npubDate: 2019-02-14\n---\n\nfrom Instagram: http://bit.ly/2S4cjdy\n`;
    const { markdown, changed } = upsertWpInstagramFrontmatter(source, {
      tags: ["harbourcity", "hongkong"],
      permalink: "https://www.instagram.com/p/abc/",
    });
    assert.equal(changed, true);
    assert.match(markdown, /^source: instagram$/m);
    assert.match(markdown, /instagramPermalink: "https:\/\/www.instagram.com\/p\/abc\/"/);
    assert.match(markdown, /tags:\n {2}- "harbourcity"\n {2}- "hongkong"/);
    assert.doesNotMatch(markdown, /draft:\s*false/);
    assert.doesNotMatch(markdown, /draft:\s*true/);
  });

  it("rewrites bit.ly to the Instagram permalink", () => {
    const next = rewriteFromInstagramLine(
      "from Instagram: http://bit.ly/2S4cjdy\n",
      "https://www.instagram.com/p/abc/",
    );
    assert.equal(next.includes("bit.ly"), false);
    assert.match(next, /from Instagram: https:\/\/www.instagram.com\/p\/abc\//);
  });

  it("does not treat same title in different years as a duplicate", () => {
    const wp = `---\ntitle: "A good start"\npubDate: 2018-07-21\n---\n\nA good start\n`;
    const imported = {
      text: `---\ntitle: "A good start"\npubDate: 2026-06-04\ninstagramPermalink: "https://www.instagram.com/p/xyz/"\n---\n\nA good start\n`,
    };
    assert.equal(duplicateReason(wp, imported, null), null);
  });
});

describe("reclassifyWpInstagramPosts", () => {
  it("reclassifies WP shares and skips Graph imports", async () => {
    const dir = await mkdtemp(join(tmpdir(), "wp-ig-"));
    await mkdir(dir, { recursive: true });
    await writeFile(
      join(dir, "harbour.md"),
      "---\ntitle: \"#HarbourCity\"\npubDate: 2019-02-14\n---\n\nfrom Instagram: http://bit.ly/2S4cjdy\n",
      "utf8",
    );
    await writeFile(
      join(dir, "blog.md"),
      "---\ntitle: \"Texas BBQ\"\npubDate: 2026-03-17\n---\n\nA real blog post about Instagram chefs.\n",
      "utf8",
    );
    await writeFile(
      join(dir, "instagram-1.md"),
      "---\ntitle: \"New\"\npubDate: 2026-06-04\ndraft: true\nsource: instagram\ninstagramId: \"1\"\ninstagramPermalink: \"https://www.instagram.com/p/new/\"\n---\n",
      "utf8",
    );

    const result = await reclassifyWpInstagramPosts({
      postsDir: dir,
      redirectsPath: join(dir, "redirects.json"),
      dryRun: false,
      resolveLinks: true,
      fetchImpl: async () => ({ url: "https://www.instagram.com/p/BOsCiueF5cG/" }),
    });

    assert.equal(result.wpShares, 1);
    assert.equal(result.reclassified, 1);
    assert.equal(result.duplicates, 0);

    const harbour = await readFile(join(dir, "harbour.md"), "utf8");
    assert.match(harbour, /^source: instagram$/m);
    assert.match(harbour, /instagramPermalink: "https:\/\/www.instagram.com\/p\/BOsCiueF5cG\/"/);
    assert.match(harbour, /tags:\n {2}- "harbourcity"/);
    assert.doesNotMatch(harbour, /draft:\s*false/);
    assert.match(harbour, /from Instagram: https:\/\/www.instagram.com\/p\/BOsCiueF5cG\//);

    const blog = await readFile(join(dir, "blog.md"), "utf8");
    assert.doesNotMatch(blog, /source: instagram/);

    const imported = await readFile(join(dir, "instagram-1.md"), "utf8");
    assert.match(imported, /^draft: true$/m);

    await rm(dir, { recursive: true, force: true });
  });
});
