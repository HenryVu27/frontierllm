/**
 * SearchPage — /search?q=...
 *
 * Reads `q` from URL search params.
 * Renders SearchResults with three groups (Pages / Headings / Reading items).
 * If `q` is empty, shows a hint.
 * Updating the search input on this page updates the URL via navigate.
 *
 * SearchInput and useSearch are both keyed on `query` so they remount cleanly
 * when the URL changes (e.g. from CommandMenu "see all results").
 */

import { useSearchParams, useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchResults } from "@/components/search/SearchResults";
import { useSearch } from "@/hooks/useSearch";

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") ?? "";

  // Key on query so useSearch resets when URL changes
  const { results, isLoading } = useSearch(query);

  const handleCommit = (q: string) => {
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`, { replace: true });
    } else {
      navigate("/search", { replace: true });
    }
  };

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-light leading-tight tracking-tight text-foreground mb-1">
          Search
        </h1>
        {query && (
          <p className="font-sans text-sm text-muted-foreground">
            Results for{" "}
            <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
          </p>
        )}
      </div>

      {/* Search input — keyed on URL query so it remounts when query changes externally */}
      <div className="mb-8 max-w-lg">
        <SearchInput
          key={query}
          defaultValue={query}
          onCommit={handleCommit}
        />
      </div>

      {/* Results — keyed on query so useSearch re-initializes correctly */}
      <SearchResults
        query={query}
        results={results}
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
