# Instagram → Astro drafts (Ask-First)

Scheduled GitHub Action that fetches **@vinko** Instagram Business/Creator media and writes Astro Markdown posts as **drafts**. A human (Otto / Vinko) reviews the `instagram-drafts` pull request and only then publishes.

This workflow **does not** deploy to [www.vinko.com](https://www.vinko.com), hosting.vinko.com, or ICDSoft. It does not set `draft: false`. GitHub Pages preview is updated only if drafts are later merged to `main` **and** `draft` is flipped to `false`.

## Required GitHub secrets

Repo **Settings → Secrets and variables → Actions**:

| Secret | Required | Purpose |
| --- | --- | --- |
| `INSTAGRAM_ACCESS_TOKEN` | **Yes** | Long-lived Instagram User access token (Instagram API with Instagram Login / Business or Creator). Never commit this value. |
| `INSTAGRAM_USER_ID` | No | Instagram professional user id. If omitted, the script calls `GET /me` and uses `user_id` or `id`. |

Optional environment overrides (not secrets): `INSTAGRAM_GRAPH_HOST` (default `graph.instagram.com`), `INSTAGRAM_GRAPH_VERSION` (default `v21.0`).

If `INSTAGRAM_ACCESS_TOKEN` is missing, the job **fails clearly** and writes nothing. That is intentional: a dry-run-safe skip of the API, with no dummy posts and no live deploy.

### How to get the token and user id

1. Create (or reuse) a Meta app with **Instagram API with Instagram Login** for the @vinko Business/Creator account.
2. Grant `instagram_business_basic` (media read).
3. Exchange the short-lived token for a **long-lived** Instagram user token and store it as `INSTAGRAM_ACCESS_TOKEN`.
4. Confirm the user id:

```http
GET https://graph.instagram.com/v21.0/me?fields=id,user_id,username
Authorization: Bearer <INSTAGRAM_ACCESS_TOKEN>
```

Use `user_id` (or `id`) as `INSTAGRAM_USER_ID` if you want to pin it. The media call is:

```http
GET https://graph.instagram.com/v21.0/{user-id}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{id,media_type,media_url,thumbnail_url}
Authorization: Bearer <INSTAGRAM_ACCESS_TOKEN>
```

Facebook Login / `graph.facebook.com` is not required for Instagram Login tokens. Do not paste tokens into issues, PRs, or this repo.

## What the workflow does

- File: [`.github/workflows/instagram-sync.yml`](../.github/workflows/instagram-sync.yml)
- Triggers: daily `0 2 * * *` UTC, plus **Run workflow** (`workflow_dispatch`)
- Script: [`scripts/instagram-sync.mjs`](../scripts/instagram-sync.mjs) (`npm run instagram-sync`)
- Every new IMAGE / CAROUSEL_ALBUM item becomes a candidate Markdown file under `src/content/posts/instagram-{id}.md`
- Images are downloaded into `public/instagram/{id}/` (not left as ephemeral Meta `media_url`)
- VIDEO / REELS are lightly stubbed (thumbnail if present; otherwise a short note + permalink)
- Existing imports are skipped by matching `instagramId` in post frontmatter (re-runs are idempotent)
- Changes are committed to the **`instagram-drafts`** branch and a PR against `main` is opened or updated
- A job summary (and artifact `instagram-sync-report`) lists new draft paths

Tags are hashtags parsed from the caption **as-is** (lowercase, `#` stripped, order preserved, de-duplicated). There is no category map.

## How drafts appear

New files look like:

```yaml
---
title: "…"
description: "…"
pubDate: 2026-09-14
draft: true
tags:
  - travel
  - food
source: instagram
instagramId: "…"
instagramPermalink: "https://www.instagram.com/p/…"
---
```

`draft: true` is always set by the importer. Blog listings and post URLs omit drafts, so merging the PR without flipping the flag still keeps them off the GitHub Pages preview.

Review the PR diff (Markdown + images). Locally you can also inspect the files on the `instagram-drafts` branch.

## How to publish (after Vinko OK)

1. On `instagram-drafts`, edit the post(s) Vinko approved.
2. Set **`draft: false`** (and tidy title/body if needed). Do not rely on the workflow to do this.
3. Merge the PR into `main`.
4. GitHub Pages preview may rebuild from `main`. **www.vinko.com is still not updated** by this repo.

Leave unapproved posts as `draft: true`, or drop them from the PR.

## Local run

Requires Node 22+. No extra npm packages.

```bash
export INSTAGRAM_ACCESS_TOKEN="…"   # never commit
# export INSTAGRAM_USER_ID="…"      # optional
npm run instagram-sync              # or: npm run instagram-sync -- --dry-run
```

A `.env` file at the repo root is loaded if present (`INSTAGRAM_ACCESS_TOKEN=…`). `.env` is gitignored.

## Success / safety

- Ask-First: automation only creates drafts
- No hosting credentials, no ICDSoft deploy, no Pages deploy from this workflow
- Missing secrets → explicit failure, no silent no-op that looks like success in a confusing way, and no files written
