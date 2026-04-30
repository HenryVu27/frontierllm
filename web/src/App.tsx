/**
 * TEMPORARY — Phase 3 debug page.
 * Lists every manifest entry with slug, title, and reading-list count.
 * This entire file is replaced in Phase 4 with AppShell + routing.
 */

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { initManifest, getAllEntries } from "@/lib/manifest";
import type { ManifestEntry } from "@/lib/manifest";

// Import the generated manifest — produced at build time by build-content.ts
// Using a static import so Vite can tree-shake and type-check.
// The generated/ folder is gitignored; it is created by the content plugin.
import manifestData from "@/generated/manifest.json";

// Initialise the manifest module with the JSON data at module load time.
// This is safe because manifest.json is a static build artifact (not async).
initManifest(manifestData as Record<string, unknown>);

// Load entries at module level — the manifest is already initialised above.
const entries = getAllEntries();

function App() {
  const totalReadingItems = entries.reduce(
    (sum, e) => sum + e.readingList.length,
    0
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-serif">
      {/* Topbar stub */}
      <header className="border-b border-border px-8 py-3 flex items-center justify-between">
        <span className="font-sans text-sm text-muted-foreground tracking-wide uppercase">
          frontierllm
        </span>
        <ThemeToggle />
      </header>

      {/* Debug content */}
      <main className="max-w-[800px] mx-auto px-8 py-12">
        <h1 className="font-serif text-4xl font-light tracking-tight text-foreground mb-2">
          Phase 3 — Content Pipeline Debug
        </h1>
        <p className="font-sans text-sm text-muted-foreground mb-8">
          {entries.length} manifest entries · {totalReadingItems} total reading-list items
        </p>

        <div className="space-y-2">
          {entries.map((entry) => (
            <ManifestRow key={entry.slug} entry={entry} />
          ))}
        </div>

        {entries.length === 0 && (
          <p className="font-sans text-sm text-muted-foreground italic">
            No manifest entries found. Run{" "}
            <code className="bg-muted px-1 rounded font-mono text-[0.82em]">
              npm run build
            </code>{" "}
            or{" "}
            <code className="bg-muted px-1 rounded font-mono text-[0.82em]">
              npm run dev
            </code>{" "}
            to generate the manifest.
          </p>
        )}
      </main>
    </div>
  );
}

interface ManifestRowProps {
  entry: ManifestEntry;
}

function ManifestRow({ entry }: ManifestRowProps) {
  const kindColors: Record<ManifestEntry["kind"], string> = {
    topic: "bg-manuscript-blue/10 text-manuscript-blue",
    project: "bg-primary/10 text-primary",
    orientation: "bg-gold/20 text-foreground",
    root: "bg-muted text-muted-foreground",
  };

  return (
    <div className="border border-border rounded-lg px-4 py-3 flex items-start gap-4 hover:bg-accent transition-colors duration-150">
      {/* Kind badge */}
      <span
        className={`font-sans text-xs px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${kindColors[entry.kind]}`}
      >
        {entry.kind}
      </span>

      {/* Slug + title */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs text-muted-foreground mb-0.5">
          {entry.slug}
        </p>
        <p className="font-serif text-base text-foreground leading-snug">
          {entry.title}
        </p>
      </div>

      {/* Reading list count */}
      <div className="shrink-0 text-right">
        <p className="font-sans text-sm font-medium text-foreground">
          {entry.readingList.length}
        </p>
        <p className="font-sans text-xs text-muted-foreground">items</p>
      </div>

      {/* Synthesis status */}
      <div className="shrink-0">
        <span
          className={`font-sans text-xs px-1.5 py-0.5 rounded ${
            entry.synthesisStatus === "started"
              ? "bg-success/15 text-success"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {entry.synthesisStatus}
        </span>
      </div>

      {/* Word count */}
      <div className="shrink-0 text-right hidden sm:block">
        <p className="font-sans text-xs text-muted-foreground">
          {entry.wordCount.toLocaleString()} words
        </p>
      </div>
    </div>
  );
}

export default App;
