import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMediaSessionMetadataPayload,
  mapMediaSessionPlaybackState,
  shouldAttemptBackgroundResume,
} from './backgroundAudio';

test('shouldAttemptBackgroundResume allows resume only when backgrounded and intended playing', () => {
  assert.equal(
    shouldAttemptBackgroundResume({
      backgroundPlaybackEnabled: true,
      isDocumentHidden: true,
      intendedPlaying: true,
      isSleepTimerPaused: false,
      resumeAttemptsInWindow: 0,
    }),
    true
  );

  // Disabled in settings
  assert.equal(
    shouldAttemptBackgroundResume({
      backgroundPlaybackEnabled: false,
      isDocumentHidden: true,
      intendedPlaying: true,
      isSleepTimerPaused: false,
      resumeAttemptsInWindow: 0,
    }),
    false
  );

  // User explicitly paused
  assert.equal(
    shouldAttemptBackgroundResume({
      backgroundPlaybackEnabled: true,
      isDocumentHidden: true,
      intendedPlaying: false,
      isSleepTimerPaused: false,
      resumeAttemptsInWindow: 0,
    }),
    false
  );

  // Sleep timer paused playback
  assert.equal(
    shouldAttemptBackgroundResume({
      backgroundPlaybackEnabled: true,
      isDocumentHidden: true,
      intendedPlaying: true,
      isSleepTimerPaused: true,
      resumeAttemptsInWindow: 0,
    }),
    false
  );

  // Foreground tab should not force auto-resume
  assert.equal(
    shouldAttemptBackgroundResume({
      backgroundPlaybackEnabled: true,
      isDocumentHidden: false,
      intendedPlaying: true,
      isSleepTimerPaused: false,
      resumeAttemptsInWindow: 0,
    }),
    false
  );

  // Guard against infinite retry loops
  assert.equal(
    shouldAttemptBackgroundResume({
      backgroundPlaybackEnabled: true,
      isDocumentHidden: true,
      intendedPlaying: true,
      isSleepTimerPaused: false,
      resumeAttemptsInWindow: 3,
    }),
    false
  );
});

test('mapMediaSessionPlaybackState maps player state cleanly', () => {
  assert.equal(mapMediaSessionPlaybackState(false, false), 'none');
  assert.equal(mapMediaSessionPlaybackState(true, true), 'playing');
  assert.equal(mapMediaSessionPlaybackState(false, true), 'paused');
});

test('buildMediaSessionMetadataPayload includes title, Sleep Player artist, and artwork', () => {
  const payload = buildMediaSessionMetadataPayload(
    {
      title: 'Deep Space Ambient',
      kind: 'video',
      thumbnailUrl: 'https://i.ytimg.com/vi/uD4izuDMUQA/hqdefault.jpg',
    },
    'Science'
  );

  assert.equal(payload.title, 'Deep Space Ambient');
  assert.equal(payload.artist, 'Sleep Player');
  assert.equal(payload.album, 'Favorites · Science');
  assert.equal(payload.artwork.length, 1);
  assert.equal(payload.artwork[0].src, 'https://i.ytimg.com/vi/uD4izuDMUQA/hqdefault.jpg');
});
