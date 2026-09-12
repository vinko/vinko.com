# vinko.com

Private tracking repo for **[vinko.com](https://vinko.com)** / **[www.vinko.com](https://www.vinko.com)** (“Vinko’s Thoughts On…”).

Spelling: **Vinko** / **vinko.com** only.

This branch carries **both** Version 1 (WordPress public archive) and Version 2 (Astro static rebuild).

---

## Version 1 — original WordPress (`main`, tag `v1.0.0-wordpress`)

A **public crawl** snapshot of the live WordPress site. Not a deployable WordPress app. Full PHP from hosting is **optional later**.

```
wordpress/www.vinko.com/       # Version 1 WordPress public mirror
wordpress/hosting.vinko.com/   # related public hosting pages/assets
wordpress/vinko.com/           # apex host capture
wordpress/www.vinko.com/wp-content/uploads/   # photos
```

See [MIRROR_STATUS.md](MIRROR_STATUS.md) for crawl notes. **Never deploy this archive to ICDSoft / live vinko.com without explicit confirmation.**

---

## Version 2 — Astro (this branch)

Static rebuild at the **repository root**. The Version 1 WordPress tree is kept under `wordpress/` and is not destroyed.

### Pages

| Route | File |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/about/` | `src/pages/about.astro` |
| `/services/` | `src/pages/services.astro` |
| `/contact/` | `src/pages/contact.astro` |
| `/blog/` | `src/pages/blog/index.astro` |
| `/blog/[slug]/` | `src/pages/blog/[slug].astro` |

Migrated posts live in `src/content/posts/` (Astro content collection). Photos used by those posts are served from `public/wp-content/uploads/` (copied from the Version 1 archive). Markdown image URLs are local (`/wp-content/uploads/...`), not hotlinks to www.vinko.com.

Design: **Light Continuum** — an Apple-inspired light editorial (system-ui / SF Pro / Segoe UI / Helvetica stack; field `#f5f5f7`, text `#1d1d1f`, accent `#0071e3`). Not a pixel clone of apple.com. Libre Franklin is no longer used.

### Commands

Requires Node.js 22.12+.

```bash
npm install
npm run dev       # local dev server
npm run build     # static output to dist/
npm run preview   # preview the production build
```

### Preview (GitHub Pages)

A click-through preview of Light Continuum is published from `main` to GitHub Pages. It is **not** the live site.

- Preview URL: **https://vinko.github.io/vinko.com/**
- Workflow: [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) (`npm ci` / `npm run build`, then `dist/` via `actions/deploy-pages`)
- Astro `site` / `base` point at that github.io project URL so asset and nav paths resolve under `/vinko.com/`

This does **not** deploy to www.vinko.com, hosting.vinko.com, or ICDSoft `public_html`.

If the preview 404s or the workflow cannot enable Pages: the repo is private. GitHub Pages for a private repository needs GitHub Pro (or a public repo). In Settings → Pages, set Source to **GitHub Actions** (the workflow tries to do this automatically).

### Important — no live deploy without confirmation

**Do not deploy this site to ICDSoft / the live vinko.com (or hosting.vinko.com) without explicit confirmation.**

This branch is for local development, review, repository work, and the GitHub Pages preview only. No hosting credentials or secrets belong in this repo.

---

## Tree

```
.github/workflows/   # GitHub Pages preview (not live vinko.com)
wordpress/           # Version 1 WordPress public mirror (do not delete)
src/                 # Version 2 Astro source
public/              # Version 2 static assets, including wp-content/uploads photos
astro.config.mjs
package.json
README.md
MIRROR_STATUS.md
```
