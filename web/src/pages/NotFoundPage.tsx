/**
 * NotFoundPage — * (catch-all 404)
 * Phase 6: Updated with search input.
 */

import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { cn } from "@/lib/utils";

export function NotFoundPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputRef.current?.value.trim() ?? "";
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <PageContainer>
      <div className="py-16 text-center">
        <p className="font-sans text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4">
          404
        </p>
        <h1 className="font-serif text-4xl font-light leading-tight tracking-tight text-foreground mb-4">
          Page not found
        </h1>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-8">
          The route you requested doesn&apos;t exist. Search below or navigate back to the dashboard.
        </p>

        {/* Search form */}
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 max-w-sm mx-auto mb-8"
        >
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="search"
              placeholder="Search notes, projects, papers..."
              aria-label="Search"
              className={cn(
                "w-full pl-9 pr-4 py-2 rounded-lg",
                "font-sans text-sm text-foreground placeholder:text-muted-foreground",
                "border border-border bg-background",
                "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1",
                "transition-colors duration-150"
              )}
            />
          </div>
          <button
            type="submit"
            className={cn(
              "px-4 py-2 rounded-lg",
              "font-sans text-sm font-medium",
              "bg-primary text-primary-foreground",
              "hover:opacity-90 active:scale-[0.98]",
              "transition-all duration-150",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1"
            )}
          >
            Search
          </button>
        </form>

        <div className="flex items-center justify-center gap-4">
          <Link
            to="/"
            className={cn(
              "inline-flex items-center px-4 py-2 rounded-lg",
              "font-sans text-sm font-medium",
              "border border-border",
              "text-foreground hover:text-primary hover:bg-accent",
              "transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            )}
          >
            Go to Dashboard
          </Link>
          <Link
            to="/notes"
            className={cn(
              "inline-flex items-center px-4 py-2 rounded-lg",
              "font-sans text-sm font-medium",
              "text-muted-foreground hover:text-primary hover:bg-accent",
              "transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            )}
          >
            Browse Notes
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
