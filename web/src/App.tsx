/**
 * TEMPORARY — Phase 2 smoke-test preview page.
 * This entire file is replaced in Phase 4 with AppShell + routing.
 * Its only purpose is to verify design tokens, fonts, and theme toggle work.
 */

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";

function App() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground font-serif">
      {/* Topbar stub */}
      <header className="border-b border-border px-8 py-3 flex items-center justify-between">
        <span className="font-sans text-sm text-muted-foreground tracking-wide uppercase">
          frontierllm
        </span>
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="max-w-[660px] mx-auto px-8 py-16">
        {/* Title */}
        <h1 className="font-serif text-4xl font-light tracking-tight text-foreground mb-2">
          frontierllm
        </h1>
        <p className="font-sans text-sm text-muted-foreground mb-12">
          Design system preview — {resolvedTheme} mode
        </p>

        {/* Typography specimen */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-medium text-foreground mb-4">
            Typography
          </h2>
          <p className="font-serif text-[19px] leading-relaxed text-foreground mb-4">
            A learning repository for frontier-scale language models. The aesthetic
            to target is <em>editorial, technical, warm</em> — closer to a
            well-typeset research journal than a product page.
          </p>
          <p className="font-serif text-[19px] leading-relaxed text-foreground">
            Long-form readability is the primary pleasure metric. Serif body text
            at a generous size; wide measure kept narrow (600–720px prose column).
            Warmth over sterility — the palette is parchment-warm, not cool gray.
          </p>
        </section>

        {/* Color tokens specimen */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-medium text-foreground mb-4">
            Color tokens
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <ColorSwatch label="background" className="bg-background border border-border" />
            <ColorSwatch label="card" className="bg-card border border-border" />
            <ColorSwatch label="muted" className="bg-muted" />
            <ColorSwatch label="accent" className="bg-accent" />
            <ColorSwatch label="primary (vermillion)" className="bg-primary" textClass="text-primary-foreground" />
            <ColorSwatch label="ring (manuscript blue)" className="bg-ring" textClass="text-primary-foreground" />
            <ColorSwatch label="destructive" className="bg-destructive" textClass="text-white" />
            <ColorSwatch label="gold" className="bg-gold" textClass="text-foreground" />
          </div>
        </section>

        {/* Interactive elements specimen */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-medium text-foreground mb-4">
            Interactive elements
          </h2>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              type="button"
              className="bg-primary text-primary-foreground font-sans text-sm px-4 py-2 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all duration-150"
            >
              Primary button
            </button>
            <button
              type="button"
              className="border border-border text-foreground font-sans text-sm px-4 py-2 rounded-lg hover:bg-accent active:scale-[0.98] transition-all duration-150"
            >
              Ghost button
            </button>
            <button
              type="button"
              className="bg-muted text-muted-foreground font-sans text-sm px-4 py-2 rounded-lg hover:bg-accent hover:text-foreground active:scale-[0.98] transition-all duration-150"
            >
              Muted button
            </button>
          </div>

          {/* Input */}
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full font-sans text-sm bg-background text-foreground border border-input rounded-lg px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 transition-colors duration-150"
          />
        </section>

        {/* Code specimen */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-medium text-foreground mb-4">
            Code
          </h2>
          <p className="font-serif text-[19px] leading-relaxed text-foreground mb-3">
            Inline code uses <code className="bg-muted px-1 py-0 rounded font-mono text-[0.82em]">font-mono</code> at
            82% body size with warm muted background. No border, just warmth.
          </p>
          <div className="code-block">
            <div className="code-header">
              <span>storage.ts</span>
            </div>
            <pre className="bg-muted p-4 overflow-x-auto font-mono text-sm leading-relaxed">
              <code>{`export function storageGet<T>(key: StorageKey, entry: StorageEntry<T>): T {
  const raw = localStorage.getItem(key);
  if (raw === null) return entry.defaultValue;
  return entry.schema.parse(JSON.parse(raw));
}`}</code>
            </pre>
          </div>
        </section>

        {/* Card specimen */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-medium text-foreground mb-4">
            Cards
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-lg p-6 hover:bg-accent transition-colors duration-200">
              <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide mb-1">01 — Pretraining</p>
              <h3 className="font-serif text-xl font-medium text-foreground mb-2">Pretraining</h3>
              <p className="font-sans text-sm text-muted-foreground">
                Data, tokenization, architectures, scaling laws.
              </p>
              <div className="mt-4 h-1 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-manuscript-blue rounded-full w-[35%]" />
              </div>
              <p className="font-sans text-xs text-muted-foreground mt-1">6 / 17 read</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 hover:bg-accent transition-colors duration-200">
              <p className="font-sans text-xs text-muted-foreground uppercase tracking-wide mb-1">02 — Post-training</p>
              <h3 className="font-serif text-xl font-medium text-foreground mb-2">Post-training</h3>
              <p className="font-sans text-sm text-muted-foreground">
                SFT, RLHF, DPO, instruction following.
              </p>
              <div className="mt-4 h-1 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-[12%]" />
              </div>
              <p className="font-sans text-xs text-muted-foreground mt-1">2 / 14 read</p>
            </div>
          </div>
        </section>

        {/* Blockquote specimen */}
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-medium text-foreground mb-4">
            Blockquote
          </h2>
          <blockquote className="border-l-[3px] border-border pl-4 text-muted-foreground italic font-serif text-[19px] leading-relaxed">
            "Long-form readability is the primary pleasure metric. Serif body text
            at a generous size; wide measure kept narrow — 600 to 720 pixels."
          </blockquote>
        </section>
      </main>
    </div>
  );
}

interface ColorSwatchProps {
  label: string;
  className: string;
  textClass?: string;
}

function ColorSwatch({ label, className, textClass = "text-foreground" }: ColorSwatchProps) {
  return (
    <div className={`rounded-lg p-3 ${className}`}>
      <span className={`font-mono text-xs ${textClass}`}>{label}</span>
    </div>
  );
}

export default App;
