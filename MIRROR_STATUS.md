# Mirror status

## Local full snapshot (box)

- Path: `/workspace/vinko.com-mirror`
- Local git commit: `5ca140d` on branch `main` (1230 files, ~89MB)
- Includes `www.vinko.com/`, `hosting.vinko.com/`, and apex `vinko.com/` captures
- Archive: `/tmp/vinko.com-mirror.tar.gz` (54MB, sha256 `95ecab2cfea3932991a5e2c7143a02b68bbbb8f8be9a51551571aedb27468e96`)

## Remote (`github.com/vinko/vinko.com`)

Partial upload via GitHub MCP (`push_files` / `create_or_update_file`) because `gh` has no local credentials (`gh auth status` logged out; `git push` cannot prompt).

To finish a full push from the box after `gh auth login`:

```bash
cd /workspace/vinko.com-mirror
gh auth login
git push -u origin main --force
```

(`--force` only if remote partial commits should be replaced by the complete local mirror commit.)

## Crawl notes

- Canonical host: `https://www.vinko.com` (apex redirects)
- `robots.txt` honored; `/wp-admin/` skipped
- Some historical `blog.vinko.com` assets failed TLS hostname check
- Some legacy `/images/*` paths returned 404
