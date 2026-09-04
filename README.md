# vinko.com — Astro static rebuild

Static Astro rebuild of **[vinko.com](https://www.vinko.com)** (“Vinko’s Thoughts On…”).

This project is the **source of truth** for a future static site. Content was migrated from a public HTML mirror of www.vinko.com for scaffolding purposes (representative posts + About/Services/Contact).

Spelling: **Vinko** / **vinko.com** only.

## Requirements

- Node.js 22.12+ (Astro 5)

## Commands

```bash
npm install
npm run dev       # local dev server
npm run build     # static output to dist/
npm run preview   # preview the production build
```

## Important — no live deploy without confirmation

**Do not deploy this site to ICDSoft / the live vinko.com (or hosting.vinko.com) without explicit confirmation.**

This scaffold is for local development and repository work only. No hosting credentials or secrets belong in this repo.

## Structure

- `src/pages/` — Home, About, Services, Contact, Blog index + post pages
- `src/content/posts/` — Markdown blog posts (content collection)
- `src/layouts/` — shared layout (Libre Franklin via Google Fonts)
- `astro.config.mjs` — `output: 'static'`

## Existing mirror directories

The repository still contains `www.vinko.com/`, `hosting.vinko.com/`, and `vinko.com/` mirror directories (plus related mirror status docs). **Those remain in place as reference snapshots** of prior site content. New Astro project files live at the repository root and are the intended rebuild source of truth going forward.

## Repo

Intended for https://github.com/vinko/vinko.com (copy or replace as appropriate). This folder was generated at `/workspace/vinko-astro` and is ready to be copied into that repository when you choose.
