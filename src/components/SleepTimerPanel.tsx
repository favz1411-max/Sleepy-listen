import { FormEvent, useState } from 'react';
import { Clock, RotateCcw } from 'lucide-react';
import { SleepTimerStatus } from '../hooks/useSleepTimer';
import {
  FADE_DURATION_SECONDS,
  formatCountdown,
  TIMER_PRESETS_MINUTES,
  validateCustomMinutes,
} from '../utils/sleepTimer';

interface SleepTimerPanelProps {
  status: SleepTimerStatus;
  selectedMinutes: number | null;
  remainingSeconds: number;
  fadeSecondsLeft: number;
  onStartTimer: (minutes: number) => void;
  onCancelTimer: () => void;
}

export function SleepTimerPanel({
  status,
  selectedMinutes,
  remainingSeconds,
  fadeSecondsLeft,
  onStartTimer,
  onCancelTimer,
}: SleepTimerPanelProps) {
  const [customInput, setCustomInput] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);

  const handleCustomSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validation = validateCustomMinutes(customInput);
    if (!validation.ok) {
      setCustomError(validation.error);
      return;
    }
    setCustomError(null);
    onStartTimer(validation.minutes);
  };

  const isRunning = status === 'counting' || status === 'fading';

  return (
    <section
      aria-label="Sleep Timer"
      className="bg-[#0e1219] border border-white/[0.07] rounded-2xl p-4 sm:p-5 space-y-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-[#94a3b8]">
            <Clock className="w-4 h-4 text-[#e5a95c]" aria-hidden="true" />
            <h2>Sleep Timer</h2>
          </div>
          <p className="mt-1 text-xs text-[#7c8ba1]">
            Fades volume out over {FADE_DURATION_SECONDS} seconds, then pauses playback.
          </p>
        </div>

        {isRunning && (
          <button
            type="button"
            onClick={onCancelTimer}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#161d29] hover:bg-[#1e2738] active:scale-[0.98] border border-white/[0.09] text-sm font-medium text-[#cbd5e1] flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c]"
          >
            <RotateCcw className="w-4 h-4 text-[#94a3b8]" aria-hidden="true" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      {/* Countdown Readout */}
      <div
        aria-live="polite"
        data-testid="sleep-timer-readout"
        className="rounded-xl bg-[#07090d] border border-white/[0.06] px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
      >
        <div>
          <div className="text-xs text-[#7c8ba1]">
            {status === 'idle' && 'No timer active'}
            {status === 'counting' && `Time remaining (${selectedMinutes} min)`}
            {status === 'fading' && 'Fading volume out'}
            {status === 'completed' && 'Sleep timer ended · Video paused'}
          </div>
          <div
            className={`mt-1 font-mono tabular-nums text-3xl sm:text-4xl font-semibold tracking-tight ${
              status === 'fading'
                ? 'text-[#f3c47d]'
                : status === 'counting'
                ? 'text-[#e2e8f0]'
                : 'text-[#64748b]'
            }`}
          >
            {status === 'counting' && formatCountdown(remainingSeconds)}
            {status === 'fading' && `00:${String(fadeSecondsLeft).padStart(2, '0')}`}
            {(status === 'idle' || status === 'completed') && '00:00'}
          </div>
        </div>

        {status === 'fading' && (
          <div className="sm:text-right">
            <p className="text-sm font-medium text-[#e5a95c]">
              Lowering volume... {fadeSecondsLeft}s
            </p>
            <div className="mt-2 w-full sm:w-40 h-1.5 rounded-full bg-[#161d29] overflow-hidden">
              <div
                className="h-full bg-[#e5a95c] transition-all duration-100"
                style={{
                  width: `${Math.max(0, Math.min(100, (fadeSecondsLeft / FADE_DURATION_SECONDS) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 4 Large Preset Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TIMER_PRESETS_MINUTES.map((mins) => {
          const isActive = isRunning && selectedMinutes === mins;
          return (
            <button
              key={mins}
              type="button"
              onClick={() => {
                setCustomError(null);
                onStartTimer(mins);
              }}
              aria-pressed={isActive}
              className={`min-h-[52px] px-4 py-3 rounded-xl border text-base font-medium tabular-nums transition-colors active:scale-[0.98] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c] ${
                isActive
                  ? 'bg-[#e5a95c] border-[#e5a95c] text-[#090c11] font-semibold'
                  : 'bg-[#141a24] border-white/[0.08] text-[#cbd5e1] hover:bg-[#1b2330]'
              }`}
            >
              {mins} min
            </button>
          );
        })}
      </div>

      {/* Custom Minutes Input */}
      <form onSubmit={handleCustomSubmit} noValidate className="space-y-2">
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="custom-minutes-input" className="sr-only">
              Custom timer minutes
            </label>
            <input
              id="custom-minutes-input"
              type="number"
              inputMode="numeric"
              min={1}
              max={480}
              step={1}
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                if (customError) setCustomError(null);
              }}
              placeholder="Custom minutes (1–480)"
              aria-invalid={Boolean(customError)}
              aria-describedby={customError ? 'custom-timer-error' : undefined}
              className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#07090d] border border-white/[0.09] text-base text-[#e2e8f0] placeholder:text-[#64748b] tabular-nums focus:outline-none focus:border-[#e5a95c]/70 focus:ring-1 focus:ring-[#e5a95c]/70"
            />
          </div>
          <button
            type="submit"
            className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#161d29] hover:bg-[#1e2738] active:scale-[0.98] border border-white/[0.09] text-base font-medium text-[#e2e8f0] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c]"
          >
            Set Timer
          </button>
        </div>
        {customError && (
          <p id="custom-timer-error" role="alert" className="text-sm text-[#f87171] pl-1">
            {customError}
          </p>
        )}
      </form>
    </section>
  );
}
