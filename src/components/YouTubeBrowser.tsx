import { FormEvent } from 'react';
import { Compass, Loader2, Play, Search, X } from 'lucide-react';
import {
  BROWSE_CATEGORIES,
  BrowseCategory,
  YouTubeVideoItem,
} from '../utils/youtubeSearch';
import { MediaThumbnail } from './MediaThumbnail';

interface YouTubeBrowserProps {
  query: string;
  activeCategory: BrowseCategory;
  results: YouTubeVideoItem[];
  isLoading: boolean;
  error: string | null;
  activeVideoId?: string;
  onQueryChange: (next: string) => void;
  onSubmitSearch: () => void;
  onSelectCategory: (category: BrowseCategory) => void;
  onClearSearch: () => void;
  onSelectVideo: (video: YouTubeVideoItem) => void;
}

export function YouTubeBrowser({
  query,
  activeCategory,
  results,
  isLoading,
  error,
  activeVideoId,
  onQueryChange,
  onSubmitSearch,
  onSelectCategory,
  onClearSearch,
  onSelectVideo,
}: YouTubeBrowserProps) {
  const handleFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmitSearch();
  };

  return (
    <section
      aria-label="Browse and Search YouTube"
      className="bg-[#0e1219] border border-white/[0.07] rounded-2xl p-5 sm:p-8 space-y-7"
    >
      {/* Header & Category Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-[#e5a95c]">
            <Compass className="w-4 h-4" aria-hidden="true" />
            <span>YouTube Discovery Feed</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#f5efe6] tracking-tight text-balance">
            Browse &amp; Search
          </h2>
          <p className="text-sm text-[#c8bfb0]/75 max-w-xl">
            Search YouTube videos directly and select any card to start sleep playback immediately.
          </p>
        </div>

        {/* Category Filter Bar */}
        <div
          role="group"
          aria-label="Filter videos by category"
          className="flex items-center gap-1.5 p-1 rounded-xl bg-[#07090d] border border-white/[0.07] self-start md:self-auto"
        >
          {BROWSE_CATEGORIES.map((category) => {
            const isSelected = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectCategory(category)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c] ${
                  isSelected
                    ? 'bg-[#161d29] text-[#f5efe6] border border-[#e5a95c]/45'
                    : 'text-[#c8bfb0]/75 hover:text-[#f5efe6]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <label htmlFor="youtube-search-input" className="sr-only">
            Search YouTube videos
          </label>
          <Search
            className="w-5 h-5 text-[#c8bfb0]/50 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="youtube-search-input"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search sleep science, ambient rain, lofi beats, astronomy..."
            className="w-full min-h-[52px] pl-12 pr-11 py-3 rounded-xl bg-[#07090d] border border-white/[0.09] text-base text-[#f5efe6] placeholder:text-[#c8bfb0]/45 focus:outline-none focus:border-[#e5a95c]/75 focus:ring-1 focus:ring-[#e5a95c]/75 transition-colors"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={onClearSearch}
              aria-label="Clear search query"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#c8bfb0]/70 hover:text-[#f5efe6] absolute right-1.5 top-1/2 -translate-y-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c]"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="min-h-[52px] px-7 py-3 rounded-xl bg-[#161d29] hover:bg-[#1e2738] hover:border-[#e5a95c]/50 active:scale-[0.98] border border-[#e5a95c]/30 text-[#f5efe6] font-medium text-base flex items-center justify-center gap-2.5 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#e5a95c]" aria-hidden="true" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4 text-[#e5a95c]" aria-hidden="true" />
              <span>Search YouTube</span>
            </>
          )}
        </button>
      </form>

      {/* Error State */}
      {error && (
        <div
          role="alert"
          className="rounded-xl bg-[#241215] border border-[#f87171]/25 px-4 py-3 text-sm text-[#fca5a5]"
        >
          {error}
        </div>
      )}

      {/* Visual Results Grid */}
      {isLoading ? (
        <div
          aria-label="Loading search results"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl bg-[#07090d] border border-white/[0.06] overflow-hidden p-3 space-y-3 animate-pulse"
            >
              <div className="aspect-video w-full rounded-xl bg-[#141a24]" />
              <div className="h-4 w-4/5 rounded bg-[#141a24]" />
              <div className="h-3 w-1/2 rounded bg-[#141a24]" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl bg-[#07090d]/70 border border-white/[0.05] px-6 py-12 text-center space-y-3">
          <p className="text-base font-medium text-[#f5efe6]">
            No videos found matching &ldquo;{query}&rdquo;
          </p>
          <p className="text-sm text-[#c8bfb0]/70 max-w-md mx-auto">
            Try searching a broader topic like &ldquo;cosmos&rdquo;, &ldquo;lofi&rdquo;, or &ldquo;rain&rdquo;, or clear the filter to view all curated sleep tracks.
          </p>
          <button
            type="button"
            onClick={onClearSearch}
            className="mt-2 min-h-[44px] px-5 py-2 rounded-xl bg-[#161d29] hover:border-[#e5a95c]/50 border border-white/[0.1] text-sm font-medium text-[#f5efe6] transition-colors"
          >
            Reset Feed
          </button>
        </div>
      ) : (
        <div
          data-testid="youtube-results-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
        >
          {results.map((video) => {
            const isSelected = activeVideoId === video.videoId;
            return (
              <button
                key={video.videoId}
                type="button"
                onClick={() => onSelectVideo(video)}
                aria-label={`Play ${video.title} by ${video.channelTitle}`}
                aria-pressed={isSelected}
                className={`group text-left rounded-2xl p-3.5 transition-all duration-150 flex flex-col justify-between gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c] active:scale-[0.99] ${
                  isSelected
                    ? 'bg-[#151b26] border border-[#e5a95c] shadow-sm'
                    : 'bg-[#07090d]/90 border border-white/[0.07] hover:bg-[#111620] hover:border-[#e5a95c]/50'
                }`}
              >
                <div className="space-y-3.5 w-full">
                  {/* Thumbnail with subtle contrast scrim */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#111620]">
                    <MediaThumbnail
                      src={video.thumbnailUrl}
                      alt={video.title}
                      kind="video"
                      className="w-full h-full transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end justify-between p-2.5"
                    >
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#e5a95c] text-[#090c11]'
                            : 'bg-black/60 text-[#f5efe6] group-hover:bg-[#e5a95c] group-hover:text-[#090c11]'
                        }`}
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </span>
                      <span className="font-mono tabular-nums text-xs font-medium text-[#f5efe6]">
                        {video.duration}
                      </span>
                    </div>
                  </div>

                  {/* Warm beige / light cream high-contrast title */}
                  <h3
                    className={`font-display text-base font-medium leading-snug line-clamp-2 transition-colors ${
                      isSelected
                        ? 'text-[#e5a95c]'
                        : 'text-[#f5efe6] group-hover:text-[#f5efe6]'
                    }`}
                  >
                    {video.title}
                  </h3>
                </div>

                {/* Unboxed Channel & Duration Metadata */}
                <div className="w-full pt-1 flex items-center justify-between gap-2 text-xs text-[#c8bfb0]/80">
                  <span className="truncate">{video.channelTitle}</span>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono tabular-nums">
                    <span aria-hidden="true">·</span>
                    <span className={isSelected ? 'text-[#e5a95c]' : ''}>
                      {isSelected ? 'Playing' : video.duration}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
