/**
 * TopicPage — /notes/:slug
 * Phase 6: Full implementation.
 *
 * Tabbed view: Overview | Reading list | Synthesis | Open questions | Code
 * URL-driven via ?tab=overview|reading|synthesis|questions|code (replace history).
 * Default: overview.
 *
 * Section extraction via lib/html-sections.ts.
 */

import { useParams, useSearchParams, Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { RenderedMarkdown } from "@/components/content/RenderedMarkdown";
import { ReadingList } from "@/components/content/ReadingList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { extractSection, isSectionPlaceholder } from "@/lib/html-sections";
import { formatDate } from "@/lib/format";
import { useTopic } from "@/hooks/useTopic";
import { cn } from "@/lib/utils";
import { FileCode } from "lucide-react";

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabId = "overview" | "reading" | "synthesis" | "questions" | "code";

const TABS: { id: TabId; label: string; h2: string }[] = [
  { id: "overview", label: "Overview", h2: "" },
  { id: "reading", label: "Reading list", h2: "Reading list" },
  { id: "synthesis", label: "Synthesis", h2: "Synthesis (your own words)" },
  { id: "questions", label: "Open questions", h2: "Open questions" },
  { id: "code", label: "Code", h2: "Code / experiments" },
];

// ─── Section renderer ─────────────────────────────────────────────────────────

interface SectionProps {
  html: string | null;
  headingTitle: string;
  slug: string;
  emptyMessage: string;
}

function SectionContent({ html, headingTitle, slug, emptyMessage }: SectionProps) {
  const content = html ? extractSection(html, headingTitle) : null;
  const isEmpty = isSectionPlaceholder(content);

  if (isEmpty) {
    return (
      <div className="py-12 text-center">
        <p className="font-sans text-sm text-muted-foreground mb-3">{emptyMessage}</p>
        <Link
          to={`/notes/${slug}?tab=overview`}
          className="font-sans text-xs text-primary underline underline-offset-2 hover:no-underline"
        >
          Back to overview
        </Link>
      </div>
    );
  }

  return (
    <div
      className="prose mt-4"
      dangerouslySetInnerHTML={{ __html: content ?? "" }}
    />
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse mt-6">
      <div className="h-8 bg-muted rounded w-3/4" />
      <div className="h-4 bg-muted rounded w-full" />
      <div className="h-4 bg-muted rounded w-5/6" />
      <div className="h-4 bg-muted rounded w-4/5" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { entry, html, loading } = useTopic(slug);

  const rawTab = searchParams.get("tab") ?? "overview";
  const activeTab: TabId = TABS.some((t) => t.id === rawTab)
    ? (rawTab as TabId)
    : "overview";

  const handleTabChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", value);
      return next;
    }, { replace: true });
  };

  // VSCode editor link
  const editorLink = entry?.path
    ? `vscode://file/${entry.path.replace(/\\/g, "/")}`
    : null;

  if (!slug) {
    return (
      <PageContainer>
        <p className="font-sans text-sm text-muted-foreground">No topic specified.</p>
      </PageContainer>
    );
  }

  if (!entry && !loading) {
    return (
      <PageContainer>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground mb-4">
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
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground mb-2">
            {entry?.title ?? slug}
          </h1>
          {entry && (
            <p className="font-sans text-xs text-muted-foreground">
              Last modified: {formatDate(entry.lastModified)}
            </p>
          )}
        </div>

        {/* Open in editor */}
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6 w-full flex flex-wrap h-auto gap-0.5">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="font-sans text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview — full rendered markdown */}
        <TabsContent value="overview">
          {loading ? (
            <Skeleton />
          ) : (
            <RenderedMarkdown slug={slug} />
          )}
        </TabsContent>

        {/* Reading list — interactive component */}
        <TabsContent value="reading">
          <h2 className="text-2xl font-semibold tracking-tight leading-snug text-foreground mb-0">
            Reading list
          </h2>
          <ReadingList slug={slug} />
        </TabsContent>

        {/* Synthesis */}
        <TabsContent value="synthesis">
          {loading ? (
            <Skeleton />
          ) : (
            <SectionContent
              html={html}
              headingTitle="Synthesis (your own words)"
              slug={slug}
              emptyMessage="Synthesis hasn't been started yet — open the source markdown to write."
            />
          )}
        </TabsContent>

        {/* Open questions */}
        <TabsContent value="questions">
          {loading ? (
            <Skeleton />
          ) : (
            <SectionContent
              html={html}
              headingTitle="Open questions"
              slug={slug}
              emptyMessage="No open questions recorded yet — open the source markdown to add some."
            />
          )}
        </TabsContent>

        {/* Code / experiments */}
        <TabsContent value="code">
          {loading ? (
            <Skeleton />
          ) : (
            <SectionContent
              html={html}
              headingTitle="Code / experiments"
              slug={slug}
              emptyMessage="No code experiments recorded for this topic yet."
            />
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
