import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseYouTubeInput,
  getBestQualityLevel,
  formatQualityLabel,
} from './youtube';

test('parseYouTubeInput parses standard watch URLs', () => {
  const res = parseYouTubeInput('https://www.youtube.com/watch?v=jfKfPfyJRdk&t=12s');
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.media.kind, 'video');
    assert.equal(res.media.videoId, 'jfKfPfyJRdk');
    assert.equal(res.media.canonicalUrl, 'https://www.youtube.com/watch?v=jfKfPfyJRdk');
    assert.equal(res.media.thumbnailUrl, 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg');
  }
});

test('parseYouTubeInput parses youtu.be short URLs and shorts/live URLs', () => {
  const shortRes = parseYouTubeInput('https://youtu.be/udAlOSn4yFg?si=abc');
  assert.equal(shortRes.ok, true);
  if (shortRes.ok) {
    assert.equal(shortRes.media.kind, 'video');
    assert.equal(shortRes.media.videoId, 'udAlOSn4yFg');
  }

  const shortsRes = parseYouTubeInput('youtube.com/shorts/abc123DEF45');
  assert.equal(shortsRes.ok, true);
  if (shortsRes.ok) {
    assert.equal(shortsRes.media.kind, 'video');
    assert.equal(shortsRes.media.videoId, 'abc123DEF45');
  }
});

test('parseYouTubeInput parses playlist URLs and watch+playlist URLs', () => {
  const playlistRes = parseYouTubeInput(
    'https://www.youtube.com/playlist?list=PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i'
  );
  assert.equal(playlistRes.ok, true);
  if (playlistRes.ok) {
    assert.equal(playlistRes.media.kind, 'playlist');
    assert.equal(playlistRes.media.playlistId, 'PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i');
    assert.equal(playlistRes.media.videoId, undefined);
  }

  const watchListRes = parseYouTubeInput(
    'https://music.youtube.com/watch?v=jfKfPfyJRdk&list=PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i'
  );
  assert.equal(watchListRes.ok, true);
  if (watchListRes.ok) {
    assert.equal(watchListRes.media.kind, 'playlist');
    assert.equal(watchListRes.media.videoId, 'jfKfPfyJRdk');
    assert.equal(watchListRes.media.playlistId, 'PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i');
    assert.equal(watchListRes.media.thumbnailUrl, 'https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg');
  }
});

test('parseYouTubeInput rejects empty or non-YouTube URLs', () => {
  assert.equal(parseYouTubeInput('   ').ok, false);
  assert.equal(parseYouTubeInput('https://vimeo.com/123456').ok, false);
  assert.equal(parseYouTubeInput('not a url').ok, false);
});

test('getBestQualityLevel picks highest available quality', () => {
  assert.equal(getBestQualityLevel(['hd720', 'hd1080', 'large', 'auto']), 'hd1080');
  assert.equal(getBestQualityLevel(['hd2160', 'hd1440', 'hd1080']), 'hd2160');
  assert.equal(getBestQualityLevel([]), 'highres');
  assert.equal(formatQualityLabel('hd1080'), '1080p HD');
  assert.equal(formatQualityLabel('unknown'), 'Highest requested');
  assert.equal(formatQualityLabel(null), 'Highest requested');
});
