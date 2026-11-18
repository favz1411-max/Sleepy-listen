import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BrowseCategory,
  CURATED_YOUTUBE_VIDEOS,
  fetchYouTubeVideos,
  searchCuratedCatalog,
  YouTubeVideoItem,
} from '../utils/youtubeSearch';

export interface UseYouTubeSearchResult {
  query: string;
  activeCategory: BrowseCategory;
  results: YouTubeVideoItem[];
  isLoading: boolean;
  error: string | null;
  source: 'youtube-api' | 'curated';
  setQuery: (next: string) => void;
  submitSearch: (searchQuery?: string) => Promise<void>;
  selectCategory: (category: BrowseCategory) => Promise<void>;
  clearSearch: () => Promise<void>;
}

export function useYouTubeSearch(): UseYouTubeSearchResult {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<BrowseCategory>('All');
  const [results, setResults] = useState<YouTubeVideoItem[]>(CURATED_YOUTUBE_VIDEOS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'youtube-api' | 'curated'>('curated');
  const abortRef = useRef<AbortController | null>(null);

  const apiKey =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined)
      : undefined;

  const executeSearch = useCallback(
    async (targetQuery: string, targetCategory: BrowseCategory) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchYouTubeVideos(targetQuery, {
          apiKey,
          category: targetCategory,
          maxResults: 8,
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setResults(response.items);
          setSource(response.source);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        // Fallback to curated catalog if API key quota/network fails, while surfacing non-abort notice if appropriate
        const fallback = searchCuratedCatalog(targetQuery, targetCategory);
        setResults(fallback);
        setSource('curated');
        if (err instanceof Error && fallback.length === 0) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [apiKey]
  );

  // Load initial feed on mount if an API key is configured
  useEffect(() => {
    if (apiKey && apiKey !== 'MY_YOUTUBE_API_KEY') {
      void executeSearch('', 'All');
    }
    return () => {
      abortRef.current?.abort();
    };
  }, [apiKey, executeSearch]);

  const submitSearch = useCallback(
    async (overrideQuery?: string) => {
      const nextQuery = typeof overrideQuery === 'string' ? overrideQuery : query;
      await executeSearch(nextQuery, activeCategory);
    },
    [activeCategory, executeSearch, query]
  );

  const selectCategory = useCallback(
    async (category: BrowseCategory) => {
      setActiveCategory(category);
      await executeSearch(query, category);
    },
    [executeSearch, query]
  );

  const clearSearch = useCallback(async () => {
    setQuery('');
    setError(null);
    await executeSearch('', activeCategory);
  }, [activeCategory, executeSearch]);

  return {
    query,
    activeCategory,
    results,
    isLoading,
    error,
    source,
    setQuery,
    submitSearch,
    selectCategory,
    clearSearch,
  };
}
