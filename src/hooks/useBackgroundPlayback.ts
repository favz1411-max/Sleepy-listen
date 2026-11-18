import { useCallback, useEffect, useRef } from 'react';
import { ActiveMediaState } from './useYouTubePlayer';
import {
  buildMediaSessionMetadataPayload,
  mapMediaSessionPlaybackState,
  shouldAttemptBackgroundResume,
} from '../utils/backgroundAudio';

export interface UseBackgroundPlaybackOptions {
  enabled: boolean;
  activeMedia: ActiveMediaState | null;
  favoriteFolder?: string;
  isPlaying: boolean;
  intendedPlaying: boolean;
  isSleepTimerPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNextTrack?: () => void;
  onPreviousTrack?: () => void;
  onForegroundReturn?: () => void;
}

export interface UseBackgroundPlaybackResult {
  activateAudioSession: () => void;
  suspendAudioSession: () => void;
  notifyBackgroundPaused: () => void;
}

export function useBackgroundPlayback({
  enabled,
  activeMedia,
  favoriteFolder,
  isPlaying,
  intendedPlaying,
  isSleepTimerPaused,
  onPlay,
  onPause,
  onNextTrack,
  onPreviousTrack,
  onForegroundReturn,
}: UseBackgroundPlaybackOptions): UseBackgroundPlaybackResult {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceStartedRef = useRef(false);
  const resumeAttemptsRef = useRef(0);

  const onPlayRef = useRef(onPlay);
  const onPauseRef = useRef(onPause);
  const onNextTrackRef = useRef(onNextTrack);
  const onPreviousTrackRef = useRef(onPreviousTrack);
  const onForegroundReturnRef = useRef(onForegroundReturn);

  useEffect(() => {
    onPlayRef.current = onPlay;
    onPauseRef.current = onPause;
    onNextTrackRef.current = onNextTrack;
    onPreviousTrackRef.current = onPreviousTrack;
    onForegroundReturnRef.current = onForegroundReturn;
  }, [onPlay, onPause, onNextTrack, onPreviousTrack, onForegroundReturn]);

  const activateAudioSession = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;

      if (!sourceStartedRef.current) {
        const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const gain = ctx.createGain();
        gain.gain.value = 0.0001;

        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(0);
        sourceStartedRef.current = true;
      }

      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
    } catch {
      // Ignore Web Audio restrictions in environments without audio devices
    }
  }, [enabled]);

  const suspendAudioSession = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      if (ctx.state === 'running') {
        void ctx.suspend();
      }
    } catch {
      // Ignore suspend errors
    }
  }, []);

  const notifyBackgroundPaused = useCallback(() => {
    const isHidden =
      typeof document !== 'undefined' && document.visibilityState === 'hidden';
    if (
      shouldAttemptBackgroundResume({
        backgroundPlaybackEnabled: enabled,
        isDocumentHidden: isHidden,
        intendedPlaying,
        isSleepTimerPaused,
        resumeAttemptsInWindow: resumeAttemptsRef.current,
      })
    ) {
      resumeAttemptsRef.current += 1;
      activateAudioSession();
      onPlayRef.current();
    }
  }, [enabled, intendedPlaying, isSleepTimerPaused, activateAudioSession]);

  // Suspend or activate audio session when settings or playback intent change
  useEffect(() => {
    if (!enabled || !intendedPlaying || isSleepTimerPaused) {
      suspendAudioSession();
    }
  }, [enabled, intendedPlaying, isSleepTimerPaused, suspendAudioSession]);

  // Clean up AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try {
          void audioCtxRef.current.close();
        } catch {
          // ignore
        }
        audioCtxRef.current = null;
        sourceStartedRef.current = false;
      }
    };
  }, []);

  // Sync Media Session API metadata & playback state for OS lock-screen controls
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    const mediaSession = navigator.mediaSession;
    try {
      if (activeMedia && typeof window !== 'undefined' && 'MediaMetadata' in window) {
        const payload = buildMediaSessionMetadataPayload(activeMedia, favoriteFolder);
        mediaSession.metadata = new window.MediaMetadata(payload);
      } else {
        mediaSession.metadata = null;
      }

      mediaSession.playbackState = mapMediaSessionPlaybackState(
        isPlaying,
        Boolean(activeMedia)
      );
    } catch {
      // Ignore browsers with partial MediaSession support
    }
  }, [activeMedia, favoriteFolder, isPlaying]);

  // Register OS lock-screen / notification media action handlers
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    const mediaSession = navigator.mediaSession;
    const isPlaylist = activeMedia?.kind === 'playlist';

    const setHandler = (
      action: MediaSessionAction,
      handler: MediaSessionActionHandler | null
    ) => {
      try {
        mediaSession.setActionHandler(action, handler);
      } catch {
        // Ignore unsupported MediaSessionAction in specific browsers
      }
    };

    if (!activeMedia) {
      setHandler('play', null);
      setHandler('pause', null);
      setHandler('stop', null);
      setHandler('nexttrack', null);
      setHandler('previoustrack', null);
      return;
    }

    setHandler('play', () => {
      activateAudioSession();
      onPlayRef.current();
    });
    setHandler('pause', () => {
      onPauseRef.current();
    });
    setHandler('stop', () => {
      onPauseRef.current();
    });
    setHandler(
      'nexttrack',
      isPlaylist && onNextTrackRef.current
        ? () => {
            onNextTrackRef.current?.();
          }
        : null
    );
    setHandler(
      'previoustrack',
      isPlaylist && onPreviousTrackRef.current
        ? () => {
            onPreviousTrackRef.current?.();
          }
        : null
    );

    return () => {
      setHandler('play', null);
      setHandler('pause', null);
      setHandler('stop', null);
      setHandler('nexttrack', null);
      setHandler('previoustrack', null);
    };
  }, [activeMedia, activateAudioSession]);

  // Reinforce background audio & reset retry counter across visibility transitions
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resumeAttemptsRef.current = 0;
        onForegroundReturnRef.current?.();
        return;
      }

      if (
        document.visibilityState === 'hidden' &&
        enabled &&
        intendedPlaying &&
        !isSleepTimerPaused
      ) {
        activateAudioSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, intendedPlaying, isSleepTimerPaused, activateAudioSession]);

  return {
    activateAudioSession,
    suspendAudioSession,
    notifyBackgroundPaused,
  };
}
