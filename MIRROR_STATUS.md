# Mirror status

## Version 1 — original WordPress public mirror

Layout (this is the Version 1 WordPress public archive):

- `wordpress/www.vinko.com/`
- `wordpress/hosting.vinko.com/`
- `wordpress/vinko.com/`

Spelling: **Vinko** / **vinko.com** only.

## Crawl (public)

- Date: 2026-09-04
- Canonical host: `https://www.vinko.com` (apex redirects)
- `robots.txt` honored; `/wp-admin/` skipped
- Stay-on-host downloads only (`www.vinko.com`, `hosting.vinko.com`, `vinko.com`)
- HTML: public sitemap URLs (posts, pages, categories, tags, post formats, author) plus home, feed, robots.txt, and a few `/page/N/` indexes
- Uploads: WordPress REST `wp/v2/media` source files and generated sizes from `https://www.vinko.com/wp-content/uploads/` (directory listing is 403; files were fetched by URL)
- Theme/public CSS, JS, Libre Franklin font files, and `wp-includes` scripts referenced from the homepage
- `hosting.vinko.com` recursive public wget (`robots.txt` on)

Full PHP from hosting / WordPress core is **optional later** and is not part of this public HTML+uploads snapshot.

## Totals (this tree)

Approximate counts after the 2026-09-04 public crawl:

- Whole `wordpress/` tree: ~8.8k files, ~533MB
- `wordpress/www.vinko.com/wp-content/uploads/`: **6153 files, ~253MB** (photos and sized derivatives)
- Original media `source_url` files present: **1322 / 1365** listed by the media API
- Public HTML from the sitemap: all requested URLs saved (retries after transient DNS errors)

## Gaps

- **43 original media URLs** (and some of their sized variants) returned HTTP 404. Many are 2020-04 theme-demo / stock filenames (`demo-screenshot.jpg`, `logo1.png`, Unsplash-style landscape names, customer portraits) that remain in the media library but are not on disk.
- Some historical `blog.vinko.com` assets failed TLS hostname check in earlier crawls and were not re-fetched here.
- Archived HTML still contains live-site URLs for anything not saved locally.
- Query-string hosting order pages (`order?currency=…`) were captured by wget following public links.

## Deploy policy

**Do not deploy this mirror (or any rebuild) to ICDSoft / live vinko.com or hosting.vinko.com without explicit confirmation.**

No hosting credentials or secrets belong in this repo.

## Git

- Branch: `main` is Version 1 WordPress
- Tag: `v1.0.0-wordpress` (annotated) on the Version 1 archive commit
