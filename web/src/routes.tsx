/**
 * Route definitions — spec §2.
 *
 * Important ordering: /notes/07-frontier-labs/orientation must be listed
 * BEFORE /notes/:slug so React Router matches it first.
 *
 * Uses react-router-dom v7 createBrowserRouter.
 * The root layout element (RootLayout) lives in AppShell.tsx to satisfy
 * the react-refresh lint rule (no component + non-component exports in
 * the same file).
 */

import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/components/layout/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { NotesIndexPage } from "@/pages/NotesIndexPage";
import { TopicPage } from "@/pages/TopicPage";
import { OrientationPage } from "@/pages/OrientationPage";
import { ProjectsIndexPage } from "@/pages/ProjectsIndexPage";
import { ProjectPage } from "@/pages/ProjectPage";
import { ReadingListPage } from "@/pages/ReadingListPage";
import { SearchPage } from "@/pages/SearchPage";
import { AboutPage } from "@/pages/AboutPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { TextbookIndexPage } from "@/pages/TextbookIndexPage";
import { TextbookChapterPage } from "@/pages/TextbookChapterPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "notes", element: <NotesIndexPage /> },
      // Orientation must come before :slug — React Router v7 uses definition order for ambiguous matches
      {
        path: "notes/07-frontier-labs/orientation",
        element: <OrientationPage />,
      },
      { path: "notes/:slug", element: <TopicPage /> },
      { path: "projects", element: <ProjectsIndexPage /> },
      { path: "projects/:slug", element: <ProjectPage /> },
      { path: "reading", element: <ReadingListPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "textbook", element: <TextbookIndexPage /> },
      { path: "textbook/:slug", element: <TextbookChapterPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
