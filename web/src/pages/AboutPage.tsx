/**
 * AboutPage — /about
 * Phase 4 stub. Full implementation in Phase 6.
 * TODO Phase 6: render root README, design-spec link, settings panel (theme, reset, export/import).
 */

import { PageContainer } from "@/components/layout/PageContainer";

export function AboutPage() {
  return (
    <PageContainer>
      <h1 className="font-serif text-4xl font-light leading-tight tracking-tight text-foreground mb-4">
        About
      </h1>
      <p className="font-sans text-sm text-muted-foreground leading-relaxed">
        TODO Phase 6 — rendered root README, design-spec link, settings panel
        (theme picker, reset all progress, export / import JSON).
      </p>
    </PageContainer>
  );
}
