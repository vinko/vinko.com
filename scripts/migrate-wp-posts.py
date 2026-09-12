#!/usr/bin/env python3
"""Convert dated WordPress HTML posts into src/content/posts/*.md."""

from __future__ import annotations

import json
import re
import shutil
from html import unescape
from pathlib import Path
from urllib.parse import unquote, urlparse

from bs4 import BeautifulSoup, Comment
from markdownify import MarkdownConverter

ROOT = Path(__file__).resolve().parents[1]
WP_ROOT = ROOT / "wordpress" / "www.vinko.com"
PUBLIC_UPLOADS = ROOT / "public" / "wp-content" / "uploads"
WP_UPLOADS = WP_ROOT / "wp-content" / "uploads"
OUT_DIR = ROOT / "src" / "content" / "posts"
REPORT_PATH = ROOT / "scripts" / "wp-migrate-report.json"

SITE_SUFFIX_RE = re.compile(
    r"\s*[–—-]\s*Vinko.?s Thoughts On.*$",
    re.IGNORECASE,
)
DATED_POST_RE = re.compile(r"^(\d{4})/(\d{2})/(\d{2})/([^/]+)$")
UPLOADS_RE = re.compile(
    r"(?:https?:)?//(?:www\.)?(?:blog\.)?vinko\.com/wp-content/uploads/([^?\s#]+)",
    re.IGNORECASE,
)
MORE_SPAN_RE = re.compile(r'<span id="more-\d+"></span>', re.IGNORECASE)


class PostConverter(MarkdownConverter):
    def convert_img(self, el, text, parent_tags):
        src = el.get("src") or ""
        alt = el.get("alt") or el.get("title") or ""
        if not src:
            return ""
        return f"![{alt}]({src})"

    def convert_figure(self, el, text, parent_tags):
        return (text or "").strip() + "\n\n"

    def convert_figcaption(self, el, text, parent_tags):
        caption = (text or "").strip()
        return f"\n*{caption}*\n" if caption else ""

    def convert_del(self, el, text, parent_tags):
        return f"~~{text}~~" if text else ""

    def convert_iframe(self, el, text, parent_tags):
        src = el.get("src") or ""
        return f"\n\n[Embedded media]({src})\n\n" if src else ""

    def convert_script(self, el, text, parent_tags):
        return ""

    def convert_style(self, el, text, parent_tags):
        return ""


def yaml_quote(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def clean_title(raw: str) -> str:
    title = unescape(BeautifulSoup(raw, "html.parser").get_text(" ", strip=True))
    title = SITE_SUFFIX_RE.sub("", title).strip()
    title = re.sub(r"\s+", " ", title)
    return title


def first_paragraph(markdown: str) -> str | None:
    for line in markdown.splitlines():
        text = line.strip()
        if not text or text.startswith("#"):
            continue
        text = re.sub(r"!\[([^\]]*)\]\([^)]+\)", " ", text)
        text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
        text = re.sub(r"[*_`]+", "", text)
        text = re.sub(r"\s+", " ", text).strip()
        if len(text) < 12:
            continue
        if text.lower().startswith("from instagram"):
            continue
        if len(text) > 180:
            text = text[:177].rsplit(" ", 1)[0] + "…"
        return text
    return None


def media_key(url: str) -> str:
    name = Path(unquote(urlparse(url).path)).name.lower()
    return re.sub(r"-\d+x\d+(?=\.[^.]+$)", "", name)


def local_upload_path(rel: str) -> Path:
    rel = unquote(rel).lstrip("/")
    return PUBLIC_UPLOADS / rel


def wp_upload_path(rel: str) -> Path:
    rel = unquote(rel).lstrip("/")
    return WP_UPLOADS / rel


def ensure_local_upload(rel: str, copied: list[str]) -> bool:
    dest = local_upload_path(rel)
    if dest.is_file():
        return True
    src = wp_upload_path(rel)
    if src.is_file():
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dest)
        copied.append(rel)
        return True
    return False


def rewrite_upload_url(url: str, copied: list[str], missing: list[str]) -> str:
    raw = unescape(url.strip())
    match = UPLOADS_RE.search(raw)
    if match:
        rel = unquote(match.group(1))
        if ensure_local_upload(rel, copied):
            return f"/wp-content/uploads/{rel}"
        missing.append(rel)
        return f"/wp-content/uploads/{rel}"

    parsed = urlparse(raw)
    if parsed.path.startswith("/wp-content/uploads/"):
        rel = unquote(parsed.path[len("/wp-content/uploads/") :])
        if ensure_local_upload(rel, copied):
            return f"/wp-content/uploads/{rel}"
        missing.append(rel)
        return f"/wp-content/uploads/{rel}"

    host = (parsed.netloc or "").lower()
    if host in {"www.vinko.com", "vinko.com", "blog.vinko.com"}:
        missing.append(raw)
    return raw


