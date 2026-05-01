/**
 * useSearch — debounced, in-memory search against the MiniSearch manifest index.
 *
 * Builds the index lazily (first search call triggers buildIndex()).
 * Returns { query, setQuery, results, isLoading }.
 * Debounce: 150ms (for user typing in SearchInput).
 * Results: { pages, headings, readingItems } — each capped at 10 (spec §10).
 *
 * Usage in SearchPage: pass initialQuery from URL param; remount via key={q}
 * when URL changes so state resets cleanly.
 *
 * Usage in CommandMenu: no initialQuery (starts empty), user types to search.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { searchAll, buildIndex, type GroupedResults } from "@/lib/search-index";

const EMPTY: GroupedResults = { pages: [], headings: [], readingItems: [] };

export interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: GroupedResults;
  isLoading: boolean;
  totalResults: number;
}

export function useSearch(initialQuery = ""): UseSearchReturn {
  const [query, setQueryRaw] = useState(initialQuery);
  const [results, setResults] = useState<GroupedResults>(() => {
    // Build index and run initial search synchronously
    buildIndex();
    return initialQuery.trim() ? searchAll(initialQuery) : EMPTY;
  });
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setQuery = useCallback((q: string) => {
    setQueryRaw(q);
    setIsLoading(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const res = q.trim() ? searchAll(q) : EMPTY;
      setResults(res);
      setIsLoading(false);
    }, 150);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const totalResults =
    results.pages.length + results.headings.length + results.readingItems.length;

  return { query, setQuery, results, isLoading, totalResults };
}
