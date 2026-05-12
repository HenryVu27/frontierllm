/**
 * ProjectPage — /projects/:slug
 * Phase 6: Full implementation.
 * - Breadcrumb + title + status pill + "Open in editor" link.
 * - RenderedMarkdown for full project README.
 * - RightSidebar TOC (auto via Phase 5).
 */

import { useParams, Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { RenderedMarkdown } from "@/components/content/RenderedMarkdown";
import { getEntry } from "@/lib/manifest";
import { formatDate } from "@/lib/format";
import { FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const entry = slug ? getEntry(slug) : undefined;

  const editorLink = entry?.path
    ? `vscode://file/${entry.path.replace(/\\/g, "/")}`
    : null;

  if (!slug) {
    return (
      <PageContainer>
        <p className="font-sans text-sm text-muted-foreground">No project specified.</p>
      </PageContainer>
    );
  }

  if (!entry) {
    return (
      <PageContainer>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground mb-4">
          Project not found
        </h1>
        <p className="font-sans text-sm text-muted-foreground mb-4">
          No content found for <code className="font-mono text-xs">{slug}</code>.
        </p>
        <Link to="/projects" className="font-sans text-sm text-primary underline underline-offset-2">
          Back to Projects
        </Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-sans text-xs font-medium border bg-muted text-muted-foreground border-border">
              Scoped — not started
            </span>
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground mb-1">
            {entry.title}
          </h1>
          <p className="font-sans text-xs text-muted-foreground">
            Last modified: {formatDate(entry.lastModified)}
          </p>
        </div>

        {editorLink && (
          <a
            href={editorLink}
            title="Open in VS Code"
            aria-label="Open source file in VS Code"
            className={cn(
              "flex items-center gap-1.5 shrink-0 mt-1",
              "font-sans text-xs text-muted-foreground",
              "hover:text-primary transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1"
            )}
          >
            <FileCode className="w-3.5 h-3.5" aria-hidden="true" />
            Open in editor
          </a>
        )}
      </div>

      {/* Full project README */}
      <RenderedMarkdown slug={slug} />
    </PageContainer>
  );
}