def rewrite_media(soup: BeautifulSoup, copied: list[str], missing: list[str], hotlinks: list[str]) -> None:
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src") or ""
        if not src:
            img.decompose()
            continue
        rewritten = rewrite_upload_url(src, copied, missing)
        if rewritten.startswith("http://www.vinko.com") or rewritten.startswith("https://www.vinko.com"):
            hotlinks.append(rewritten)
        img["src"] = rewritten
        for attr in (
            "srcset",
            "sizes",
            "style",
            "class",
            "width",
            "height",
            "decoding",
            "loading",
            "data-src",
            "data-srcset",
            "data-lazy-src",
        ):
            if attr in img.attrs:
                del img.attrs[attr]
        if not img.get("alt"):
            img["alt"] = img.get("title") or ""

    for a in soup.find_all("a", href=True):
        href = a["href"]
        if UPLOADS_RE.search(href) or "/wp-content/uploads/" in href:
            a["href"] = rewrite_upload_url(href, copied, missing)


def strip_chrome(content: BeautifulSoup) -> None:
    for junk in content.select(
        "script, style, noscript, iframe.lazy, .sharedaddy, .jp-relatedposts, "
        ".elementor-location-header, .elementor-location-footer, .elementor-location-popup, "
        ".wpcnt, #jp-post-flair, .post-password-form"
    ):
        junk.decompose()
    for comment in content.find_all(string=lambda n: isinstance(n, Comment)):
        comment.extract()
    for span in content.find_all("span", id=re.compile(r"^more-\d+$")):
        span.decompose()
    for tag in content.find_all(["span", "div", "section"]):
        classes = " ".join(tag.get("class") or [])
        if any(x in classes for x in ("screen-reader-text", "elementor-hidden", "wp-block-spacer")):
            tag.decompose()


def featured_src(soup: BeautifulSoup) -> str | None:
    header = soup.select_one(".single-featured-image-header img, img.wp-post-image")
    if not header:
        return None
    return header.get("src") or header.get("data-src")


def convert_html(html: str) -> tuple[str, dict]:
    soup = BeautifulSoup(html, "html.parser")
    notes = {"copied": [], "missing": [], "hotlinks": [], "external_kept": []}

    title_el = soup.select_one("h1.entry-title")
    if title_el:
        title = clean_title(title_el.get_text(" ", strip=True))
    else:
        title_tag = soup.title.get_text(" ", strip=True) if soup.title else ""
        title = clean_title(title_tag) or "Untitled"

    published = soup.select_one("time.entry-date.published, time.published")
    updated = soup.select_one("time.updated")
    pub_iso = published.get("datetime") if published else None
    upd_iso = updated.get("datetime") if updated else None

    content = soup.select_one("div.entry-content")
    if content is None:
        return "", {"title": title, "error": "no entry-content", **notes}

    strip_chrome(content)
    rewrite_media(content, notes["copied"], notes["missing"], notes["hotlinks"])

    feat = featured_src(soup)
    if feat:
        local_feat = rewrite_upload_url(feat, notes["copied"], notes["missing"])
        existing_keys = {media_key(img.get("src") or "") for img in content.find_all("img")}
        if local_feat and media_key(local_feat) not in existing_keys:
            img_tag = soup.new_tag("img", src=local_feat, alt=title)
            content.insert(0, img_tag)

    for img in content.find_all("img"):
        src = img.get("src") or ""
        if src.startswith("http") and "vinko.com" not in src and "/wp-content/uploads/" not in src:
            notes["external_kept"].append(src)

    html_body = MORE_SPAN_RE.sub("", str(content))
    markdown = PostConverter(heading_style="ATX", bullets="-", escape_underscores=False).convert(html_body)
    markdown = unescape(markdown)
    markdown = re.sub(r"\n{3,}", "\n\n", markdown).strip() + "\n"
    return markdown, {
        "title": title,
        "pub_iso": pub_iso,
        "upd_iso": upd_iso,
        **notes,
    }


def iso_to_date(iso: str | None, fallback: str) -> str:
    if iso:
        m = re.match(r"(\d{4}-\d{2}-\d{2})", iso)
        if m:
            return m.group(1)
    return fallback


