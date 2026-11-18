import { YouTubeMediaKind } from './youtube';

export const MAX_BACKGROUND_RESUME_ATTEMPTS = 3;

export interface BackgroundResumeCheck {
  backgroundPlaybackEnabled: boolean;
  isDocumentHidden: boolean;
  intendedPlaying: boolean;
  isSleepTimerPaused: boolean;
  resumeAttemptsInWindow: number;
  maxAttempts?: number;
}

export function shouldAttemptBackgroundResume({
  backgroundPlaybackEnabled,
  isDocumentHidden,
  intendedPlaying,
  isSleepTimerPaused,
  resumeAttemptsInWindow,
  maxAttempts = MAX_BACKGROUND_RESUME_ATTEMPTS,
}: BackgroundResumeCheck): boolean {
  if (!backgroundPlaybackEnabled) return false;
  if (!isDocumentHidden) return false;
  if (!intendedPlaying) return false;
  if (isSleepTimerPaused) return false;
  if (resumeAttemptsInWindow >= maxAttempts) return false;
  return true;
}

export function mapMediaSessionPlaybackState(
  isPlaying: boolean,
  hasActiveMedia: boolean
): 'playing' | 'paused' | 'none' {
  if (!hasActiveMedia) return 'none';
  return isPlaying ? 'playing' : 'paused';
}

export interface MediaArtworkItem {
  src: string;
  sizes: string;
  type: string;
}

export interface MediaSessionMetadataPayload {
  title: string;
  artist: string;
  album: string;
  artwork: MediaArtworkItem[];
}

export function buildMediaSessionMetadataPayload(
  media: {
    title: string;
    kind: YouTubeMediaKind;
    thumbnailUrl: string | null;
  },
  folder?: string
): MediaSessionMetadataPayload {
  const cleanTitle =
    media.title.trim() || (media.kind === 'playlist' ? 'YouTube Playlist' : 'YouTube Video');

  const artwork: MediaArtworkItem[] = media.thumbnailUrl
    ? [
        {
          src: media.thumbnailUrl,
          sizes: '480x360',
          type: 'image/jpeg',
        },
      ]
    : [];

  return {
    title: cleanTitle,
    artist: 'Sleep Player',
    album: folder ? `Favorites · ${folder}` : media.kind === 'playlist' ? 'YouTube Playlist' : 'YouTube',
    artwork,
  };
}
