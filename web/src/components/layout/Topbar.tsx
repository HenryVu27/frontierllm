/**
 * Topbar — sticky header.
 * Left: hamburger (mobile only) + breadcrumbs derived from current route.
 * Center: search input placeholder (Phase 7 wires real search).
 * Right: ThemeToggle + GitHub link + "Open in editor" link (conditional).
 */

import { useLocation, Link } from "react-router-dom";
import { Menu, GitFork } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { SearchInput } from "@/components/search/SearchInput";
import { getEntry } from "@/lib/manifest";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMenuClick: () => void;
  sidebarCollapsed?: boolean;
  onOpenCmdK?: () => void;
}

interface BreadcrumbSegment {
  label: string;
  href?: string;
}

/** Derive breadcrumb segments from the current pathname. */
function useBreadcrumbs(): BreadcrumbSegment[] {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    // Dashboard
    return [{ label: "Dashboard" }];
  }

  const [first, second] = segments;

  if (first === "notes") {
    if (!second) {
      return [{ label: "Notes" }];
    }
    if (second === "07-frontier-labs" && segments[2] === "orientation") {
      return [
        { label: "Notes", href: "/notes" },
        { label: "07 — Frontier Labs", href: "/notes/07-frontier-labs" },
        { label: "Orientation" },
      ];
    }
    // Look up the topic title from manifest
    const entry = getEntry(second);
    const label = entry
      ? entry.title
      : second
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
    return [
      { label: "Notes", href: "/notes" },
      { label: label },
    ];
  }

  if (first === "projects") {
    if (!second) {
      return [{ label: "Projects" }];
    }
    const entry = getEntry(second);
    const label = entry
      ? entry.title
      : second
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
    return [
      { label: "Projects", href: "/projects" },
      { label: label },
    ];
  }

  const staticLabels: Record<string, string> = {
    reading: "Reading List",
    about: "About",
    search: "Search",
  };

  const fallback = first ?? "";
  const label = (first !== undefined ? staticLabels[first] : undefined) ?? fallback;
  return [{ label: label }];
}

/** Derive the "Open in editor" link for the current route. */
function useEditorLink(): string | null {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  const [first, second, third] = segments;

  // TODO Phase 6: use real absolute path from manifest entry
  // For now just return null — will be wired when pages render real content
  if (first === "notes" && second) {
    if (second === "07-frontier-labs" && third === "orientation") {
      const entry = getEntry("07-frontier-labs-orientation");
      if (entry) return `vscode://file/${entry.path.replace(/\\/g, "/")}`;
    } else if (second) {
      const entry = getEntry(second);
      if (entry) return `vscode://file/${entry.path.replace(/\\/g, "/")}`;
    }
  }

  if (first === "projects" && second) {
    const entry = getEntry(second);
    if (entry) return `vscode://file/${entry.path.replace(/\\/g, "/")}`;
  }

  return null;
}

export function Topbar({ onMenuClick, onOpenCmdK }: TopbarProps) {
  const breadcrumbs = useBreadcrumbs();
  const editorLink = useEditorLink();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-14",
        "flex items-center gap-3 px-4 md:px-6",
        "border-b border-border bg-background/95",
        "backdrop-blur-sm"
      )}
    >
      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className={cn(
          "md:hidden flex items-center justify-center",
          "w-9 h-9 rounded-lg",
          "text-muted-foreground hover:text-foreground hover:bg-accent",
          "transition-colors duration-150",
          "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1",
          "shrink-0"
        )}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumbs */}
      <div className="flex-1 min-w-0 hidden sm:block">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((seg, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <span key={i} className="flex items-center">
                  {i > 0 && <BreadcrumbSeparator className="mx-1.5" />}
                  <BreadcrumbItem>
                    {!isLast && seg.href ? (
                      <BreadcrumbLink asChild>
                        <Link
                          to={seg.href}
                          className={cn(
                            "font-sans text-sm text-muted-foreground",
                            "hover:text-primary transition-colors duration-150"
                          )}
                        >
                          {seg.label}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage
                        className="font-sans text-sm text-foreground"
                      >
                        {seg.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </span>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Search input — compact pill on desktop, icon button on mobile */}
      <SearchInput compact {...(onOpenCmdK ? { onOpenCmdK } : {})} />

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Open in editor — shown only on routes with a backing .md file */}
        {editorLink && (
          <a
            href={editorLink}
            title="Open in VS Code"
            aria-label="Open source file in VS Code"
            className={cn(
              "hidden md:flex items-center justify-center",
              "w-8 h-8 rounded-lg",
              "font-mono text-xs text-muted-foreground",
              "hover:text-primary hover:bg-accent",
              "transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1"
            )}
          >
            {/* VS Code icon approximation */}
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 3L22 7L12 17L2 7L6 3L12 13L18 3Z" />
              <path d="M2 7L2 17L12 22L22 17L22 7" />
            </svg>
          </a>
        )}

        {/* GitHub link */}
        <a
          href="https://github.com/HenryVu27/frontierllm"
          target="_blank"
          rel="noopener noreferrer"
          title="Open on GitHub"
          aria-label="Open repository on GitHub"
          className={cn(
            "flex items-center justify-center",
            "w-8 h-8 rounded-lg",
            "text-muted-foreground",
            "hover:text-primary hover:bg-accent",
            "transition-colors duration-150",
            "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1"
          )}
        >
          <GitFork className="w-4 h-4" />
        </a>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
