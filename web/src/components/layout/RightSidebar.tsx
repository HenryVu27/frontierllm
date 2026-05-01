/**
 * RightSidebar — per-page TOC slot. Visible ≥ xl only.
 *
 * Phase 5: uses the current route (useLocation + useParams) to derive the
 * active slug, reads its headings from the manifest, and renders <Toc>.
 * Hides entirely when there are no headings (dashboard, search, 404, etc.).
 */

import { useParams, useLocation } from "react-router-dom";
import { getEntry } from "@/lib/manifest";
import { Toc } from "@/components/content/Toc";

/** Map a pathname to a manifest slug. Returns undefined when no content page. */
function deriveSlug(pathname: string, params: Record<string, string | undefined>): string | undefined {
  // /notes/07-frontier-labs/orientation → special orientation slug
  if (pathname === "/notes/07-frontier-labs/orientation") {
    return "07-frontier-labs-orientation";
  }
  // /notes/:slug
  if (pathname.startsWith("/notes/") && params.slug) {
    return params.slug;
  }
  // /projects/:slug
  if (pathname.startsWith("/projects/") && params.slug) {
    return params.slug;
  }
  // /about → root
  if (pathname === "/about") {
    return "root";
  }
  return undefined;
}

export function RightSidebar() {
  const location = useLocation();
  const params = useParams<{ slug?: string }>();
  const slug = deriveSlug(location.pathname, params);
  const entry = slug ? getEntry(slug) : undefined;
  const headings = entry?.headings ?? [];

  // Hide when no headings to show
  if (headings.length === 0) return null;

  return (
    <aside
      aria-label="On this page"
      className={[
        "hidden xl:block",
        "w-56 shrink-0",
        "sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto",
        "py-10 pr-4",
      ].join(" ")}
    >
      <Toc headings={headings} />
    </aside>
  );
}
