import { YouTubeMediaKind } from './youtube';

export type FavoriteFolder = 'Science' | 'Songs';

export const FAVORITE_FOLDERS: FavoriteFolder[] = ['Science', 'Songs'];
export const FAVORITES_STORAGE_KEY = 'sleep_player_favorites_v1';
export const SETTINGS_STORAGE_KEY = 'sleep_player_settings_v1';

export interface FavoriteItem {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  url: string;
  kind: YouTubeMediaKind;
  videoId?: string;
  playlistId?: string;
  folder: FavoriteFolder;
  createdAt: number;
}

export interface NewFavoriteInput {
  title: string;
  thumbnailUrl: string | null;
  url: string;
  kind: YouTubeMediaKind;
  videoId?: string;
  playlistId?: string;
  folder: FavoriteFolder;
}

export interface SleepPlayerSettings {
  defaultFolder: FavoriteFolder;
  dimPlayerVideo: boolean;
  backgroundPlayback: boolean;
}

export const DEFAULT_SETTINGS: SleepPlayerSettings = {
  defaultFolder: 'Science',
  dimPlayerVideo: false,
  backgroundPlayback: true,
};

export const STARTER_FAVORITES: FavoriteItem[] = [
  {
    id: 'starter-science-1',
    title: 'Timelapse of the Future: A Journey to the End of Time',
    thumbnailUrl: 'https://i.ytimg.com/vi/uD4izuDMUQA/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=uD4izuDMUQA',
    kind: 'video',
    videoId: 'uD4izuDMUQA',
    folder: 'Science',
    createdAt: 1700000000000,
  },
  {
    id: 'starter-songs-1',
    title: 'Lofi Hip Hop Radio — Beats to Relax / Sleep',
    thumbnailUrl: 'https://i.ytimg.com/vi/DWcJFNfaw9c/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=DWcJFNfaw9c',
    kind: 'video',
    videoId: 'DWcJFNfaw9c',
    folder: 'Songs',
    createdAt: 1700000001000,
  },
];

export function normalizeMediaKey(item: {
  url: string;
  kind: YouTubeMediaKind;
  videoId?: string;
  playlistId?: string;
}): string {
  if (item.kind === 'playlist' && item.playlistId) {
    return `playlist:${item.playlistId}`;
  }
  if (item.videoId) {
    return `video:${item.videoId}`;
  }
  return `url:${item.url.trim()}`;
}

export function findFavoriteForMedia(
  list: FavoriteItem[],
  media: {
    url: string;
    kind: YouTubeMediaKind;
    videoId?: string;
    playlistId?: string;
  }
): FavoriteItem | undefined {
  const targetKey = normalizeMediaKey(media);
  return list.find((item) => normalizeMediaKey(item) === targetKey);
}

export function addOrUpdateFavorite(
  list: FavoriteItem[],
  input: NewFavoriteInput,
  now: number = Date.now()
): FavoriteItem[] {
  const cleanTitle = input.title.trim() || (input.kind === 'playlist' ? 'YouTube Playlist' : 'YouTube Video');
  const existing = findFavoriteForMedia(list, input);

  if (existing) {
    return list.map((item) =>
      item.id === existing.id
        ? {
            ...item,
            title: cleanTitle,
            thumbnailUrl: input.thumbnailUrl ?? item.thumbnailUrl,
            url: input.url,
            folder: input.folder,
          }
        : item
    );
  }

  const id = `fav-${now}-${Math.random().toString(36).slice(2, 7)}`;
  const newItem: FavoriteItem = {
    id,
    title: cleanTitle,
    thumbnailUrl: input.thumbnailUrl,
    url: input.url,
    kind: input.kind,
    videoId: input.videoId,
    playlistId: input.playlistId,
    folder: input.folder,
    createdAt: now,
  };

  return [newItem, ...list];
}

export function removeFavorite(list: FavoriteItem[], id: string): FavoriteItem[] {
  return list.filter((item) => item.id !== id);
}

export function moveFavoriteFolder(
  list: FavoriteItem[],
  id: string,
  folder: FavoriteFolder
): FavoriteItem[] {
  return list.map((item) => (item.id === id ? { ...item, folder } : item));
}

export function filterFavoritesByFolder(
  list: FavoriteItem[],
  folder: FavoriteFolder
): FavoriteItem[] {
  return list.filter((item) => item.folder === folder);
}

export function loadFavoritesFromStorage(
  storage: Pick<Storage, 'getItem'> | null | undefined
): FavoriteItem[] {
  if (!storage) return STARTER_FAVORITES;
  try {
    const raw = storage.getItem(FAVORITES_STORAGE_KEY);
    if (raw === null) {
      return STARTER_FAVORITES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item): item is FavoriteItem =>
        Boolean(item) &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.url === 'string' &&
        (item.folder === 'Science' || item.folder === 'Songs') &&
        (item.kind === 'video' || item.kind === 'playlist')
    );
  } catch {
    return STARTER_FAVORITES;
  }
}

export function saveFavoritesToStorage(
  storage: Pick<Storage, 'setItem'> | null | undefined,
  list: FavoriteItem[]
): void {
  if (!storage) return;
  try {
    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function loadSettingsFromStorage(
  storage: Pick<Storage, 'getItem'> | null | undefined
): SleepPlayerSettings {
  if (!storage) return DEFAULT_SETTINGS;
  try {
    const raw = storage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      defaultFolder: parsed?.defaultFolder === 'Songs' ? 'Songs' : 'Science',
      dimPlayerVideo: Boolean(parsed?.dimPlayerVideo),
      backgroundPlayback:
        typeof parsed?.backgroundPlayback === 'boolean' ? parsed.backgroundPlayback : true,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettingsToStorage(
  storage: Pick<Storage, 'setItem'> | null | undefined,
  settings: SleepPlayerSettings
): void {
  if (!storage) return;
  try {
    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors cleanly
  }
}
