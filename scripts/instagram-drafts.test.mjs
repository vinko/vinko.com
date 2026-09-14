import { readdir, readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const postsDir = new URL("../src/content/posts/", import.meta.url);

describe("instagram draft posts", () => {
  it("keeps every Instagram markdown file as draft: true", async () => {
    const names = (await readdir(postsDir)).filter(
      (name) => name.startsWith("instagram-") && name.endsWith(".md"),
    );
    assert.ok(names.length >= 70, `expected ~75 Instagram posts, got ${names.length}`);
    for (const name of names) {
      const text = await readFile(new URL(name, postsDir), "utf8");
      assert.match(text, /^draft: true$/m, `${name} must remain draft: true`);
      assert.doesNotMatch(text, /^draft: false$/m, `${name} must not set draft: false`);
      assert.ok(
        /^source: instagram$/m.test(text) || /^instagramId:/m.test(text),
        `${name} should be Instagram-sourced`,
      );
    }
  });
});
