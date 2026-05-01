/**
 * AppShell — the top-level layout grid.
 * Structure:
 *   [Left Sidebar (fixed, ≥ md)] + [Main column (Topbar + content)] + [RightSidebar (≥ xl)]
 *
 * Mobile (< md): sidebar hidden; hamburger in Topbar opens a shadcn Sheet.
 * md–xl: sidebar visible, right sidebar hidden.
 * ≥ xl: sidebar + right sidebar both visible.
 *
 * RootLayout wraps AppShell with ScrollRestoration (per React Router 7).
 * It is exported so routes.tsx can use it as the root element without mixing
 * component and non-component exports in routes.tsx (react-refresh lint rule).
 */

import { useState, useEffect, useCallback } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { CommandMenu } from "@/components/search/CommandMenu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUiPrefs } from "@/hooks/useUiPrefs";
import { useRecentPagesTracker } from "@/hooks/useRecentPages";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const { prefs } = useUiPrefs();
  const collapsed = prefs.sidebarCollapsed;
  const location = useLocation();

  // Track recent pages on route change
  useRecentPagesTracker();

  // Global cmd-k / ctrl-k listener
  const openCmdk = useCallback(() => setCmdkOpen(true), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdkOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Global cmd-k palette — mounted at root, open state managed here */}
      <CommandMenu open={cmdkOpen} onOpenChange={setCmdkOpen} />
      {/* Skip to content — visually hidden until focused (a11y spec §17) */}
      <a
        href="#main-content"
        className={[
          "sr-only focus:not-sr-only",
          "focus:fixed focus:top-4 focus:left-4 focus:z-[100]",
          "focus:px-4 focus:py-2 focus:rounded-lg",
          "focus:bg-primary focus:text-primary-foreground",
          "focus:font-sans focus:text-sm focus:font-medium",
          "focus:outline-2 focus:outline-ring focus:outline-offset-2",
        ].join(" ")}
      >
        Skip to content
      </a>

      {/* ── Desktop Sidebar (≥ md) ─────────────────────────────────────── */}
      <div
        className={[
          "hidden md:flex md:flex-col md:shrink-0",
          "sticky top-0 h-screen",
          collapsed ? "w-14" : "w-56",
          "transition-[width] duration-200",
        ].join(" ")}
        aria-hidden="false"
      >
        <Sidebar />
      </div>

      {/* ── Mobile Sheet Sidebar (< md) ────────────────────────────────── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="h-full flex flex-col">
            <Sidebar />
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Main content column ────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Sticky Topbar */}
        <Topbar
          onMenuClick={() => setMobileOpen(true)}
          sidebarCollapsed={collapsed}
          onOpenCmdK={openCmdk}
        />

        {/* Content + Right Sidebar */}
        <div className="flex flex-1 min-h-0">
          {/* Page content with AnimatePresence for route transitions */}
          <AnimatePresence mode="wait" initial={false}>
            <Outlet key={location.pathname} />
          </AnimatePresence>

          {/* Right sidebar — visible ≥ xl */}
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

/**
 * RootLayout — root element for the React Router tree.
 * Adds ScrollRestoration and renders AppShell.
 * Lives here (not in routes.tsx) so the routes file can export only the
 * non-component `router` value, satisfying the react-refresh lint rule.
 */
export function RootLayout() {
  return (
    <>
      {/*
       * ScrollRestoration — scroll to top on navigation.
       * Hash anchors are preserved by default (React Router 7 getKey
       * uses pathname + search, so hash-only changes don't reset scroll).
       */}
      <ScrollRestoration />
      <AppShell />
    </>
  );
}
