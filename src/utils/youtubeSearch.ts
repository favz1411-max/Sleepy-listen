import { getVideoThumbnailUrl } from './youtube';

export interface YouTubeVideoItem {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  duration: string;
  category?: 'All' | 'Science' | 'Songs' | 'Ambient';
}

export interface YouTubeSearchApiItem {
  id?: {
    videoId?: string;
  };
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
}

export interface YouTubeVideoDetailsApiItem {
  id?: string;
  contentDetails?: {
    duration?: string;
  };
}

export const BROWSE_CATEGORIES = ['All', 'Science', 'Songs', 'Ambient'] as const;
export type BrowseCategory = (typeof BROWSE_CATEGORIES)[number];

/**
 * Curated catalog of real YouTube sleep, science, and ambient videos
 * with verified videoIds and thumbnails for instant initial feed and fallback search.
 */
export const CURATED_YOUTUBE_VIDEOS: YouTubeVideoItem[] = [
  {
    videoId: 'uD4izuDMUQA',
    title: 'TIMELAPSE OF THE FUTURE: A Journey to the End of Time (4K)',
    channelTitle: 'melodysheep',
    thumbnailUrl: getVideoThumbnailUrl('uD4izuDMUQA'),
    duration: '29:21',
    category: 'Science',
  },
  {
    videoId: 'rUxyKA_-grg',
    title: 'lofi hip hop radio - beats to relax/study to',
    channelTitle: 'Lofi Girl',
    thumbnailUrl: getVideoThumbnailUrl('rUxyKA_-grg'),
    duration: 'LIVE',
    category: 'Songs',
  },
  {
    videoId: 'sF80I-TQiW0',
    title: 'Deep Space & Cosmic Horizons: Calm Astrophysics Narration for Sleep',
    channelTitle: 'melodysheep',
    thumbnailUrl: getVideoThumbnailUrl('sF80I-TQiW0'),
    duration: '30:27',
    category: 'Science',
  },
  {
    videoId: 'DWcJFNfaw9c',
    title: 'lofi hip hop radio - beats to sleep/chill to',
    channelTitle: 'Lofi Girl',
    thumbnailUrl: getVideoThumbnailUrl('DWcJFNfaw9c'),
    duration: 'LIVE',
    category: 'Songs',
  },
  {
    videoId: 'TBikbn5XJhg',
    title: 'The History of the Universe in 1 Hour — Calm Bedtime Science Documentary',
    channelTitle: 'Kurzgesagt – In a Nutshell',
    thumbnailUrl: getVideoThumbnailUrl('TBikbn5XJhg'),
    duration: '1:02:14',
    category: 'Science',
  },
  {
    videoId: '5qap5aO4i9A',
    title: 'Late Night Lofi Chill Instrumental Beats for Deep Sleep',
    channelTitle: 'ChilledCow Acoustic',
    thumbnailUrl: getVideoThumbnailUrl('5qap5aO4i9A'),
    duration: '1:45:00',
    category: 'Songs',
  },
  {
    videoId: '1ZYbU82GVz4',
    title: 'Flying Over Norway (4K UHD) - Relaxing Ambient Nature & Sleep Music',
    channelTitle: 'Scenic Relaxation',
    thumbnailUrl: getVideoThumbnailUrl('1ZYbU82GVz4'),
    duration: '3:01:28',
    category: 'Ambient',
  },
  {
    videoId: 'eKFTSSKCzWA',
    title: 'Relaxing Rain Sounds for Sleeping & Dark Screen Night Ambience',
    channelTitle: 'The Relaxed Guy',
    thumbnailUrl: getVideoThumbnailUrl('eKFTSSKCzWA'),
    duration: '2:30:00',
    category: 'Ambient',
  },
];

/**
 * Parses an ISO 8601 YouTube duration string (e.g. "PT1H29M21S", "PT15M4S", "PT45S", "P0D")
 * into a human-readable tabular string ("1:29:21", "15:04", "0:45", "LIVE").
 */
