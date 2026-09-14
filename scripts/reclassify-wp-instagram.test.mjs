import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  chooseDuplicateKeeper,
  duplicateReason,
  permalinkFromResolved,
  polishWpInstagramPosts,
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

  it("rewrites from Instagram: URL to a hyperlinked Instagram word", () => {
    const next = rewriteFromInstagramLine(
      "from Instagram: http://bit.ly/2S4cjdy\n",
      "https://www.instagram.com/p/abc/",
    );
    assert.equal(next.includes("bit.ly"), false);
    assert.equal(next.includes("from Instagram:"), false);
    assert.match(next, /Originally posted on \[Instagram\]\(https:\/\/www.instagram.com\/p\/abc\/\)\./);
  });

  it("rewrites a resolved Instagram URL without a second permalink argument", () => {
    const next = rewriteFromInstagramLine(
      "from Instagram: https://www.instagram.com/p/BvtWYk_AGfy/\n",
    );
    assert.match(
      next,
      /Originally posted on \[Instagram\]\(https:\/\/www.instagram.com\/p\/BvtWYk_AGfy\/\)\./,
    );
  });

  it("keeps the shorter slug when a caption-as-slug duplicate shares a permalink", () => {
    const keeper = chooseDuplicateKeeper([
      {
        name: "43-years-ago-this-day-april-1-apple-made-history-with-apple-i-without-too-much-fan-fare-now-43-years-later-apple-has-made-a-big-impact-in-many-peoples-lives-especially-mine-thank-you-st.md",
        slug: "43-years-ago-this-day-april-1-apple-made-history-with-apple-i-without-too-much-fan-fare-now-43-years-later-apple-has-made-a-big-impact-in-many-peoples-lives-especially-mine-thank-you-st",
        title:
          "43 years ago this day (April 1). Apple made history with Apple I without too much fan fare. Now 43 years later Apple has made a big impact in many people’s lives. Especially mine. Thank you Steve’s #apple",
        text: "---\ntitle: \"long\"\n---\n",
      },
      {
        name: "apple-i-43-years.md",
        slug: "apple-i-43-years",
        title:
          "43 years ago this day (April 1). Apple made history with Apple I without too much fan fare. Now 43 years later Apple has made a big impact in many people’s lives. Especially mine. Thank you Steve’s #apple",
        text: "---\ntitle: \"short\"\ndescription: \"Apple I anniversary — from Instagram.\"\n---\n",
      },
    ]);
    assert.equal(keeper.slug, "apple-i-43-years");
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
    assert.match(
      harbour,
      /Originally posted on \[Instagram\]\(https:\/\/www.instagram.com\/p\/BOsCiueF5cG\/\)\./,
    );

    const blog = await readFile(join(dir, "blog.md"), "utf8");
    assert.doesNotMatch(blog, /source: instagram/);

    const imported = await readFile(join(dir, "instagram-1.md"), "utf8");
    assert.match(imported, /^draft: true$/m);

    await rm(dir, { recursive: true, force: true });
  });
});

describe("polishWpInstagramPosts", () => {
  it("deletes the long caption slug, keeps the short one, and rewrites the Instagram back-link", async () => {
    const dir = await mkdtemp(join(tmpdir(), "ig-dedupe-"));
    await mkdir(dir, { recursive: true });
    const longSlug =
      "43-years-ago-this-day-april-1-apple-made-history-with-apple-i-without-too-much-fan-fare-now-43-years-later-apple-has-made-a-big-impact-in-many-peoples-lives-especially-mine-thank-you-st";
    await writeFile(
      join(dir, "apple-i-43-years.md"),
      `---
title: "43 years ago this day (April 1). Apple made history with Apple I without too much fan fare."
description: "Apple I anniversary — from Instagram."
pubDate: 2019-04-01
source: instagram
instagramPermalink: "https://www.instagram.com/p/BvtWYk_AGfy/"
---

![Steve Wozniak and Steve Jobs](/wp-content/uploads/2019/04/apple.jpg)

from Instagram: https://www.instagram.com/p/BvtWYk_AGfy/
`,
      "utf8",
    );
    await writeFile(
      join(dir, `${longSlug}.md`),
      `---
title: "43 years ago this day (April 1). Apple made history with Apple I without too much fan fare."
pubDate: 2019-04-01
updatedDate: 2020-04-29
source: instagram
instagramPermalink: "https://www.instagram.com/p/BvtWYk_AGfy/"
---

![Steve Wozniak Steve Jobs](/wp-content/uploads/2019/04/apple.jpg)

from Instagram: https://www.instagram.com/p/BvtWYk_AGfy/
`,
      "utf8",
    );
    await writeFile(
      join(dir, "10071.md"),
      `---
title: "Vinko’s Thoughts On…"
pubDate: 2016-05-20
source: instagram
instagramPermalink: "https://www.instagram.com/p/BFmmxrATSoG/"
---

from Instagram: https://www.instagram.com/p/BFmmxrATSoG/
`,
      "utf8",
    );
    await writeFile(
      join(dir, "10075.md"),
      `---
title: "Vinko’s Thoughts On…"
pubDate: 2016-05-20
source: instagram
instagramPermalink: "https://www.instagram.com/p/BFmnHEtTSo-/"
---

from Instagram: https://www.instagram.com/p/BFmnHEtTSo-/
`,
      "utf8",
    );

    const result = await polishWpInstagramPosts({
      postsDir: dir,
      redirectsPath: join(dir, "redirects.json"),
      dryRun: false,
    });

    assert.equal(result.duplicates, 1);
    assert.equal(result.duplicatePairs[0].keep, "apple-i-43-years.md");
    assert.equal(result.duplicatePairs[0].drop, `${longSlug}.md`);

    await assert.rejects(readFile(join(dir, `${longSlug}.md`), "utf8"));

    const kept = await readFile(join(dir, "apple-i-43-years.md"), "utf8");
    assert.match(kept, /^updatedDate: 2020-04-29$/m);
    assert.match(
      kept,
      /Originally posted on \[Instagram\]\(https:\/\/www.instagram.com\/p\/BvtWYk_AGfy\/\)\./,
    );
    assert.doesNotMatch(kept, /from Instagram:/);
    assert.doesNotMatch(kept, /draft:\s*false/);

    const a = await readFile(join(dir, "10071.md"), "utf8");
    const b = await readFile(join(dir, "10075.md"), "utf8");
    assert.match(a, /Originally posted on \[Instagram\]\(https:\/\/www.instagram.com\/p\/BFmmxrATSoG\/\)\./);
    assert.match(b, /Originally posted on \[Instagram\]\(https:\/\/www.instagram.com\/p\/BFmnHEtTSo-\/\)\./);

    const redirects = JSON.parse(await readFile(join(dir, "redirects.json"), "utf8"));
    assert.equal(redirects[longSlug], "apple-i-43-years");

    await rm(dir, { recursive: true, force: true });
  });
});
