/**
 * Sidebar — left navigation per spec §9.
 * Sections: Dashboard, Notes (collapsible group, 7 topics + orientation),
 * Projects (group, 3 projects), Reading List, About.
 *
 * Sidebar collapse state is persisted via useUiPrefs (frontierllm:ui-prefs:v1).
 * Collapsed: icon-only nav with tooltips.
 * Active route: aria-current="page" on the current nav item.
 *
 * Phase 5: progress dots use real topicCompletenessPct data.
 * Three-state dot: opacity-20 (0%), opacity-50 (partial), opacity-100 (100%).
 */

import { useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  FolderKanban,
  List,
  Info,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getTopics, getProjects, getAllEntries } from "@/lib/manifest";
import { getAllChapters } from "@/lib/textbook";
import { useUiPrefs } from "@/hooks/useUiPrefs";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { topicCompletenessPct } from "@/lib/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── Data ─────────────────────────────────────────────────────────────────────

// Load topics + projects at module level (manifest is eagerly available after initManifest)
// We call getTopics() inside the component so it runs after initManifest() in App.tsx.

// ─── Nav item types ───────────────────────────────────────────────────────────

interface NavItemProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  collapsed: boolean;
  /** Tiny progress dot. Undefined = no dot, null = no items (hidden), 0–100 = pct */
  dotPct?: number | null;
  /** Pass end=true for root "/" so it only matches exactly (not all routes) */
  end?: boolean;
}

function NavItem({
  to,
  label,
  icon,
  collapsed,
  dotPct,
  end,
}: NavItemProps) {
  // Three-state dot: no items = hidden, 0% = faint ring, partial = mid, 100% = filled
  const showDot = dotPct !== undefined && dotPct !== null;
  const dotFilled = dotPct === 100;
  const dotPartial = dotPct !== null && dotPct !== undefined && dotPct > 0 && dotPct < 100;

  const link = (
    <NavLink
      to={to}
      {...(end !== undefined ? { end } : {})}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-lg",
          "font-sans text-sm transition-colors duration-150",
          "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1",
          collapsed ? "w-9 h-9 justify-center px-0" : "px-2.5 py-1.5",
          isActive
            ? "bg-accent text-primary font-medium"
            : "text-muted-foreground hover:text-primary hover:bg-accent"
        )
      }
    >
      {icon && (
        <span className="shrink-0 w-4 h-4 flex items-center justify-center">
          {icon}
        </span>
      )}
      {!collapsed && (
        <span className="truncate flex-1">{label}</span>
      )}
      {/* Three-state progress dot */}
      {!collapsed && showDot && (
        <Circle
          className={cn(
            "w-2 h-2 shrink-0 transition-all duration-150",
            dotFilled
              ? "fill-ring text-ring"
              : dotPartial
              ? "fill-ring/40 text-ring/40"
              : "fill-border/30 text-border"
          )}
          aria-hidden="true"
        />
      )}
    </NavLink>
  );

  // Tooltip only renders when the sidebar is icon-only — wrapping NavLink in
  // Radix's Slot (via TooltipTrigger asChild) breaks NavLink's function-form
  // className when expanded, so we skip the wrapper entirely in that case.
  if (!collapsed) return link;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="font-sans text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ─── Collapsible group ────────────────────────────────────────────────────────

