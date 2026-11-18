import test from 'node:test';
import assert from 'node:assert/strict';
import {
  decodeHtmlEntities,
  mapYouTubeApiItems,
  parseIsoDuration,
  searchCuratedCatalog,
} from './youtubeSearch';

test('parseIsoDuration formats ISO 8601 YouTube durations accurately', () => {
  assert.equal(parseIsoDuration('PT29M21S'), '29:21');
  assert.equal(parseIsoDuration('PT1H02M05S'), '1:02:05');
  assert.equal(parseIsoDuration('PT45S'), '0:45');
  assert.equal(parseIsoDuration('P0D'), 'LIVE');
  assert.equal(parseIsoDuration('PT0S'), 'LIVE');
  assert.equal(parseIsoDuration(undefined), '--:--');
});

test('mapYouTubeApiItems maps search.list and videos.list responses with decoded titles and durations', () => {
  const mapped = mapYouTubeApiItems(
    [
      {
        id: { videoId: 'uD4izuDMUQA' },
        snippet: {
          title: 'TIMELAPSE OF THE FUTURE &amp; Beyond &#39;4K&#39;',
          channelTitle: 'melodysheep',
          thumbnails: {
            high: { url: 'https://i.ytimg.com/vi/uD4izuDMUQA/hqdefault.jpg' },
          },
        },
      },
    ],
    [
      {
        id: 'uD4izuDMUQA',
        contentDetails: {
          duration: 'PT29M21S',
        },
      },
    ]
  );

  assert.equal(mapped.length, 1);
  assert.equal(mapped[0].videoId, 'uD4izuDMUQA');
  assert.equal(mapped[0].title, "TIMELAPSE OF THE FUTURE & Beyond '4K'");
  assert.equal(mapped[0].channelTitle, 'melodysheep');
  assert.equal(mapped[0].duration, '29:21');
});

test('decodeHtmlEntities decodes standard entities', () => {
  assert.equal(decodeHtmlEntities('Science &amp; Sleep &quot;4K&quot;'), 'Science & Sleep "4K"');
});

test('searchCuratedCatalog filters by query and category', () => {
  const scienceOnly = searchCuratedCatalog('', 'Science');
  assert.equal(scienceOnly.length > 0, true);
  assert.equal(scienceOnly.every((v) => v.category === 'Science'), true);

  const melodyResults = searchCuratedCatalog('melodysheep', 'All');
  assert.equal(melodyResults.length, 2);

  const noMatch = searchCuratedCatalog('nonexistent-xyz-999', 'All');
  assert.equal(noMatch.length, 0);
});
