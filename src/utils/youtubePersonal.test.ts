import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clearAuthSessionFromStorage,
  loadAuthSessionFromStorage,
  mapLikedVideosApiResponse,
  mapPlaylistsApiResponse,
  mapSubscriptionsApiResponse,
  saveAuthSessionToStorage,
} from './youtubePersonal';

test('mapPlaylistsApiResponse maps mine=true playlists into playable items', () => {
  const mapped = mapPlaylistsApiResponse([
    {
      id: 'PL1234567890',
      snippet: {
        title: 'Astronomy &amp; Sleep',
        thumbnails: { high: { url: 'https://i.ytimg.com/vi/uD4izuDMUQA/hqdefault.jpg' } },
      },
      contentDetails: { itemCount: 12 },
    },
  ]);

  assert.equal(mapped.length, 1);
  assert.equal(mapped[0].playlistId, 'PL1234567890');
  assert.equal(mapped[0].title, 'Astronomy & Sleep');
  assert.equal(mapped[0].metaRight, '12 tracks');
  assert.equal(mapped[0].tab, 'playlists');
});

test('mapSubscriptionsApiResponse maps mine=true subscriptions into playable items', () => {
  const mapped = mapSubscriptionsApiResponse([
    {
      id: 'sub-abc',
      snippet: {
        title: 'Kurzgesagt',
      },
      contentDetails: { totalItemCount: 195 },
    },
  ]);

  assert.equal(mapped.length, 1);
  assert.equal(mapped[0].subtitle, 'Kurzgesagt');
  assert.equal(mapped[0].metaRight, '195 videos');
  assert.equal(mapped[0].tab, 'subscriptions');
});

test('mapLikedVideosApiResponse maps liked videos with formatted ISO durations', () => {
  const mapped = mapLikedVideosApiResponse([
    {
      id: 'uD4izuDMUQA',
      snippet: {
        title: 'TIMELAPSE OF THE FUTURE',
        channelTitle: 'melodysheep',
      },
      contentDetails: {
        duration: 'PT29M21S',
      },
    },
  ]);

  assert.equal(mapped.length, 1);
  assert.equal(mapped[0].videoId, 'uD4izuDMUQA');
  assert.equal(mapped[0].metaRight, '29:21');
  assert.equal(mapped[0].tab, 'liked');
});

test('auth session storage saves, loads, and expires tokens cleanly', () => {
  const map = new Map<string, string>();
  const mockStorage = {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
  };

  saveAuthSessionToStorage(mockStorage, {
    accessToken: 'ya29.test-token',
    userName: 'Night Listener',
    userEmail: 'listener@example.com',
    expiresAt: Date.now() + 60_000,
  });

  const loaded = loadAuthSessionFromStorage(mockStorage);
  assert.equal(loaded?.accessToken, 'ya29.test-token');

  clearAuthSessionFromStorage(mockStorage);
  assert.equal(loadAuthSessionFromStorage(mockStorage), null);
});
