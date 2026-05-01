/**
 * RightSidebar — per-page TOC slot. Visible ≥ xl only.
 * Phase 4: renders a placeholder "On this page" header with an empty list.
 * Phase 5 wires real TOC data from the manifest + scroll-spy.
 */

// TODO Phase 5: accept `headings: Heading[]` prop and render live TOC
// TODO Phase 5: add useScrollSpy hook to highlight active heading

export function RightSidebar() {
  return (
    <aside
      aria-label="On this page"
      className={[
        // Visible only at xl+; hidden below that breakpoint
        "hidden xl:block",
        "w-56 shrink-0",
        "sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto",
        "py-10 pr-4",
      ].join(" ")}
    >
      <p className="font-sans text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
        On this page
      </p>
      {/* TODO Phase 5: replace with <Toc headings={headings} /> */}
      <ul className="space-y-1" aria-label="Table of contents placeholder">
        <li className="font-sans text-sm text-muted-foreground italic">
          — wired in Phase 5 —
        </li>
      </ul>
    </aside>
  );
}
