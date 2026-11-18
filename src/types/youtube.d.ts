export interface YTPlayerVars {
  autoplay?: 0 | 1;
  controls?: 0 | 1;
  rel?: 0 | 1;
  modestbranding?: 0 | 1;
  playsinline?: 0 | 1;
  enablejsapi?: 0 | 1;
  origin?: string;
  listType?: 'playlist';
  list?: string;
  vq?: string;
}

export interface YTVideoData {
  video_id?: string;
  author?: string;
  title?: string;
}

export interface YTPlayerEvent {
  target: YTPlayer;
  data: number | string;
}

export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  loadVideoById(videoId: string): void;
  cueVideoById(videoId: string): void;
  loadPlaylist(playlist: string | string[] | { list: string; listType?: 'playlist'; index?: number }): void;
  cuePlaylist(playlist: string | string[] | { list: string; listType?: 'playlist'; index?: number }): void;
  setVolume(volume: number): void;
  getVolume(): number;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  getPlayerState(): number;
  getPlaybackQuality(): string;
  setPlaybackQuality(suggestedQuality: string): void;
  getAvailableQualityLevels(): string[];
  getVideoData(): YTVideoData;
  getPlaylist(): string[] | null;
  getPlaylistIndex(): number;
  nextVideo?(): void;
  previousVideo?(): void;
  getIframe?(): HTMLIFrameElement;
  destroy(): void;
}

export interface YTNamespace {
  Player: new (
    elementId: string | HTMLElement,
    options: {
      height?: string | number;
      width?: string | number;
      videoId?: string;
      playerVars?: YTPlayerVars;
      events?: {
        onReady?: (event: YTPlayerEvent) => void;
        onStateChange?: (event: YTPlayerEvent) => void;
        onPlaybackQualityChange?: (event: YTPlayerEvent) => void;
        onError?: (event: YTPlayerEvent) => void;
      };
    }
  ) => YTPlayer;
  PlayerState: {
    UNSTARTED: -1;
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}
