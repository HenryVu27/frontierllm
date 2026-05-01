/**
 * ReadingListPage — /reading
 * Phase 4 stub. Full implementation in Phase 6.
 * TODO Phase 6: flat, sortable, filterable reading list across all topics.
 */

import { PageContainer } from "@/components/layout/PageContainer";

export function ReadingListPage() {
  return (
    <PageContainer>
      <h1 className="font-serif text-4xl font-light leading-tight tracking-tight text-foreground mb-4">
        Reading List
      </h1>
      <p className="font-sans text-sm text-muted-foreground leading-relaxed">
        TODO Phase 6 — flat, filterable reading list across all topics with
        status filters (all / unread / read) and topic grouping.
      </p>
    </PageContainer>
  );
}
