import { RefObject } from 'react';
import {
  AlertCircle,
  MoonStar,
  Pause,
  Play,
  Star,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ActiveMediaState } from '../hooks/useYouTubePlayer';
import { FavoriteItem } from '../utils/favorites';
import { formatQualityLabel } from '../utils/youtube';

interface PlayerStageProps {
  containerRef: RefObject<HTMLDivElement | null>;
  activeMedia: ActiveMediaState | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  playbackQuality: string | null;
  playerError: string | null;
  dimVideo: boolean;
  backgroundPlayback: boolean;
  existingFavorite: FavoriteItem | undefined;
  onTogglePlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onOpenStarModal: () => void;
}

export function PlayerStage({
  containerRef,
  activeMedia,
  isPlaying,
  volume,
  isMuted,
  playbackQuality,
  playerError,
  dimVideo,
  backgroundPlayback,
  existingFavorite,
  onTogglePlayPause,
  onVolumeChange,
  onToggleMute,
  onOpenStarModal,
}: PlayerStageProps) {
  const isStarred = Boolean(existingFavorite);

  return (
    <section
      aria-label="YouTube Sleep Player"
      className="bg-[#0e1219] border border-white/[0.07] rounded-2xl overflow-hidden"
    >
      {/* 16:9 Official YouTube IFrame Player Container */}
      <div className="relative aspect-video w-full bg-[#05070a]">
        <div
          ref={containerRef}
          data-testid="youtube-player-container"
          className="w-full h-full"
        />

        {!activeMedia && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#0b0f16] to-[#07090d]">
            <div className="w-14 h-14 rounded-2xl bg-[#131924] border border-white/[0.08] flex items-center justify-center mb-4">
              <MoonStar className="w-7 h-7 text-[#e5a95c]" aria-hidden="true" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-semibold text-[#e2e8f0] text-balance">
              Ready for sleep playback
            </h1>
            <p className="mt-2 text-sm text-[#94a3b8] max-w-md">
              Paste any YouTube video or playlist link above, or tap a saved item in Science or Songs to start immediately.
            </p>
          </div>
        )}

        {activeMedia && dimVideo && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/70 pointer-events-none transition-opacity duration-300"
          />
        )}
      </div>

      {/* Inline Player Error Notice */}
      {playerError && (
        <div
          role="alert"
          className="px-4 sm:px-5 py-3 bg-[#241215] border-t border-[#f87171]/25 flex items-start gap-2.5 text-sm text-[#fca5a5]"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{playerError}</span>
        </div>
      )}

      {/* Now Playing Metadata & Large Bedside Controls */}
      <div className="p-4 sm:p-5 space-y-4 border-t border-white/[0.06]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-semibold text-[#e2e8f0] truncate">
              {activeMedia ? activeMedia.title : 'No video selected'}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#94a3b8]">
              <span>
                {activeMedia
                  ? activeMedia.kind === 'playlist'
                    ? 'Playlist'
                    : 'Video'
                  : 'Official YouTube IFrame API'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{formatQualityLabel(playbackQuality)}</span>
              <span aria-hidden="true">·</span>
              <span>
                {backgroundPlayback ? 'Background audio on' : 'Background audio off'}
              </span>
              {existingFavorite && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#e5a95c]">
                    Saved in {existingFavorite.folder}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Large Touch-Friendly Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <button
            type="button"
            disabled={!activeMedia}
            onClick={onTogglePlayPause}
            className="sm:col-span-4 min-h-[52px] px-5 py-3 rounded-xl bg-[#161d29] hover:bg-[#1e2738] disabled:opacity-45 disabled:pointer-events-none active:scale-[0.98] border border-white/[0.09] text-base font-medium text-[#e2e8f0] flex items-center justify-center gap-2.5 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c]"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 text-[#e5a95c]" aria-hidden="true" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 text-[#e5a95c] fill-current" aria-hidden="true" />
                <span>Play</span>
              </>
            )}
          </button>

          <div className="sm:col-span-5 min-h-[52px] px-3.5 py-2 rounded-xl bg-[#0a0d13] border border-white/[0.07] flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={isMuted ? 'Unmute volume' : 'Mute volume'}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#94a3b8] hover:text-[#e2e8f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c]"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-[#94a3b8]" aria-hidden="true" />
              ) : (
                <Volume2 className="w-5 h-5 text-[#cbd5e1]" aria-hidden="true" />
              )}
            </button>
            <label htmlFor="player-volume-slider" className="sr-only">
              Player volume
            </label>
            <input
              id="player-volume-slider"
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-full h-2 accent-[#e5a95c] cursor-pointer"
            />
            <span className="text-xs font-mono tabular-nums text-[#94a3b8] w-9 text-right shrink-0">
              {isMuted ? 0 : volume}%
            </span>
          </div>

          <button
            type="button"
            disabled={!activeMedia}
            onClick={onOpenStarModal}
            aria-pressed={isStarred}
            aria-label={
              isStarred
                ? `Edit favorite in ${existingFavorite?.folder}`
                : 'Star and save to favorites'
            }
            className={`sm:col-span-3 min-h-[52px] px-4 py-3 rounded-xl border text-base font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c] ${
              isStarred
                ? 'bg-[#e5a95c]/15 border-[#e5a95c]/45 text-[#f3c47d] hover:bg-[#e5a95c]/22'
                : 'bg-[#161d29] border-white/[0.09] text-[#cbd5e1] hover:bg-[#1e2738]'
            }`}
          >
            <Star
              className={`w-5 h-5 ${isStarred ? 'fill-[#e5a95c] text-[#e5a95c]' : ''}`}
              aria-hidden="true"
            />
            <span>{isStarred ? 'Starred' : 'Star'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
