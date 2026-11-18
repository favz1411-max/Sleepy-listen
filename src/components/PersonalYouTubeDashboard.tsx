import {
  Heart,
  ListMusic,
  Play,
  Radio,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  PERSONAL_FEED_TABS,
  PersonalFeedTab,
  PersonalYouTubeItem,
} from '../utils/youtubePersonal';
import { MediaThumbnail } from './MediaThumbnail';

interface PersonalYouTubeDashboardProps {
  activeTab: PersonalFeedTab;
  feeds: Record<PersonalFeedTab, PersonalYouTubeItem[]>;
  isLoading: boolean;
  error: string | null;
  activeVideoId?: string;
  userName: string;
  onSelectTab: (tab: PersonalFeedTab) => void;
  onRefresh: () => void;
  onSelectItem: (item: PersonalYouTubeItem) => void;
}

export function PersonalYouTubeDashboard({
  activeTab,
  feeds,
  isLoading,
  error,
  activeVideoId,
  userName,
  onSelectTab,
  onRefresh,
  onSelectItem,
}: PersonalYouTubeDashboardProps) {
  const currentItems = feeds[activeTab] ?? [];
  const activeTabMeta =
    PERSONAL_FEED_TABS.find((t) => t.id === activeTab) ?? PERSONAL_FEED_TABS[0];

  return (
    <section
      aria-label="Personalized YouTube Dashboard"
      className="bg-[#0e1219] border border-white/[0.07] rounded-2xl p-5 sm:p-8 space-y-7"
    >
      {/* Section Header & Distinct Personal Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-[#e5a95c]">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Personal YouTube Library · {userName}</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#f5efe6] tracking-tight text-balance">
            {activeTabMeta.label}
          </h2>
          <p className="text-sm text-[#c8bfb0]/75 max-w-xl">
            {activeTabMeta.description}
          </p>
        </div>

        <div className="flex items-center gap-2 max-w-full overflow-x-auto">
          {/* Segmented Tabs for Saved Playlists, Channel Subscriptions, Liked Videos */}
          <div
            role="tablist"
            aria-label="Personal YouTube sections"
            className="flex items-center gap-1 p-1.5 rounded-xl bg-[#07090d] border border-white/[0.07] shrink-0"
          >
            {PERSONAL_FEED_TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              const count = feeds[tab.id]?.length ?? 0;
              return (
                <button
                  key={tab.id}
                  id={`personal-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => onSelectTab(tab.id)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c] ${
                    isSelected
                      ? 'bg-[#161d29] text-[#f5efe6] border border-[#e5a95c]/60 shadow-sm'
                      : 'text-[#c8bfb0]/75 hover:text-[#f5efe6]'
                  }`}
                >
                  {tab.id === 'playlists' && (
                    <ListMusic
                      className={`w-4 h-4 ${isSelected ? 'text-[#e5a95c]' : ''}`}
                      aria-hidden="true"
                    />
                  )}
                  {tab.id === 'subscriptions' && (
                    <Radio
                      className={`w-4 h-4 ${isSelected ? 'text-[#e5a95c]' : ''}`}
                      aria-hidden="true"
                    />
                  )}
                  {tab.id === 'liked' && (
                    <Heart
                      className={`w-4 h-4 ${isSelected ? 'text-[#e5a95c]' : ''}`}
                      aria-hidden="true"
                    />
                  )}
                  <span>{tab.label}</span>
                  <span className="font-mono tabular-nums text-xs opacity-75">
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh personal YouTube feeds"
            className="min-w-[44px] min-h-[44px] px-3 rounded-xl bg-[#07090d] hover:bg-[#141a24] hover:border-[#e5a95c]/45 border border-white/[0.07] text-[#c8bfb0] hover:text-[#f5efe6] flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c]"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#e5a95c]' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl bg-[#241215] border border-[#f87171]/30 px-4 py-3 text-sm text-[#fca5a5]"
        >
          {error}
        </div>
      )}

      {/* Personal Feed Grid */}
      {isLoading ? (
        <div
          aria-label="Loading personal YouTube feed"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl bg-[#07090d] border border-white/[0.06] p-3.5 space-y-3 animate-pulse"
            >
              <div className="aspect-video w-full rounded-xl bg-[#141a24]" />
              <div className="h-4 w-4/5 rounded bg-[#141a24]" />
              <div className="h-3 w-1/2 rounded bg-[#141a24]" />
            </div>
          ))}
        </div>
      ) : (
        <div
          data-testid={`personal-feed-grid-${activeTab}`}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
        >
          {currentItems.map((item) => {
            const isSelected = activeVideoId === item.videoId;
            return (
              <button
                key={item.id}
                id={`personal-card-${item.id}`}
                type="button"
                onClick={() => onSelectItem(item)}
                aria-label={`Play ${item.title}`}
                aria-pressed={isSelected}
                className={`group text-left rounded-2xl p-3.5 transition-all duration-150 flex flex-col justify-between gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c] active:scale-[0.99] ${
                  isSelected
                    ? 'bg-[#151b26] border border-[#e5a95c] shadow-sm'
                    : 'bg-[#07090d]/90 border border-white/[0.07] hover:bg-[#111620] hover:border-[#e5a95c]/50'
                }`}
              >
                <div className="space-y-3.5 w-full">
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#111620]">
                    <MediaThumbnail
                      src={item.thumbnailUrl}
                      alt={item.title}
                      kind={item.playlistId ? 'playlist' : 'video'}
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
                            : 'bg-black/65 text-[#f5efe6] group-hover:bg-[#e5a95c] group-hover:text-[#090c11]'
                        }`}
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </span>
                      <span className="font-mono tabular-nums text-xs font-medium text-[#f5efe6]">
                        {item.metaRight}
                      </span>
                    </div>
                  </div>

                  {/* High-contrast warm beige / light cream title */}
                  <h3
                    className={`font-display text-base font-medium leading-snug line-clamp-2 transition-colors ${
                      isSelected ? 'text-[#e5a95c]' : 'text-[#f5efe6]'
                    }`}
                  >
                    {item.title}
                  </h3>
                </div>

                {/* Unboxed Channel / Playlist Metadata */}
                <div className="w-full pt-1 flex items-center justify-between gap-2 text-xs text-[#c8bfb0]/80">
                  <span className="truncate">{item.subtitle}</span>
                  {isSelected && (
                    <span className="font-mono tabular-nums shrink-0 text-[#e5a95c]">
                      Playing
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