export function parseIsoDuration(isoDuration: string | undefined | null): string {
  if (!isoDuration) return '--:--';
  const trimmed = isoDuration.trim().toUpperCase();
  if (trimmed === 'P0D' || trimmed === 'PT0S') {
    return 'LIVE';
  }

  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(trimmed);
  if (!match) {
    return '--:--';
  }

  const hours = Number.parseInt(match[1] || '0', 10);
  const minutes = Number.parseInt(match[2] || '0', 10);
  const seconds = Number.parseInt(match[3] || '0', 10);

  if (hours === 0 && minutes === 0 && seconds === 0) {
    return 'LIVE';
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${minutes}:${pad(seconds)}`;
}

/**
 * Decodes basic HTML entities returned by YouTube Data API v3 snippet titles.
 */
export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/**
 * Combines YouTube Data API v3 `search.list` items and `videos.list` contentDetails items
 * into clean `YouTubeVideoItem` objects.
 */
export function mapYouTubeApiItems(
  searchItems: YouTubeSearchApiItem[],
  detailsItems: YouTubeVideoDetailsApiItem[] = []
): YouTubeVideoItem[] {
  const durationMap = new Map<string, string>();
  for (const detail of detailsItems) {
    if (detail.id && detail.contentDetails?.duration) {
      durationMap.set(detail.id, parseIsoDuration(detail.contentDetails.duration));
    }
  }

  const results: YouTubeVideoItem[] = [];
  for (const item of searchItems) {
    const videoId = item.id?.videoId?.trim();
    if (!videoId) continue;

    const rawTitle = item.snippet?.title?.trim() || 'Untitled YouTube Video';
    const channelTitle = item.snippet?.channelTitle?.trim() || 'YouTube Channel';
    const thumbnailUrl =
      item.snippet?.thumbnails?.high?.url ||
      item.snippet?.thumbnails?.medium?.url ||
      item.snippet?.thumbnails?.default?.url ||
      getVideoThumbnailUrl(videoId);

    results.push({
      videoId,
      title: decodeHtmlEntities(rawTitle),
      channelTitle: decodeHtmlEntities(channelTitle),
      thumbnailUrl,
      duration: durationMap.get(videoId) ?? '--:--',
    });
  }

  return results;
}

/**
 * Filters the curated sleep/science/songs catalog by search query and optional category.
 */
export function searchCuratedCatalog(
  query: string,
  category: BrowseCategory = 'All'
): YouTubeVideoItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  return CURATED_YOUTUBE_VIDEOS.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category;
    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;
    return (
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.channelTitle.toLowerCase().includes(normalizedQuery) ||
      (item.category && item.category.toLowerCase().includes(normalizedQuery))
    );
  });
}

/**
 * Queries the official YouTube Data API v3 (`search.list` + `videos.list` for durations)
 * when an API key is provided, or falls back cleanly to the curated catalog when no key is set.
 */
export async function fetchYouTubeVideos(
  query: string,
  options?: {
    apiKey?: string;
    category?: BrowseCategory;
    maxResults?: number;
    signal?: AbortSignal;
  }
): Promise<{ items: YouTubeVideoItem[]; source: 'youtube-api' | 'curated' }> {
  const apiKey = options?.apiKey?.trim();
  const category = options?.category ?? 'All';
  const maxResults = options?.maxResults ?? 8;
  const effectiveQuery =
    query.trim() ||
    (category === 'Science'
      ? 'space science documentary sleep'
      : category === 'Songs'
      ? 'lofi sleep beats chill'
      : category === 'Ambient'
      ? 'ambient rain nature sleep 4k'
      : 'deep sleep science ambient lofi');

  if (apiKey && apiKey !== 'MY_YOUTUBE_API_KEY') {
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    searchUrl.searchParams.set('part', 'snippet');
    searchUrl.searchParams.set('type', 'video');
    searchUrl.searchParams.set('videoEmbeddable', 'true');
    searchUrl.searchParams.set('maxResults', String(maxResults));
    searchUrl.searchParams.set('q', effectiveQuery);
    searchUrl.searchParams.set('key', apiKey);

    const searchResponse = await fetch(searchUrl.toString(), {
      signal: options?.signal,
    });

    if (!searchResponse.ok) {
      throw new Error(`YouTube Data API v3 error (${searchResponse.status})`);
    }

    const searchData = (await searchResponse.json()) as {
      items?: YouTubeSearchApiItem[];
    };
    const searchItems = Array.isArray(searchData.items) ? searchData.items : [];
    const videoIds = searchItems
      .map((item) => item.id?.videoId?.trim())
      .filter((id): id is string => Boolean(id));

    let detailsItems: YouTubeVideoDetailsApiItem[] = [];
    if (videoIds.length > 0) {
      const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
      detailsUrl.searchParams.set('part', 'contentDetails');
      detailsUrl.searchParams.set('id', videoIds.join(','));
      detailsUrl.searchParams.set('key', apiKey);

      const detailsResponse = await fetch(detailsUrl.toString(), {
        signal: options?.signal,
      });
      if (detailsResponse.ok) {
        const detailsData = (await detailsResponse.json()) as {
          items?: YouTubeVideoDetailsApiItem[];
        };
        detailsItems = Array.isArray(detailsData.items) ? detailsData.items : [];
      }
    }

    return {
      items: mapYouTubeApiItems(searchItems, detailsItems),
      source: 'youtube-api',
    };
  }

  return {
    items: searchCuratedCatalog(query, category),
    source: 'curated',
  };
}
