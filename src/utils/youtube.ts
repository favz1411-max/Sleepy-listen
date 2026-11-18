export type YouTubeMediaKind = 'video' | 'playlist';

export interface ParsedYouTubeMedia {
  kind: YouTubeMediaKind;
  videoId?: string;
  playlistId?: string;
  canonicalUrl: string;
  thumbnailUrl: string | null;
}

export type ParseYouTubeResult =
  | { ok: true; media: ParsedYouTubeMedia }
  | { ok: false; error: string };

const VIDEO_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;
const PLAYLIST_ID_REGEX = /^[A-Za-z0-9_-]{10,}$/;

const QUALITY_PRIORITY = [
  'highres',
  'hd2160',
  'hd1440',
  'hd1080',
  'hd720',
  'large',
  'medium',
  'small',
] as const;

const QUALITY_LABELS: Record<string, string> = {
  highres: 'Highest available (4K+)',
  hd2160: '2160p 4K',
  hd1440: '1440p QHD',
  hd1080: '1080p HD',
  hd720: '720p HD',
  large: '480p',
  medium: '360p',
  small: '240p',
  tiny: '144p',
  auto: 'Auto',
};

export function getVideoThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function parseYouTubeInput(rawInput: string): ParseYouTubeResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { ok: false, error: 'Paste a YouTube video or playlist link first.' };
  }

  // Support bare 11-char video ID if someone pastes just an ID
  if (VIDEO_ID_REGEX.test(trimmed)) {
    return {
      ok: true,
      media: {
        kind: 'video',
        videoId: trimmed,
        canonicalUrl: `https://www.youtube.com/watch?v=${trimmed}`,
        thumbnailUrl: getVideoThumbnailUrl(trimmed),
      },
    };
  }

  let url: URL;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    url = new URL(withProtocol);
  } catch {
    return { ok: false, error: 'That does not look like a valid URL.' };
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
  const isYouTubeDomain =
    hostname === 'youtube.com' ||
    hostname === 'music.youtube.com' ||
    hostname === 'youtube-nocookie.com' ||
    hostname === 'youtu.be';

  if (!isYouTubeDomain) {
    return {
      ok: false,
      error: 'Please enter a valid YouTube or youtu.be link.',
    };
  }

  const listParam = url.searchParams.get('list')?.trim() || undefined;
  const vParam = url.searchParams.get('v')?.trim() || undefined;

  let extractedVideoId: string | undefined;

  if (hostname === 'youtu.be') {
    const seg = url.pathname.split('/').filter(Boolean)[0];
    if (seg && VIDEO_ID_REGEX.test(seg)) {
      extractedVideoId = seg;
    }
  } else {
    if (vParam && VIDEO_ID_REGEX.test(vParam)) {
      extractedVideoId = vParam;
    } else {
      const segments = url.pathname.split('/').filter(Boolean);
      if (
        segments.length >= 2 &&
        ['embed', 'shorts', 'live', 'v'].includes(segments[0]) &&
        VIDEO_ID_REGEX.test(segments[1])
      ) {
        extractedVideoId = segments[1];
      }
    }
  }

  const validPlaylistId =
    listParam && PLAYLIST_ID_REGEX.test(listParam) ? listParam : undefined;

  // Playlist URL or watch URL with playlist parameter
  if (url.pathname === '/playlist' || validPlaylistId) {
    if (!validPlaylistId) {
      return {
        ok: false,
        error: 'Could not find a valid YouTube playlist ID in that link.',
      };
    }

    const canonicalUrl = extractedVideoId
      ? `https://www.youtube.com/watch?v=${extractedVideoId}&list=${validPlaylistId}`
      : `https://www.youtube.com/playlist?list=${validPlaylistId}`;

    return {
      ok: true,
      media: {
        kind: 'playlist',
        videoId: extractedVideoId,
        playlistId: validPlaylistId,
        canonicalUrl,
        thumbnailUrl: extractedVideoId ? getVideoThumbnailUrl(extractedVideoId) : null,
      },
    };
  }

  if (extractedVideoId) {
    return {
      ok: true,
      media: {
        kind: 'video',
        videoId: extractedVideoId,
        canonicalUrl: `https://www.youtube.com/watch?v=${extractedVideoId}`,
        thumbnailUrl: getVideoThumbnailUrl(extractedVideoId),
      },
    };
  }

  return {
    ok: false,
    error: 'Could not find a YouTube video or playlist ID in that link.',
  };
}

export function getBestQualityLevel(availableLevels: string[]): string {
  for (const level of QUALITY_PRIORITY) {
    if (availableLevels.includes(level)) {
      return level;
    }
  }
  return 'highres';
}

export function formatQualityLabel(quality: string | null | undefined): string {
  const normalized = quality?.trim();
  if (!normalized || normalized === 'unknown') {
    return 'Highest requested';
  }
  return QUALITY_LABELS[normalized] ?? normalized;
}
