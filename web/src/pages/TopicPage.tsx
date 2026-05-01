/**
 * TopicPage — /notes/:slug
 *
 * PHASE 5 SMOKE: replace in Phase 6
 * Renders RenderedMarkdown to verify the full content pipeline end-to-end.
 * Phase 6 will replace this with the proper tabbed page wrapper.
 */

import { useParams, Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { getEntry } from "@/lib/manifest";
import { RenderedMarkdown } from "@/components/content/RenderedMarkdown";

export function TopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const entry = slug ? getEntry(slug) : undefined;

  if (!slug) {
    return (
      <PageContainer>
        <p className="font-sans text-sm text-muted-foreground">No topic specified.</p>
      </PageContainer>
    );
  }

  if (!entry) {
    return (
      <PageContainer>
        <h1 className="font-serif text-4xl font-light leading-tight tracking-tight text-foreground mb-4">
          Topic not found
        </h1>
        <p className="font-sans text-sm text-muted-foreground mb-4">
          No content found for <code className="font-mono text-xs">{slug}</code>.
        </p>
        <Link to="/notes" className="font-sans text-sm text-primary underline underline-offset-2">
          Back to Notes
        </Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <RenderedMarkdown slug={slug} />
    </PageContainer>
  );
}
