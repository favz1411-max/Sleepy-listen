export const TIMER_PRESETS_MINUTES = [15, 30, 45, 60] as const;
export const FADE_DURATION_SECONDS = 10;
export const MAX_TIMER_MINUTES = 480;

export type CustomMinutesResult =
  | { ok: true; minutes: number }
  | { ok: false; error: string };

export function validateCustomMinutes(raw: string): CustomMinutesResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: 'Enter a number of minutes.' };
  }

  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, error: 'Enter whole minutes (e.g., 20).' };
  }

  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return { ok: false, error: 'Timer must be at least 1 minute.' };
  }

  if (parsed > MAX_TIMER_MINUTES) {
    return { ok: false, error: `Maximum timer is ${MAX_TIMER_MINUTES} minutes.` };
  }

  return { ok: true, minutes: parsed };
}

export function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, Math.ceil(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(minutes)}:${pad(seconds)}`;
}

export function calculateFadeVolume(
  startVolume: number,
  elapsedMs: number,
  durationMs: number = FADE_DURATION_SECONDS * 1000
): number {
  const safeStart = Math.min(100, Math.max(0, startVolume));
  if (durationMs <= 0 || elapsedMs >= durationMs) {
    return 0;
  }
  if (elapsedMs <= 0) {
    return Math.round(safeStart);
  }
  const progress = elapsedMs / durationMs;
  const remaining = 1 - progress;
  return Math.max(0, Math.min(100, Math.round(safeStart * remaining)));
}
