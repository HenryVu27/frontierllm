/**
 * App.tsx — root application entry point.
 * Phase 3 debug page removed. Now provides:
 *   - Manifest initialisation (must happen before any manifest accessors are called)
 *   - RouterProvider with the route tree defined in routes.tsx
 *
 * ThemeProvider is implicit: useTheme hook applies the dark class on <html>
 * at module load time (initTheme IIFE in useTheme.ts), so no context wrapper
 * is needed (spec §5 — no global store).
 */

import { RouterProvider } from "react-router-dom";
import { initManifest } from "@/lib/manifest";
import { router } from "@/routes";

// Import the generated manifest — produced at build time by build-content.ts.
// Using a static import so Vite can tree-shake and type-check.
// The generated/ folder is gitignored; it is created by the content plugin.
import manifestData from "@/generated/manifest.json";

// Initialise the manifest module with the JSON data at module load time.
// This must happen before any getTopics() / getProjects() / getEntry() calls,
// which occur inside components rendered by the router below.
initManifest(manifestData as Record<string, unknown>);

export default function App() {
  return <RouterProvider router={router} />;
}
