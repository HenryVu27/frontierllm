/**
 * OrientationPage — /notes/07-frontier-labs/orientation
 * Phase 4 stub. Full implementation in Phase 6.
 * Special route — must take precedence over /notes/:slug.
 * TODO Phase 6: orientation banner, 6-report checklist, comparative table, personal map.
 */

import { PageContainer } from "@/components/layout/PageContainer";
import { getEntry } from "@/lib/manifest";

export function OrientationPage() {
  const entry = getEntry("07-frontier-labs-orientation");

  return (
    <PageContainer>
      {/* Orientation banner — Phase 6 renders full banner */}
      <div className="border border-border rounded-lg p-4 bg-accent/30 mb-6">
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          First active activity
        </p>
        <p className="font-serif text-base text-foreground leading-relaxed">
          Read 6 recent frontier-model technical reports and produce a
          comparative write-up.
        </p>
      </div>

      <h1 className="font-serif text-4xl font-light leading-tight tracking-tight text-foreground mb-2">
        {entry?.title ?? "Orientation Pass"}
      </h1>
      <p className="font-mono text-xs text-muted-foreground mb-4">
        /notes/07-frontier-labs/orientation
      </p>
      <p className="font-sans text-sm text-muted-foreground leading-relaxed">
        TODO Phase 6 — orientation-specific banner, 6-report checklist,
        comparative table, personal map.
      </p>
    </PageContainer>
  );
}
