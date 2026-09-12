/** Prefix a root-absolute path with Astro `base` (GitHub Pages project URL). */
export function withBase(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const base = import.meta.env.BASE_URL;
  const prefix = base.endsWith("/") ? base : `${base}/`;
  if (path === prefix || path.startsWith(prefix)) return path;
  return `${prefix}${path.slice(1)}`;
}
