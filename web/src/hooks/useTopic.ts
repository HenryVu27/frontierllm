/**
 * useTopic — convenience hook that combines manifest lookup + lazy HTML chunk.
 *
 * Returns { entry, html, loading, error } for a given slug.
 * Phase 6 page components use this as their single data source.
 *
 * HTML chunks are lazily imported via import.meta.glob.
 * Each chunk is a raw HTML string (Vite `as: "raw"` option).
 */

import { useReducer, useEffect } from "react";
import { getEntry, type ManifestEntry } from "@/lib/manifest";

// All HTML chunk loaders keyed by slug filename.
// Using eager: false so they are lazy-loaded on demand.
const htmlLoaders = import.meta.glob<string>(
  "@/generated/content/*.html",
  { query: "?raw", import: "default", eager: false }
);

function slugToPath(slug: string): string {
  return `/src/generated/content/${slug}.html`;
}

// ─── State machine (reducer) ──────────────────────────────────────────────────

type State =
  | { status: "idle"; html: null; error: null }
  | { status: "loading"; html: null; error: null }
  | { status: "done"; html: string; error: null }
  | { status: "error"; html: null; error: Error };

type Action =
  | { type: "start" }
  | { type: "done"; html: string }
  | { type: "error"; error: Error }
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start":
      return { status: "loading", html: null, error: null };
    case "done":
      return { status: "done", html: action.html, error: null };
    case "error":
      return { status: "error", html: null, error: action.error };
    case "reset":
      return { status: "idle", html: null, error: null };
    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseTopicResult {
  entry: ManifestEntry | undefined;
  html: string | null;
  loading: boolean;
  error: Error | null;
}

export function useTopic(slug: string | undefined): UseTopicResult {
  const entry = slug ? getEntry(slug) : undefined;
  const [state, dispatch] = useReducer(reducer, {
    status: slug ? "loading" : "idle",
    html: null,
    error: null,
  });

  useEffect(() => {
    if (!slug) {
      dispatch({ type: "reset" });
      return;
    }

    dispatch({ type: "start" });

    const path = slugToPath(slug);
    const loader = htmlLoaders[path];

    if (!loader) {
      dispatch({ type: "error", error: new Error(`No HTML chunk found for slug: ${slug}`) });
      return;
    }

    let cancelled = false;

    loader()
      .then((content) => {
        if (!cancelled) dispatch({ type: "done", html: content });
      })
      .catch((err: unknown) => {
        if (!cancelled)
          dispatch({
            type: "error",
            error: err instanceof Error ? err : new Error(String(err)),
          });
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return {
    entry,
    html: state.html,
    loading: state.status === "loading",
    error: state.error,
  };
}
