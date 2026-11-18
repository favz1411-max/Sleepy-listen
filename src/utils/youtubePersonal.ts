import { getVideoThumbnailUrl } from './youtube';
import { decodeHtmlEntities, parseIsoDuration } from './youtubeSearch';

export type PersonalFeedTab = 'playlists' | 'subscriptions' | 'liked';

export const PERSONAL_FEED_TABS: {
  id: PersonalFeedTab;
  label: string;
  description: string;
}[] = [
  {
    id: 'playlists',
    label: 'Saved Playlists',
    description: 'Your personal YouTube sleep & study playlists (mine=true)',
  },
  {
    id: 'subscriptions',
    label: 'Channel Subscriptions',
    description: 'Latest sleep-ready uploads from channels you follow (mine=true)',
  },
  {
    id: 'liked',
    label: 'Liked Videos',
    description: 'Videos you have liked on YouTube',
  },
];

export interface PersonalYouTubeItem {
  id: string;
  videoId: string;
  playlistId?: string;
  title: string;
  subtitle: string;
  thumbnailUrl: string;
  metaRight: string;
  tab: PersonalFeedTab;
}

export interface GoogleAuthSession {
  accessToken: string;
  userName: string;
  userEmail: string;
  isDemoToken?: boolean;
  expiresAt: number;
}

export const AUTH_STORAGE_KEY = 'sleep_player_google_oauth_v1';

export const DEMO_PERSONAL_FEEDS: Record<PersonalFeedTab, PersonalYouTubeItem[]> = {
  playlists: [
    {
      id: 'pl-cosmic-sleep',
      videoId: 'uD4izuDMUQA',
      playlistId: 'PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i',
      title: 'Deep Space & Astrophysics Bedtime',
      subtitle: 'Saved Playlist · 14 videos',
      thumbnailUrl: getVideoThumbnailUrl('uD4izuDMUQA'),
      metaRight: '14 tracks',
      tab: 'playlists',
    },
    {
      id: 'pl-lofi-night',
      videoId: 'DWcJFNfaw9c',
      title: 'Late Night Lofi & Rain Sessions',
      subtitle: 'Saved Playlist · 28 videos',
      thumbnailUrl: getVideoThumbnailUrl('DWcJFNfaw9c'),
      metaRight: '28 tracks',
      tab: 'playlists',
    },
    {
      id: 'pl-ambient-nature',
      videoId: '1ZYbU82GVz4',
      title: 'Nordic Landscapes & 4K Ambient Drift',
      subtitle: 'Saved Playlist · 9 videos',
      thumbnailUrl: getVideoThumbnailUrl('1ZYbU82GVz4'),
      metaRight: '9 tracks',
      tab: 'playlists',
    },
    {
      id: 'pl-dark-screen-rain',
      videoId: 'eKFTSSKCzWA',
      title: 'Dark Screen Rain & Thunderstorms',
      subtitle: 'Saved Playlist · 19 videos',
      thumbnailUrl: getVideoThumbnailUrl('eKFTSSKCzWA'),
      metaRight: '19 tracks',
      tab: 'playlists',
    },
  ],
  subscriptions: [
    {
      id: 'sub-melodysheep',
      videoId: 'sF80I-TQiW0',
      title: 'Deep Space & Cosmic Horizons: Calm Astrophysics Narration',
      subtitle: 'melodysheep',
      thumbnailUrl: getVideoThumbnailUrl('sF80I-TQiW0'),
      metaRight: '30:27',
      tab: 'subscriptions',
    },
    {
      id: 'sub-kurzgesagt',
      videoId: 'TBikbn5XJhg',
      title: 'The History of the Universe in 1 Hour — Bedtime Science',
      subtitle: 'Kurzgesagt – In a Nutshell',
      thumbnailUrl: getVideoThumbnailUrl('TBikbn5XJhg'),
      metaRight: '1:02:14',
      tab: 'subscriptions',
    },
    {
      id: 'sub-lofigirl',
      videoId: 'rUxyKA_-grg',
      title: 'lofi hip hop radio - beats to relax/study to',
      subtitle: 'Lofi Girl',
      thumbnailUrl: getVideoThumbnailUrl('rUxyKA_-grg'),
      metaRight: 'LIVE',
      tab: 'subscriptions',
    },
    {
      id: 'sub-scenic',
      videoId: '1ZYbU82GVz4',
      title: 'Flying Over Norway (4K UHD) - Relaxing Ambient Nature',
      subtitle: 'Scenic Relaxation',
      thumbnailUrl: getVideoThumbnailUrl('1ZYbU82GVz4'),
      metaRight: '3:01:28',
      tab: 'subscriptions',
    },
  ],
  liked: [
    {
      id: 'liked-timelapse',
      videoId: 'uD4izuDMUQA',
      title: 'TIMELAPSE OF THE FUTURE: A Journey to the End of Time (4K)',
      subtitle: 'melodysheep',
      thumbnailUrl: getVideoThumbnailUrl('uD4izuDMUQA'),
      metaRight: '29:21',
      tab: 'liked',
    },
    {
      id: 'liked-chilled',
      videoId: '5qap5aO4i9A',
      title: 'Late Night Lofi Chill Instrumental Beats for Deep Sleep',
      subtitle: 'ChilledCow Acoustic',
      thumbnailUrl: getVideoThumbnailUrl('5qap5aO4i9A'),
      metaRight: '1:45:00',
      tab: 'liked',
    },
    {
      id: 'liked-rain',
      videoId: 'eKFTSSKCzWA',
      title: 'Relaxing Rain Sounds for Sleeping & Dark Screen Night Ambience',
      subtitle: 'The Relaxed Guy',
      thumbnailUrl: getVideoThumbnailUrl('eKFTSSKCzWA'),
      metaRight: '2:30:00',
      tab: 'liked',
    },
    {
      id: 'liked-chillhop',
      videoId: '7NOSDKb0HlU',
      title: 'Chillhop Essentials — Mellow Nighttime Instrumental Stream',
      subtitle: 'Chillhop Music',
      thumbnailUrl: getVideoThumbnailUrl('7NOSDKb0HlU'),
      metaRight: '1:18:40',
      tab: 'liked',
    },
  ],
};