def should_skip(slug: str, title: str, markdown: str) -> str | None:
    text = re.sub(r"[#*_`\[\]()!]+", " ", markdown)
    text = re.sub(r"\s+", " ", text).strip()
    if slug == "test" and title.lower() == "test" and len(text) < 8:
        return "contentless Test post"
    if title.lower() == "test" and len(text) < 8:
        return "contentless Test post"
    return None


def write_post(path: Path, title: str, description: str | None, pub: str, updated: str | None, body: str) -> None:
    lines = ["---", f"title: {yaml_quote(title)}"]
    if description:
        lines.append(f"description: {yaml_quote(description)}")
    lines.append(f"pubDate: {pub}")
    if updated and updated != pub:
        lines.append(f"updatedDate: {updated}")
    lines.append("---")
    lines.append("")
    lines.append(body if body.endswith("\n") else body + "\n")
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    existing = {p.stem: p for p in OUT_DIR.glob("*.md")}
    report = {
        "written": [],
        "overwritten": [],
        "kept_samples": [],
        "skipped": [],
        "failures": [],
        "copied_uploads": [],
        "missing_uploads": [],
        "external_images": [],
        "hotlinks": [],
    }

    posts = []
    for html_path in WP_ROOT.rglob("index.html"):
        rel = html_path.parent.relative_to(WP_ROOT).as_posix()
        if "/feed" in rel:
            continue
        match = DATED_POST_RE.match(rel)
        if not match:
            continue
        year, month, day, slug = match.groups()
        posts.append((year, month, day, slug, html_path))
    posts.sort()

    for year, month, day, slug, html_path in posts:
        url_date = f"{year}-{month}-{day}"
        try:
            html = html_path.read_text(encoding="utf-8", errors="replace")
            body, meta = convert_html(html)
        except Exception as exc:  # noqa: BLE001
            report["failures"].append({"slug": slug, "path": str(html_path), "error": str(exc)})
            continue

        title = meta.get("title") or slug.replace("-", " ")
        skip = should_skip(slug, title, body)
        if skip:
            report["skipped"].append({"slug": slug, "reason": skip, "path": f"{year}/{month}/{day}/{slug}"})
            continue
        if meta.get("error"):
            report["failures"].append({"slug": slug, "error": meta["error"]})
            continue

        pub = iso_to_date(meta.get("pub_iso"), url_date)
        updated = iso_to_date(meta.get("upd_iso"), "") or None
        description = first_paragraph(body)
        dest = OUT_DIR / f"{slug}.md"
        overwritten = dest.exists()
        write_post(dest, title, description, pub, updated, body)
        entry = {"slug": slug, "date": pub, "file": dest.name}
        if overwritten:
            report["overwritten"].append(entry)
        else:
            report["written"].append(entry)
        report["copied_uploads"].extend(meta.get("copied") or [])
        report["missing_uploads"].extend(meta.get("missing") or [])
        report["external_images"].extend(meta.get("external_kept") or [])
        report["hotlinks"].extend(meta.get("hotlinks") or [])

    remaining_samples = []
    for stem, path in sorted(existing.items()):
        if not (OUT_DIR / f"{stem}.md").exists():
            remaining_samples.append(stem)
        elif stem not in {item["slug"] for item in report["written"] + report["overwritten"]}:
            remaining_samples.append(stem)
    # samples that still exist and were not produced from WP slugs this run
    wp_slugs = {item["slug"] for item in report["written"] + report["overwritten"]}
    report["kept_samples"] = [stem for stem in existing if stem not in wp_slugs and (OUT_DIR / f"{stem}.md").exists()]

    report["copied_uploads"] = sorted(set(report["copied_uploads"]))
    report["missing_uploads"] = sorted(set(report["missing_uploads"]))
    report["external_images"] = sorted(set(report["external_images"]))
    report["hotlinks"] = sorted(set(report["hotlinks"]))
    report["final_count"] = len(list(OUT_DIR.glob("*.md")))
    REPORT_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(
        json.dumps(
            {
                "final_count": report["final_count"],
                "written": len(report["written"]),
                "overwritten": len(report["overwritten"]),
                "skipped": report["skipped"],
                "failures": report["failures"],
                "kept_samples": report["kept_samples"],
                "copied_uploads": len(report["copied_uploads"]),
                "missing_uploads": len(report["missing_uploads"]),
                "external_images": len(report["external_images"]),
                "hotlinks": len(report["hotlinks"]),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
