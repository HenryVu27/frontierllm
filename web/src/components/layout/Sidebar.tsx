/**
 * Sidebar — left navigation per spec §9.
 * Sections: Dashboard, Notes (collapsible group, 7 topics + orientation),
 * Projects (group, 3 projects), Reading List, About.
 *
 * Sidebar collapse state is persisted via useUiPrefs (frontierllm:ui-prefs:v1).
 * Collapsed: icon-only nav with tooltips.
 * Active route: aria-current="page" on the current nav item.
 *
 * TODO Phase 5: replace empty progress dots with real per-topic progress
 */

import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
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
import { getTopics, getProjects } from "@/lib/manifest";
import { useUiPrefs } from "@/hooks/useUiPrefs";
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
  /** Tiny progress dot — Phase 5 wires real data */
  showDot?: boolean;
  dotFilled?: boolean;
}

function NavItem({
  to,
  label,
  icon,
  collapsed,
  showDot = false,
  dotFilled = false,
}: NavItemProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            to={to}
            aria-current={undefined} // react-router NavLink adds aria-current="page" automatically
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
            {/* Progress dot — Phase 5 wires real data */}
            {!collapsed && showDot && (
              <Circle
                className={cn(
                  "w-2 h-2 shrink-0",
                  dotFilled
                    ? "fill-manuscript-blue text-manuscript-blue"
                    : "text-border"
                )}
                aria-hidden="true"
              />
            )}
          </NavLink>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right" className="font-sans text-xs">
            {label}
          </TooltipContent>
        )}
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

  // Load manifest data (safe after initManifest() in App.tsx)
  const topics = getTopics();
  const projects = getProjects();

  // Separate the 7 topic entries from the orientation entry
  const topicEntries = topics.filter((t) => t.kind === "topic");
  const orientationEntry = topics.find((t) => t.kind === "orientation");

  const toggleCollapse = () => setPref("sidebarCollapsed", !collapsed);

  // Determine if any notes or project routes are active (for group defaultOpen)
  const notesActive = location.pathname.startsWith("/notes");
  const projectsActive = location.pathname.startsWith("/projects");

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
            className="font-serif text-lg font-semibold text-primary"
            aria-label="frontierllm"
          >
            F
          </span>
        ) : (
          <span className="font-serif text-base font-semibold text-foreground tracking-tight">
            frontierllm
          </span>
        )}
      </div>

      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 flex flex-col gap-1">
        {/* Dashboard */}
        <NavItem
          to="/"
          label="Dashboard"
          icon={<LayoutDashboard className="w-4 h-4" />}
          collapsed={collapsed}
        />

        {/* Notes group */}
        <div className="mt-2">
          <NavGroup
            label="Notes"
            icon={<BookOpen className="w-4 h-4" />}
            collapsed={collapsed}
            defaultOpen={notesActive || !collapsed}
          >
            {/* Notes index */}
            <NavItem
              to="/notes"
              label="All Notes"
              collapsed={collapsed}
              showDot={false}
            />

            {/* 7 topic entries */}
            {topicEntries.map((topic) => (
              <NavItem
                key={topic.slug}
                to={`/notes/${topic.slug}`}
                label={topic.title}
                collapsed={collapsed}
                showDot={true}
                dotFilled={false} // TODO Phase 5: wire real progress
              />
            ))}

            {/* Orientation — special entry under 07-frontier-labs */}
            {orientationEntry && (
              <NavItem
                to="/notes/07-frontier-labs/orientation"
                label="↳ Orientation"
                collapsed={collapsed}
                showDot={true}
                dotFilled={false} // TODO Phase 5: wire real progress
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
            defaultOpen={projectsActive || !collapsed}
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
                showDot={false}
              />
            ))}
          </NavGroup>
        </div>

        {/* Reading List */}
        <div className="mt-2">
          <NavItem
            to="/reading"
            label="Reading List"
            icon={<List className="w-4 h-4" />}
            collapsed={collapsed}
          />
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
