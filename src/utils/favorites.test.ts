import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addOrUpdateFavorite,
  removeFavorite,
  moveFavoriteFolder,
  filterFavoritesByFolder,
  loadFavoritesFromStorage,
  saveFavoritesToStorage,
  FAVORITES_STORAGE_KEY,
  STARTER_FAVORITES,
} from './favorites';

test('addOrUpdateFavorite adds and deduplicates by media key', () => {
  const initial = addOrUpdateFavorite([], {
    title: 'Deep Sleep Physics',
    thumbnailUrl: 'https://i.ytimg.com/vi/udAlOSn4yFg/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=udAlOSn4yFg',
    kind: 'video',
    videoId: 'udAlOSn4yFg',
    folder: 'Science',
  }, 1000);

  assert.equal(initial.length, 1);
  assert.equal(initial[0].folder, 'Science');

  // Re-starring same video moves/updates rather than duplicating
  const updated = addOrUpdateFavorite(initial, {
    title: 'Deep Sleep Physics (Edited)',
    thumbnailUrl: 'https://i.ytimg.com/vi/udAlOSn4yFg/hqdefault.jpg',
    url: 'https://www.youtube.com/watch?v=udAlOSn4yFg',
    kind: 'video',
    videoId: 'udAlOSn4yFg',
    folder: 'Songs',
  }, 2000);

  assert.equal(updated.length, 1);
  assert.equal(updated[0].folder, 'Songs');
  assert.equal(updated[0].title, 'Deep Sleep Physics (Edited)');
});

test('moveFavoriteFolder, filterFavoritesByFolder, and removeFavorite work as expected', () => {
  const moved = moveFavoriteFolder(STARTER_FAVORITES, 'starter-science-1', 'Songs');
  assert.equal(filterFavoritesByFolder(moved, 'Science').length, 0);
  assert.equal(filterFavoritesByFolder(moved, 'Songs').length, 2);

  const removed = removeFavorite(moved, 'starter-songs-1');
  assert.equal(removed.length, 1);
  assert.equal(removed[0].id, 'starter-science-1');
});

test('favorites persist in storage and preserve intentionally empty list', () => {
  const store = new Map<string, string>();
  const mockStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
  };

  // First visit returns starter items
  const firstLoad = loadFavoritesFromStorage(mockStorage);
  assert.equal(firstLoad.length, STARTER_FAVORITES.length);

  // Saving empty list persists empty list
  saveFavoritesToStorage(mockStorage, []);
  assert.equal(store.get(FAVORITES_STORAGE_KEY), '[]');
  assert.deepEqual(loadFavoritesFromStorage(mockStorage), []);
});