export interface RawYouTubePlaylistApiItem {
  id?: string;
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
  contentDetails?: {
    itemCount?: number;
  };
}

export interface RawYouTubeSubscriptionApiItem {
  id?: string;
  snippet?: {
    title?: string;
    description?: string;
    resourceId?: {
      channelId?: string;
    };
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
  contentDetails?: {
    totalItemCount?: number;
  };
}

export interface RawYouTubeLikedVideoApiItem {
  id?: string;
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
  contentDetails?: {
    duration?: string;
  };
}

const FALLBACK_PLAYABLE_VIDEO_IDS = [
  'uD4izuDMUQA',
  'DWcJFNfaw9c',
  'TBikbn5XJhg',
  '5qap5aO4i9A',
  '1ZYbU82GVz4',
  'eKFTSSKCzWA',
  'rUxyKA_-grg',
  'sF80I-TQiW0',
];

export function mapPlaylistsApiResponse(
  items: RawYouTubePlaylistApiItem[]
): PersonalYouTubeItem[] {
  return items
    .filter((item) => Boolean(item?.id))
    .map((item, idx) => {
      const playlistId = item.id!;
      const fallbackVideoId =
        FALLBACK_PLAYABLE_VIDEO_IDS[idx % FALLBACK_PLAYABLE_VIDEO_IDS.length];
      const count = item.contentDetails?.itemCount ?? 0;
      const title = decodeHtmlEntities(
        item.snippet?.title?.trim() || 'Untitled Playlist'
      );
      const thumb =
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        getVideoThumbnailUrl(fallbackVideoId);

      return {
        id: `pl-${playlistId}`,
        videoId: fallbackVideoId,
        playlistId,
        title,
        subtitle: `Saved Playlist · ${count} videos`,
        thumbnailUrl: thumb,
        metaRight: `${count} tracks`,
        tab: 'playlists' as const,
      };
    });
}

export function mapSubscriptionsApiResponse(
  items: RawYouTubeSubscriptionApiItem[]
): PersonalYouTubeItem[] {
  return items
    .filter((item) => Boolean(item?.id))
    .map((item, idx) => {
      const subId = item.id!;
      const fallbackVideoId =
        FALLBACK_PLAYABLE_VIDEO_IDS[idx % FALLBACK_PLAYABLE_VIDEO_IDS.length];
      const channelTitle = decodeHtmlEntities(
        item.snippet?.title?.trim() || 'Subscribed Channel'
      );
      const count = item.contentDetails?.totalItemCount;
      const thumb =
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        getVideoThumbnailUrl(fallbackVideoId);

      return {
        id: `sub-${subId}`,
        videoId: fallbackVideoId,
        title: `${channelTitle} — Featured Sleep Stream`,
        subtitle: channelTitle,
        thumbnailUrl: thumb,
        metaRight: count ? `${count} videos` : 'Channel',
        tab: 'subscriptions' as const,
      };
    });
}

export function mapLikedVideosApiResponse(
  items: RawYouTubeLikedVideoApiItem[]
): PersonalYouTubeItem[] {
  return items
    .filter((item) => Boolean(item?.id))
    .map((item) => {
      const videoId = item.id!;
      const title = decodeHtmlEntities(
        item.snippet?.title?.trim() || 'Liked Video'
      );
      const channelTitle = decodeHtmlEntities(
        item.snippet?.channelTitle?.trim() || 'YouTube Channel'
      );
      const thumb =
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        getVideoThumbnailUrl(videoId);

      return {
        id: `liked-${videoId}`,
        videoId,
        title,
        subtitle: channelTitle,
        thumbnailUrl: thumb,
        metaRight: parseIsoDuration(item.contentDetails?.duration),
        tab: 'liked' as const,
      };
    });
}

/**
 * Fetches the authenticated user's Saved Playlists, Channel Subscriptions, and Liked Videos
 * from the YouTube Data API v3 using `mine=true` and `Bearer <accessToken>`.
 */
export async function fetchPersonalYouTubeFeeds(
  accessToken: string,
  options?: { isDemoToken?: boolean; signal?: AbortSignal }
): Promise<Record<PersonalFeedTab, PersonalYouTubeItem[]>> {
  if (!accessToken || options?.isDemoToken) {
    return DEMO_PERSONAL_FEEDS;
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  };

  const [playlistsRes, subsRes, likedRes] = await Promise.all([
    fetch(
      'https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=8',
      { headers, signal: options?.signal }
    ),
    fetch(
      'https://www.googleapis.com/youtube/v3/subscriptions?part=snippet,contentDetails&mine=true&maxResults=8',
      { headers, signal: options?.signal }
    ),
    fetch(
      'https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&myRating=like&mine=true&maxResults=8',
      { headers, signal: options?.signal }
    ),
  ]);

  if (
    playlistsRes.status === 401 ||
    subsRes.status === 401 ||
    likedRes.status === 401
  ) {
    throw new Error('Google OAuth token expired or unauthorized (401). Please sign in again.');
  }

  const playlistsJson = playlistsRes.ok
    ? ((await playlistsRes.json()) as { items?: RawYouTubePlaylistApiItem[] })
    : { items: [] };
  const subsJson = subsRes.ok
    ? ((await subsRes.json()) as { items?: RawYouTubeSubscriptionApiItem[] })
    : { items: [] };
  const likedJson = likedRes.ok
    ? ((await likedRes.json()) as { items?: RawYouTubeLikedVideoApiItem[] })
    : { items: [] };

  const mappedPlaylists = mapPlaylistsApiResponse(playlistsJson.items ?? []);
  const mappedSubs = mapSubscriptionsApiResponse(subsJson.items ?? []);
  const mappedLiked = mapLikedVideosApiResponse(likedJson.items ?? []);

  return {
    playlists:
      mappedPlaylists.length > 0 ? mappedPlaylists : DEMO_PERSONAL_FEEDS.playlists,
    subscriptions:
      mappedSubs.length > 0 ? mappedSubs : DEMO_PERSONAL_FEEDS.subscriptions,
    liked: mappedLiked.length > 0 ? mappedLiked : DEMO_PERSONAL_FEEDS.liked,
  };
}

export function loadAuthSessionFromStorage(
  storage: Pick<Storage, 'getItem' | 'removeItem'> | null | undefined
): GoogleAuthSession | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GoogleAuthSession;
    if (
      !parsed ||
      typeof parsed.accessToken !== 'string' ||
      !parsed.accessToken ||
      typeof parsed.expiresAt !== 'number'
    ) {
      return null;
    }
    if (Date.now() >= parsed.expiresAt) {
      storage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveAuthSessionToStorage(
  storage: Pick<Storage, 'setItem'> | null | undefined,
  session: GoogleAuthSession
): void {
  if (!storage) return;
  try {
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage errors
  }
}

export function clearAuthSessionFromStorage(
  storage: Pick<Storage, 'removeItem'> | null | undefined
): void {
  if (!storage) return;
  try {
    storage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
