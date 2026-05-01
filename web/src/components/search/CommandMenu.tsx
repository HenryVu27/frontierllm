/**
 * CommandMenu — global cmd-k command palette.
 *
 * Uses cmdk (via shadcn Command primitives) wrapped in a Dialog.
 * Sections:
 *   1. Quick navigation (static)
 *   2. Recent pages (last 8 from localStorage)
 *   3. Search results (live, from useSearch)
 *
 * Open state is managed via props (lifted to AppShell so the global keybinding
 * can be set up there alongside the component mount).
 */

import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  List,
  Info,
  FileText,
  Hash,
  Clock,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { useSearch } from "@/hooks/useSearch";
import { useRecentPages } from "@/hooks/useRecentPages";
import { cn } from "@/lib/utils";

// ─── Quick nav items ──────────────────────────────────────────────────────────

const QUICK_NAV = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Notes", href: "/notes", icon: BookOpen },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Reading List", href: "/reading", icon: List },
  { label: "About", href: "/about", icon: Info },
] as const;

// ─── Kind icon ────────────────────────────────────────────────────────────────

function KindIcon({ kind }: { kind: "page" | "heading" | "reading-item" }) {
  const icons = {
    page: FileText,
    heading: Hash,
    "reading-item": BookOpen,
  } as const;
  const Icon = icons[kind];
  return <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const navigate = useNavigate();
  const recentPages = useRecentPages();
  const { query, setQuery, results } = useSearch();

  // Reset search query when menu opens
  useEffect(() => {
    if (open) {
      setQuery("");
    }
  }, [open, setQuery]);

  const runItem = useCallback(
    (href: string) => {
      onOpenChange(false);
      navigate(href);
    },
    [navigate, onOpenChange]
  );

  const hasResults =
    results.pages.length > 0 ||
    results.headings.length > 0 ||
    results.readingItems.length > 0;

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command Palette"
      description="Navigate to any topic, project, or reading item"
      className="max-w-lg"
    >
      <CommandInput
        placeholder="Search or jump to…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-96">
        {/* ── Empty state ──────────────────────────────────────────────── */}
        {query.trim() && !hasResults && (
          <CommandEmpty className="py-6 text-sm text-muted-foreground">
            No results for &ldquo;{query}&rdquo;
          </CommandEmpty>
        )}

        {/* ── Quick navigation (always shown when no query) ─────────────── */}
        {!query.trim() && (
          <CommandGroup heading="Quick navigation">
            {QUICK_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.href}
                  value={item.label}
                  onSelect={() => runItem(item.href)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className="font-sans text-sm">{item.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {/* ── Recent pages (shown when no query + have recent) ──────────── */}
        {!query.trim() && recentPages.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent pages">
              {recentPages.map((page) => (
                <CommandItem
                  key={page.slug}
                  value={`recent-${page.slug} ${page.title}`}
                  onSelect={() => runItem(page.href)}
                  className="gap-2"
                >
                  <Clock className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className="font-sans text-sm truncate">{page.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* ── Search results (shown when query is non-empty) ─────────────── */}
        {query.trim() && hasResults && (
          <>
            {results.pages.length > 0 && (
              <CommandGroup heading="Pages">
                {results.pages.map((doc) => (
                  <CommandItem
                    key={doc.id}
                    value={`page-${doc.id} ${doc.title} ${doc.breadcrumb}`}
                    onSelect={() => runItem(doc.href)}
                    className="gap-2"
                  >
                    <KindIcon kind={doc.kind} />
                    <div className="flex-1 min-w-0">
                      <span className="font-sans text-sm truncate block">{doc.title}</span>
                      <span className={cn(
                        "font-sans text-xs text-muted-foreground truncate block"
                      )}>
                        {doc.breadcrumb}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.headings.length > 0 && (
              <>
                {results.pages.length > 0 && <CommandSeparator />}
                <CommandGroup heading="Headings">
                  {results.headings.map((doc) => (
                    <CommandItem
                      key={doc.id}
                      value={`heading-${doc.id} ${doc.title} ${doc.breadcrumb}`}
                      onSelect={() => runItem(doc.href)}
                      className="gap-2"
                    >
                      <KindIcon kind={doc.kind} />
                      <div className="flex-1 min-w-0">
                        <span className="font-sans text-sm truncate block">{doc.title}</span>
                        <span className={cn(
                          "font-sans text-xs text-muted-foreground truncate block"
                        )}>
                          {doc.breadcrumb}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {results.readingItems.length > 0 && (
              <>
                {(results.pages.length > 0 || results.headings.length > 0) && (
                  <CommandSeparator />
                )}
                <CommandGroup heading="Reading Items">
                  {results.readingItems.map((doc) => (
                    <CommandItem
                      key={doc.id}
                      value={`reading-${doc.id} ${doc.title} ${doc.subtitle ?? ""} ${doc.breadcrumb}`}
                      onSelect={() => runItem(doc.href)}
                      className="gap-2"
                    >
                      <KindIcon kind={doc.kind} />
                      <div className="flex-1 min-w-0">
                        <span className="font-sans text-sm truncate block">{doc.title}</span>
                        {doc.subtitle && (
                          <span className={cn(
                            "font-sans text-xs text-muted-foreground truncate block"
                          )}>
                            {doc.subtitle}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {/* "See all results" footer */}
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                value={`see-all-results-${query}`}
                onSelect={() => runItem(`/search?q=${encodeURIComponent(query)}`)}
                className="gap-2 text-muted-foreground"
              >
                <span className="font-sans text-xs">
                  See all results for &ldquo;{query}&rdquo;
                </span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
