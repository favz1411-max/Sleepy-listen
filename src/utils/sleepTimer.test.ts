import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCustomMinutes,
  formatCountdown,
  calculateFadeVolume,
} from './sleepTimer';

test('validateCustomMinutes accepts valid integers and rejects invalid values', () => {
  assert.deepEqual(validateCustomMinutes('25'), { ok: true, minutes: 25 });
  assert.deepEqual(validateCustomMinutes(' 1 '), { ok: true, minutes: 1 });
  assert.equal(validateCustomMinutes('').ok, false);
  assert.equal(validateCustomMinutes('0').ok, false);
  assert.equal(validateCustomMinutes('-5').ok, false);
  assert.equal(validateCustomMinutes('12.5').ok, false);
  assert.equal(validateCustomMinutes('600').ok, false);
});

test('formatCountdown formats mm:ss and h:mm:ss cleanly', () => {
  assert.equal(formatCountdown(0), '00:00');
  assert.equal(formatCountdown(65), '01:05');
  assert.equal(formatCountdown(900), '15:00');
  assert.equal(formatCountdown(3600), '1:00:00');
  assert.equal(formatCountdown(3665), '1:01:05');
});

test('calculateFadeVolume linearly fades volume to 0 over 10 seconds', () => {
  assert.equal(calculateFadeVolume(80, 0, 10000), 80);
  assert.equal(calculateFadeVolume(80, 5000, 10000), 40);
  assert.equal(calculateFadeVolume(80, 9000, 10000), 8);
  assert.equal(calculateFadeVolume(80, 10000, 10000), 0);
  assert.equal(calculateFadeVolume(80, 12000, 10000), 0);
});
