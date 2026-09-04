# vinko.com public mirror

Private tracking repo for [vinko.com](https://vinko.com) / [www.vinko.com](https://www.vinko.com).

This repository contains a **static public mirror** of the live site, captured for archival and reference.

## What is included

- Public HTML pages from **www.vinko.com** (WordPress blog "Vinko's Thoughts On...")
- Linked public pages from **hosting.vinko.com** and apex **vinko.com** where crawled
- Public assets reachable from those pages (CSS, JS, images, fonts), where available

## What is not included

- Server-side / private application source code
- WordPress core & theme PHP, database contents, secrets, or credentials
- `/wp-admin/` (disallowed by `robots.txt`) and login endpoints
- Content that returned 404 or was otherwise unreachable at crawl time
- Some historical assets on obsolete hostnames (e.g. `blog.vinko.com` TLS mismatch)

## Layout

```
www.vinko.com/       # primary site mirror
hosting.vinko.com/   # related public hosting site pages/assets
vinko.com/           # apex host capture (redirects to www)
README.md
```

## Notes

- This is a **snapshot** of publicly served files, not a deployable WordPress app.
- Links may still point at the live site for missing assets.
- Captured with respectful crawling (`robots.txt` honored; wp-admin skipped).
- Never deploy or delete hosting files without explicit confirmation.
- Spelling: **Vinko** / **vinko.com**.

## Mirror date

2026-09-04 (Asia/Macau)
