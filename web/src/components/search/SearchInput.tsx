/**
 * SearchInput — debounced search input used in Topbar and SearchPage.
 *
 * On ≥ md viewports (Topbar): renders a compact pill input.
 * On < md: collapses to an icon button that opens cmd-k.
 * Pressing Enter navigates to /search?q=...
 * Pressing Escape clears focus.
 * Cmd/Ctrl-K opens the CommandMenu (global).
 *
 * Props:
 *   defaultValue  — pre-filled value (for SearchPage)
 *   onCommit      — called with the query string on Enter (for SearchPage URL update)
 *   onOpenCmdK    — called when cmd-k is pressed or icon button clicked
 *   compact       — if true, render the compact topbar pill variant
 */

import { useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  defaultValue?: string;
  onCommit?: (query: string) => void;
  onOpenCmdK?: () => void;
  compact?: boolean;
  className?: string;
}

function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPod|iPad/.test(navigator.userAgent);
}

export function SearchInput({
  defaultValue = "",
  onCommit,
  onOpenCmdK,
  compact = false,
  className,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [value, setValue] = useState(defaultValue);
  const mac = isMac();
  const kbdHint = mac ? "⌘K" : "Ctrl K";

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const q = value.trim();
        if (onCommit) {
          onCommit(q);
        } else if (q) {
          navigate(`/search?q=${encodeURIComponent(q)}`);
        }
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
      }
      // Cmd/Ctrl-K inside input → open cmd palette
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenCmdK?.();
      }
    },
    [value, navigate, onCommit, onOpenCmdK]
  );

  if (compact) {
    return (
      <>
        {/* Desktop (≥ md): compact pill */}
        <div className={cn("hidden md:flex flex-1 max-w-xs", className)}>
          <div className="relative w-full">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="search"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              aria-label="Search"
              className={cn(
                "w-full pl-8 pr-10 h-8 rounded-lg",
                "font-sans text-xs text-foreground placeholder:text-muted-foreground",
                "border border-border bg-muted/50",
                "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1",
                "transition-colors duration-150"
              )}
            />
            <kbd
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2",
                "hidden sm:inline-flex items-center",
                "px-1 py-0.5 rounded",
                "font-mono text-[10px] text-muted-foreground",
                "border border-border bg-background",
                "pointer-events-none select-none"
              )}
            >
              {kbdHint}
            </kbd>
          </div>
        </div>

        {/* Mobile (< md): icon button that opens cmd-k */}
        <button
          type="button"
          onClick={onOpenCmdK}
          aria-label="Search (open command palette)"
          className={cn(
            "md:hidden flex items-center justify-center",
            "w-9 h-9 rounded-lg",
            "text-muted-foreground hover:text-foreground hover:bg-accent",
            "transition-colors duration-150",
            "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1",
            className
          )}
        >
          <Search className="w-4 h-4" />
        </button>
      </>
    );
  }

  // Full-width variant (SearchPage)
  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search notes, projects, papers..."
        aria-label="Search"
        className={cn(
          "w-full pl-10 pr-4 py-2.5 rounded-lg",
          "font-sans text-sm text-foreground placeholder:text-muted-foreground",
          "border border-border bg-background",
          "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1",
          "transition-colors duration-150"
        )}
        autoFocus
      />
    </div>
  );
}
