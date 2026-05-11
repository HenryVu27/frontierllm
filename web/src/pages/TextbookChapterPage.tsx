import { useParams, Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { MdxComponentsProvider } from "@/components/mdx/MdxComponents";
import { getChapter, getAdjacentChapters } from "@/lib/textbook";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function TextbookChapterPage() {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) {
    return (
      <PageContainer>
        <p className="text-sm text-muted-foreground">No chapter specified.</p>
      </PageContainer>
    );
  }

  const chapter = getChapter(slug);
  if (!chapter) {
    return (
      <PageContainer>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground mb-3 leading-tight">
          Chapter not found
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          No chapter found for{" "}
          <code className="font-mono text-xs bg-subtle px-1 py-0.5 rounded-sm">
            {slug}
          </code>
          .
        </p>
        <Link
          to="/textbook"
          className="text-sm text-foreground underline decoration-border underline-offset-[3px] hover:text-primary hover:decoration-primary"
        >
          Back to Textbook
        </Link>
      </PageContainer>
    );
  }

  const { Component } = chapter;
  const { prev, next } = getAdjacentChapters(slug);

  return (
    <PageContainer>
      <header className="mb-8">
        <span className="text-2xs font-semibold tracking-wider uppercase text-muted-foreground mb-2 inline-block">
          {chapter.chapter !== undefined
            ? `Chapter ${chapter.chapter}`
            : "Textbook"}
          {" · "}Prerequisites
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground leading-tight text-balance">
          {chapter.title}
        </h1>
        <p className="text-2xs text-muted-foreground mt-3 tabular-nums">
          {chapter.reading_minutes} min · Last reviewed {chapter.last_reviewed}
        </p>
      </header>

      <article className="prose max-w-none">
        <MdxComponentsProvider>
          <Component />
        </MdxComponentsProvider>
      </article>

      <nav
        aria-label="Chapter navigation"
        className="mt-16 pt-6 border-t border-border flex items-center justify-between gap-4"
      >
        {prev ? (
          <Link
            to={`/textbook/${prev.slug}`}
            className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
            <span className="flex flex-col">
              <span className="text-2xs uppercase tracking-wider">Previous</span>
              <span className="font-medium">{prev.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/textbook/${next.slug}`}
            className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-right"
          >
            <span className="flex flex-col">
              <span className="text-2xs uppercase tracking-wider">Next</span>
              <span className="font-medium">{next.title}</span>
            </span>
            <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </PageContainer>
  );
}
