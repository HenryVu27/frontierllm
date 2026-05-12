/**
 * AboutPage — /about
 * Phase 6: Full implementation.
 *
 * - Renders root README via RenderedMarkdown slug="root".
 * - Design specs links section.
 * - Settings panel: theme picker (ThemeToggle), reset all, export, import.
 */

import { useRef } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { RenderedMarkdown } from "@/components/content/RenderedMarkdown";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Download, Upload, RotateCcw } from "lucide-react";

// ─── Settings panel ───────────────────────────────────────────────────────────

function SettingsPanel() {
  const { clearAll, exportProgress, importProgress } = useReadingProgress();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportProgress();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "frontierllm-progress.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Progress exported");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = ev.target?.result as string;
      const ok = importProgress(json);
      if (ok) {
        toast.success("Progress imported successfully");
      } else {
        toast.error("Failed to import — invalid format");
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleResetAll = () => {
    clearAll();
    toast.success("All progress has been reset");
  };

  return (
    <div className="border border-border rounded-lg p-5 space-y-5 mt-12">
      <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Settings
      </h2>

      {/* Theme */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-sans text-sm text-foreground font-medium">Color theme</p>
          <p className="font-sans text-xs text-muted-foreground">
            Choose light, dark, or system preference.
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Export / Import */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-sans text-sm text-foreground font-medium">Progress data</p>
          <p className="font-sans text-xs text-muted-foreground">
            Export or import reading progress as JSON.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 font-sans text-xs gap-1.5"
            onClick={handleExport}
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 font-sans text-xs gap-1.5"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            aria-label="Import progress JSON file"
            className="sr-only"
            onChange={handleImport}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Reset */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-sans text-sm text-foreground font-medium">Reset all progress</p>
          <p className="font-sans text-xs text-muted-foreground">
            Clears all reading list checkboxes. Cannot be undone (unless you exported first).
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 font-sans text-xs gap-1.5",
                "text-destructive border-destructive/30 hover:bg-destructive/10"
              )}
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset all
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset all reading progress?</DialogTitle>
              <DialogDescription>
                This will mark every reading-list item across all topics as unread.
                Your localStorage will be cleared. Export first if you want to keep a backup.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton>
              <Button
                variant="destructive"
                onClick={handleResetAll}
                className="font-sans text-sm"
              >
                Yes, reset everything
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// ─── Design specs section ─────────────────────────────────────────────────────

function DesignSpecsSection() {
  return (
    <div className="border border-border rounded-lg p-5 mt-8">
      <h2 className="font-sans text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
        Design specs
      </h2>
      <ul className="space-y-2">
        <li>
          <a
            href="/docs/superpowers/specs/2026-04-25-frontierllm-design.md"
            className={cn(
              "font-sans text-sm text-primary underline underline-offset-2",
              "hover:no-underline transition-colors duration-150"
            )}
          >
            2026-04-25 — frontierllm design spec (original)
          </a>
          <p className="font-sans text-xs text-muted-foreground mt-0.5">
            Original repo design: purpose, content structure, learning strategy.
          </p>
        </li>
        <li>
          <a
            href="/docs/superpowers/specs/2026-04-26-web-ui-design.md"
            className={cn(
              "font-sans text-sm text-primary underline underline-offset-2",
              "hover:no-underline transition-colors duration-150"
            )}
          >
            2026-04-26 — web UI design spec
          </a>
          <p className="font-sans text-xs text-muted-foreground mt-0.5">
            Full specification for this web interface: IA, components, design system, and pipeline.
          </p>
        </li>
      </ul>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function AboutPage() {
  return (
    <PageContainer>
      <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground mb-6">
        About
      </h1>

      {/* Root README content */}
      <RenderedMarkdown slug="root" />

      {/* Design specs links */}
      <DesignSpecsSection />

      {/* Settings panel */}
      <SettingsPanel />
    </PageContainer>
  );
}