interface NavGroupProps {
  label: string;
  icon: React.ReactNode;
  collapsed: boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function NavGroup({
  label,
  icon,
  collapsed,
  children,
  defaultOpen = true,
}: NavGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (collapsed) {
    // When sidebar is icon-only, just show the group icon as a section divider
    return (
      <div className="flex flex-col items-center gap-0.5 py-1">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="w-9 h-9 flex items-center justify-center text-muted-foreground"
                aria-hidden="true"
              >
                {icon}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-sans text-xs">
              {label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {children}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2.5 w-full rounded-lg",
          "px-2.5 py-1.5",
          "font-sans text-xs font-semibold uppercase tracking-widest",
          "text-muted-foreground hover:text-foreground",
          "transition-colors duration-150",
          "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1"
        )}
        aria-expanded={open}
      >
        <span className="shrink-0 w-4 h-4 flex items-center justify-center">
          {icon}
        </span>
        <span className="flex-1 text-left">{label}</span>
        {open ? (
          <ChevronDown className="w-3 h-3 shrink-0" aria-hidden="true" />
        ) : (
          <ChevronRight className="w-3 h-3 shrink-0" aria-hidden="true" />
        )}
      </button>
      {open && (
        <div className="mt-0.5 ml-3 pl-3 border-l border-border flex flex-col gap-0.5">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Main Sidebar component ───────────────────────────────────────────────────

export function Sidebar() {
  const { prefs, setPref } = useUiPrefs();
  const collapsed = prefs.sidebarCollapsed;
  const location = useLocation();
  const { progress } = useReadingProgress();

  // Load manifest data (safe after initManifest() in App.tsx)
  const topics = getTopics();
  const projects = getProjects();
  const chapters = useMemo(() => getAllChapters(), []);

  // Build a minimal manifest shape for progress derivation
  const manifest = useMemo(() => ({ generatedAt: "", entries: getAllEntries() }), []);

  // Separate the 7 topic entries from the orientation entry
  const topicEntries = topics.filter((t) => t.kind === "topic");
  const orientationEntry = topics.find((t) => t.kind === "orientation");

  const toggleCollapse = () => setPref("sidebarCollapsed", !collapsed);

  // Determine if any notes/project/textbook/reading routes are active (for group defaultOpen)
  const notesActive = location.pathname.startsWith("/notes");
  const projectsActive = location.pathname.startsWith("/projects");
  const textbookActive = location.pathname.startsWith("/textbook");
  const readingActive = location.pathname.startsWith("/reading");

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "flex flex-col h-full",
        "bg-sidebar border-r border-sidebar-border",
        "transition-[width] duration-200",
        collapsed ? "w-14" : "w-56"
      )}
    >
      {/* Logo / wordmark */}
      <div
        className={cn(
          "flex items-center h-14 shrink-0 border-b border-sidebar-border",
          collapsed ? "justify-center px-0" : "px-4 gap-2"
        )}
      >
        {collapsed ? (
          <span
            className="text-lg font-semibold tracking-tight text-foreground"
            aria-label="frontierllm"
          >
            F
          </span>
        ) : (
          <span className="text-base font-semibold text-foreground tracking-tight">
            frontierllm
          </span>
        )}
      </div>

      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 flex flex-col gap-1">
        {/* Dashboard — end=true so it only shows active on exactly "/" */}
        <NavItem
          to="/"
          label="Dashboard"
          icon={<LayoutDashboard className="w-4 h-4" />}
          collapsed={collapsed}
          end={true}
        />

        {/* Textbook group */}
        <div className="mt-2">
          <NavGroup
            label="Textbook"
            icon={<GraduationCap className="w-4 h-4" />}
            collapsed={collapsed}
            defaultOpen={textbookActive}
          >
            <NavItem
              to="/textbook"
              label="All Chapters"
              collapsed={collapsed}
            />

            {chapters.map((chapter) => (
              <NavItem
                key={chapter.slug}
                to={`/textbook/${chapter.slug}`}
                label={chapter.title}
                collapsed={collapsed}
              />
            ))}
          </NavGroup>
        </div>

        {/* Notes group */}
        <div className="mt-2">
          <NavGroup
            label="Notes"
            icon={<BookOpen className="w-4 h-4" />}
            collapsed={collapsed}
            defaultOpen={notesActive}
          >
            {/* Notes index */}
            <NavItem
              to="/notes"
              label="All Notes"
              collapsed={collapsed}
            />

            {/* 7 topic entries */}
            {topicEntries.map((topic) => (
              <NavItem
                key={topic.slug}
                to={`/notes/${topic.slug}`}
                label={topic.title}
                collapsed={collapsed}
                dotPct={topicCompletenessPct(topic.slug, manifest, progress)}
              />
            ))}

            {/* Orientation — special entry under 07-frontier-labs */}
            {orientationEntry && (
              <NavItem
                to="/notes/07-frontier-labs/orientation"
                label="↳ Orientation"
                collapsed={collapsed}
                dotPct={topicCompletenessPct(orientationEntry.slug, manifest, progress)}
              />
            )}
          </NavGroup>
        </div>

        {/* Projects group */}
        <div className="mt-2">
          <NavGroup
            label="Projects"
            icon={<FolderKanban className="w-4 h-4" />}
            collapsed={collapsed}
            defaultOpen={projectsActive}
          >
            {/* Projects index */}
            <NavItem
              to="/projects"
              label="All Projects"
              collapsed={collapsed}
            />

            {projects.map((project) => (
              <NavItem
                key={project.slug}
                to={`/projects/${project.slug}`}
                label={project.title}
                collapsed={collapsed}
              />
            ))}
          </NavGroup>
        </div>

        {/* Reading List group */}
        <div className="mt-2">
          <NavGroup
            label="Reading List"
            icon={<List className="w-4 h-4" />}
            collapsed={collapsed}
            defaultOpen={readingActive}
          >
            <NavItem
              to="/reading"
              label="All Items"
              collapsed={collapsed}
            />
            <NavItem
              to="/reading?status=unread"
              label="Unread"
              collapsed={collapsed}
            />
            <NavItem
              to="/reading?status=read"
              label="Read"
              collapsed={collapsed}
            />
          </NavGroup>
        </div>

        {/* About */}
        <NavItem
          to="/about"
          label="About"
          icon={<Info className="w-4 h-4" />}
          collapsed={collapsed}
        />
      </div>

      {/* Collapse toggle button at bottom */}
      <div
        className={cn(
          "shrink-0 border-t border-sidebar-border px-2 py-3",
          "flex",
          collapsed ? "justify-center" : "justify-end"
        )}
      >
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleCollapse}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className={cn(
                  "flex items-center justify-center",
                  "w-8 h-8 rounded-lg",
                  "text-muted-foreground hover:text-foreground hover:bg-accent",
                  "transition-colors duration-150",
                  "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-1"
                )}
              >
                {collapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-sans text-xs">
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </nav>
  );
}
