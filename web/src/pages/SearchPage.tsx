/**
 * SearchPage — /search?q=...
 * Phase 4 stub. Full implementation in Phase 7.
 * TODO Phase 7: MiniSearch index, grouped results (Pages / Headings / Reading items).
 */

import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  return (
    <PageContainer>
      <h1 className="font-serif text-4xl font-light leading-tight tracking-tight text-foreground mb-4">
        Search
      </h1>
      {query && (
        <p className="font-sans text-sm text-muted-foreground mb-4">
          Query:{" "}
          <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
        </p>
      )}
      <p className="font-sans text-sm text-muted-foreground leading-relaxed">
        TODO Phase 7 — MiniSearch results grouped by Pages, Headings, and
        Reading items.
      </p>
    </PageContainer>
  );
}
