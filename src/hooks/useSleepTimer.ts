import { useCallback, useEffect, useRef, useState } from 'react';
import {
  calculateFadeVolume,
  FADE_DURATION_SECONDS,
} from '../utils/sleepTimer';

export type SleepTimerStatus = 'idle' | 'counting' | 'fading' | 'completed';

export interface UseSleepTimerOptions {
  getVolume: () => number;
  setVolume: (volume: number) => void;
  pauseVideo: () => void;
}

export interface UseSleepTimerResult {
  status: SleepTimerStatus;
  selectedMinutes: number | null;
  remainingSeconds: number;
  fadeSecondsLeft: number;
  startTimer: (minutes: number) => void;
  cancelTimer: () => void;
  restoreVolumeAfterSleep: () => void;
}

export function useSleepTimer({
  getVolume,
  setVolume,
  pauseVideo,
}: UseSleepTimerOptions): UseSleepTimerResult {
  const [status, setStatus] = useState<SleepTimerStatus>('idle');
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [fadeSecondsLeft, setFadeSecondsLeft] = useState<number>(FADE_DURATION_SECONDS);

  const endTimestampRef = useRef<number>(0);
  const fadeStartRef = useRef<number>(0);
  const preFadeVolumeRef = useRef<number>(80);
  const fadedToZeroRef = useRef<boolean>(false);

  const getVolumeRef = useRef(getVolume);
  const setVolumeRef = useRef(setVolume);
  const pauseVideoRef = useRef(pauseVideo);

  useEffect(() => {
    getVolumeRef.current = getVolume;
    setVolumeRef.current = setVolume;
    pauseVideoRef.current = pauseVideo;
  }, [getVolume, setVolume, pauseVideo]);

  const startFadeOut = useCallback(() => {
    const startVol = getVolumeRef.current();
    preFadeVolumeRef.current = startVol > 0 ? startVol : 80;
    fadeStartRef.current = Date.now();
    setFadeSecondsLeft(FADE_DURATION_SECONDS);
    setRemainingSeconds(0);
    setStatus('fading');
  }, []);

  useEffect(() => {
    if (status !== 'counting') return;

    const tick = () => {
      const msLeft = endTimestampRef.current - Date.now();
      if (msLeft <= 0) {
        startFadeOut();
        return true;
      }
      setRemainingSeconds(Math.ceil(msLeft / 1000));
      return false;
    };

    const interval = window.setInterval(() => {
      if (tick()) {
        window.clearInterval(interval);
      }
    }, 250);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [status, startFadeOut]);

  useEffect(() => {
    if (status !== 'fading') return;

    const durationMs = FADE_DURATION_SECONDS * 1000;
    const tickFade = () => {
      const elapsed = Date.now() - fadeStartRef.current;
      const nextVolume = calculateFadeVolume(
        preFadeVolumeRef.current,
        elapsed,
        durationMs
      );
      setVolumeRef.current(nextVolume);

      const secondsLeft = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      setFadeSecondsLeft(secondsLeft);

      if (elapsed >= durationMs) {
        setVolumeRef.current(0);
        pauseVideoRef.current();
        fadedToZeroRef.current = true;
        setFadeSecondsLeft(0);
        setStatus('completed');
        return true;
      }
      return false;
    };

    const interval = window.setInterval(() => {
      if (tickFade()) {
        window.clearInterval(interval);
      }
    }, 100);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        tickFade();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [status]);

  const startTimer = useCallback((minutes: number) => {
    const clampedMinutes = Math.max(1, Math.round(minutes));
    if (fadedToZeroRef.current) {
      setVolumeRef.current(preFadeVolumeRef.current);
      fadedToZeroRef.current = false;
    }
    const totalSeconds = clampedMinutes * 60;
    endTimestampRef.current = Date.now() + totalSeconds * 1000;
    setSelectedMinutes(clampedMinutes);
    setRemainingSeconds(totalSeconds);
    setFadeSecondsLeft(FADE_DURATION_SECONDS);
    setStatus('counting');
  }, []);

  const cancelTimer = useCallback(() => {
    if (status === 'fading') {
      setVolumeRef.current(preFadeVolumeRef.current);
    }
    setStatus('idle');
    setSelectedMinutes(null);
    setRemainingSeconds(0);
    setFadeSecondsLeft(FADE_DURATION_SECONDS);
  }, [status]);

  const restoreVolumeAfterSleep = useCallback(() => {
    if (fadedToZeroRef.current || status === 'completed') {
      setVolumeRef.current(preFadeVolumeRef.current);
      fadedToZeroRef.current = false;
      if (status === 'completed') {
        setStatus('idle');
        setSelectedMinutes(null);
      }
    }
  }, [status]);

  return {
    status,
    selectedMinutes,
    remainingSeconds,
    fadeSecondsLeft,
    startTimer,
    cancelTimer,
    restoreVolumeAfterSleep,
  };
}
