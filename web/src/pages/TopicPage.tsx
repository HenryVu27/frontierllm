/**
 * TopicPage — /notes/:slug
 * Phase 4 stub. Full implementation in Phase 6.
 * Displays the slug from params to verify routing.
 * TODO Phase 6: RenderedMarkdown, reading list tabs, TOC, synthesis sections.
 */

import { useParams } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { getEntry } from "@/lib/manifest";

export function TopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const entry = slug ? getEntry(slug) : undefined;

  return (
    <PageContainer>
      <h1 className="font-serif text-4xl font-light leading-tight tracking-tight text-foreground mb-2">
        {entry?.title ?? slug ?? "Topic"}
      </h1>
      <p className="font-mono text-xs text-muted-foreground mb-4">
        /notes/{slug}
      </p>
      <p className="font-sans text-sm text-muted-foreground leading-relaxed">
        TODO Phase 6 — RenderedMarkdown, reading list, synthesis tabs.
      </p>
    </PageContainer>
  );
}
