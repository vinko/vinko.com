# vinko.com

Private tracking repo for **[vinko.com](https://vinko.com)** / **[www.vinko.com](https://www.vinko.com)** (“Vinko’s Thoughts On…”).

Spelling: **Vinko** / **vinko.com** only.

## Version 1 — original WordPress (this `main` branch)

This repository’s `main` branch is a **Version 1 — original WordPress public mirror**. It is a snapshot of publicly served files, not a deployable WordPress application.

Captured by a public crawl of `www.vinko.com`, `hosting.vinko.com`, and apex `vinko.com` (robots.txt honored; `/wp-admin/` skipped). Full server-side PHP from hosting is **optional later** and is not in this archive.

### Layout

```
wordpress/www.vinko.com/       # Version 1 WordPress public mirror (HTML, theme/public assets, uploads)
wordpress/hosting.vinko.com/   # related public hosting site pages/assets
wordpress/vinko.com/           # apex host capture (redirects to www)
README.md
MIRROR_STATUS.md
```

`wordpress/www.vinko.com/wp-content/uploads/` holds the public photos and other media files downloaded from the live site (plus sized derivatives listed by the WordPress media API).

### What is included

- Public HTML pages from **www.vinko.com** (posts, pages, taxonomies from the public sitemap)
- Public `wp-content/uploads` photos (originals and generated sizes that still existed on the server)
- Linked public pages/assets from **hosting.vinko.com** and apex **vinko.com** where crawled
- Public CSS, JS, and theme fonts reachable from those pages

### What is not included

- Server-side / private application source code
- Full WordPress core & theme PHP, database contents, secrets, or credentials (full PHP from hosting is optional later)
- `/wp-admin/` (disallowed by `robots.txt`) and login endpoints
- Media library entries that returned 404 at crawl time
- Some historical assets on obsolete hostnames (e.g. `blog.vinko.com` TLS mismatch)

### Notes

- This is a **snapshot** of publicly served files, not a running WordPress app.
- Links in archived HTML may still point at the live site for assets that were not captured.
- **Never deploy or delete hosting files without explicit confirmation.** Do not push this archive live to ICDSoft / vinko.com.
- Annotated git tag: `v1.0.0-wordpress`.

See [MIRROR_STATUS.md](MIRROR_STATUS.md) for crawl counts and gaps.

## Version 2 — Astro (separate branch)

A static Astro rebuild lives on the **`v2-astro`** branch (pull request into `main`). It is local/dev only. **No live deploy without confirm.**
