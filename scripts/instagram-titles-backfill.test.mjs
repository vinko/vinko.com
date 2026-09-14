import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { rewriteInstagramPost, backfillInstagramTitles } from "./instagram-titles-backfill.mjs";

const appleSource = `---
title: "43 years ago this day (April 1). Apple made history with Apple I without too much fan fare. Now 43 years later Apple has made a big impact in many people’s lives. Especially mine. Thank you Steve’s #apple #applehistory #stevewozniak #stevejobs"
description: "Apple I anniversary — from Instagram."
pubDate: 2019-04-01
updatedDate: 2020-04-29
tags:
  - "apple"
  - "applehistory"
  - "stevewozniak"
  - "stevejobs"
source: instagram
instagramPermalink: "https://www.instagram.com/p/BvtWYk_AGfy/"
---

![Steve Wozniak and Steve Jobs](/wp-content/uploads/2019/04/apple.jpg)

Originally posted on [Instagram](https://www.instagram.com/p/BvtWYk_AGfy/).
`;

const tonkatsuSource = `---
title: "One of the better #Tonkatsu outside of #Japan. For better quality I suggest choosing the…"
description: "One of the better outside of . For better quality I suggest choosing the top tier pork classification, which are much more tender"
pubDate: 2026-09-10
draft: true
tags:
  - "tonkatsu"
  - "japan"
  - "tsimshatsui"
  - "hongkongfoodie"
source: instagram
instagramId: "18204909589369282"
instagramPermalink: "https://www.instagram.com/p/DdHAJnPk9yE/"
---

![One of the better #Tonkatsu outside of #Japan. For better quality I suggest choosing the…](/instagram/18204909589369282/01.jpg)

One of the better outside of . For better quality I suggest choosing the top tier pork classification, which are much more tender

📍Tonkichi Tonkatsu Seafood, The One, Kowloon

Originally posted on [Instagram](https://www.instagram.com/p/DdHAJnPk9yE/).
`;

describe("rewriteInstagramPost", () => {
  it("rewrites the Apple I title and keeps the caption in the body", () => {
    const result = rewriteInstagramPost(appleSource, { name: "apple-i-43-years.md" });
    assert.equal(result.titleChanged, true);
    assert.equal(result.afterTitle, "Apple I at 43: Why That Quiet Launch Still Matters");
    assert.match(result.markdown, /^title: "Apple I at 43: Why That Quiet Launch Still Matters"$/m);
    assert.match(result.markdown, /Apple made history with Apple I/);
    assert.match(result.markdown, /Originally posted on \[Instagram\]/);
    assert.doesNotMatch(result.markdown, /draft:\s*false/);
  });

  it("rewrites a Tonkatsu review without flipping draft", () => {
    const result = rewriteInstagramPost(tonkatsuSource, { name: "instagram-tonkatsu.md" });
    assert.equal(result.titleChanged, true);
    assert.equal(result.afterTitle, "Tonkatsu in Tsim Sha Tsui: Skip the Cheap Cut");
    assert.match(result.markdown, /^draft: true$/m);
    assert.doesNotMatch(result.markdown, /draft:\s*false/);
    assert.match(result.markdown, /top tier pork classification/);
    assert.doesNotMatch(result.markdown, /outside of \./);
    assert.doesNotMatch(result.markdown, /outside of\./);
  });

  it("leaves a clean one-liner alone", () => {
    const source = `---
title: "Final leg to Tromsø"
pubDate: 2026-01-28
draft: true
source: instagram
instagramId: "1"
---

Final leg to Tromsø

Originally posted on [Instagram](https://www.instagram.com/p/abc/).
`;
    const result = rewriteInstagramPost(source, { name: "one-liner.md" });
    assert.equal(result.titleChanged, false);
    assert.equal(result.afterTitle, "Final leg to Tromsø");
    assert.match(result.markdown, /^draft: true$/m);
  });

  it("does not chop a long but clean non-review title", () => {
    const source = `---
title: "All clean and waxed enjoying a nice sunny, relatively cool, Monday afternoon"
pubDate: 2017-01-01
source: instagram
---

![](/wp-content/uploads/x.jpg)

Originally posted on [Instagram](https://www.instagram.com/p/abc/).
`;
    const result = rewriteInstagramPost(source, { name: "waxed.md" });
    assert.equal(result.titleChanged, false);
    assert.equal(
      result.afterTitle,
      "All clean and waxed enjoying a nice sunny, relatively cool, Monday afternoon",
    );
  });

  it("backfills tags from caption hashtags when missing", () => {
    const source = `---
title: "Harbour lights #hongkong #tsimshatsui"
pubDate: 2019-02-14
source: instagram
---

from Instagram: https://www.instagram.com/p/abc/
`;
    const result = rewriteInstagramPost(source, { name: "harbour.md" });
    assert.equal(result.tagsChanged, true);
    assert.match(result.markdown, /tags:\n {2}- "hongkong"\n {2}- "tsimshatsui"/);
    assert.doesNotMatch(result.markdown, /draft:\s*false/);
  });
});

describe("backfillInstagramTitles", () => {
  it("updates files on disk without setting draft false", async () => {
    const dir = await mkdtemp(join(tmpdir(), "ig-titles-"));
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "apple-i-43-years.md"), appleSource, "utf8");
    await writeFile(join(dir, "blog.md"), "---\ntitle: \"Texas BBQ\"\npubDate: 2020-01-01\n---\n", "utf8");

    const result = await backfillInstagramTitles({ postsDir: dir, dryRun: false });
    assert.equal(result.scanned, 1);
    assert.ok(result.titles >= 1);

    const apple = await readFile(join(dir, "apple-i-43-years.md"), "utf8");
    assert.match(apple, /^title: "Apple I at 43: Why That Quiet Launch Still Matters"$/m);
    assert.doesNotMatch(apple, /draft:\s*false/);

    const blog = await readFile(join(dir, "blog.md"), "utf8");
    assert.match(blog, /Texas BBQ/);

    await rm(dir, { recursive: true, force: true });
  });
});
