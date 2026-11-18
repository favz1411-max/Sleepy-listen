import { useCallback, useEffect, useRef, useState } from 'react';
import { YTPlayer } from '../types/youtube';
import {
  getBestQualityLevel,
  getVideoThumbnailUrl,
  ParsedYouTubeMedia,
} from '../utils/youtube';

export interface ActiveMediaState extends ParsedYouTubeMedia {
  title: string;
}

export interface UseYouTubePlayerOptions {
  onUnexpectedBackgroundPause?: () => void;
}

export interface UseYouTubePlayerResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isApiReady: boolean;
  isPlayerReady: boolean;
  isPlaying: boolean;
  intendedPlaying: boolean;
  volume: number;
  isMuted: boolean;
  playbackQuality: string | null;
  activeMedia: ActiveMediaState | null;
  playerError: string | null;
  loadMedia: (media: ParsedYouTubeMedia, customTitle?: string, autoplay?: boolean) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  toggleMute: () => void;
  updateActiveTitle: (title: string) => void;
}

let apiLoadPromise: Promise<void> | null = null;

function ensureYouTubeIframeApi(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }
  if (window.YT && typeof window.YT.Player === 'function') {
    return Promise.resolve();
  }
  if (apiLoadPromise) {
    return apiLoadPromise;
  }

  apiLoadPromise = new Promise<void>((resolve, reject) => {
    const existingReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof existingReady === 'function') {
        existingReady();
      }
      resolve();
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => {
        apiLoadPromise = null;
        reject(new Error('Could not load YouTube IFrame Player API.'));
      };
      document.head.appendChild(script);
    }
  });

  return apiLoadPromise;
}

export function useYouTubePlayer(
  options: UseYouTubePlayerOptions = {}
): UseYouTubePlayerResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const pendingMediaRef = useRef<{
    media: ParsedYouTubeMedia;
    autoplay: boolean;
  } | null>(null);
  const volumeRef = useRef<number>(80);
  const onUnexpectedBackgroundPauseRef = useRef(options.onUnexpectedBackgroundPause);

  useEffect(() => {
    onUnexpectedBackgroundPauseRef.current = options.onUnexpectedBackgroundPause;
  }, [options.onUnexpectedBackgroundPause]);

  const [isApiReady, setIsApiReady] = useState<boolean>(
    () => typeof window !== 'undefined' && Boolean(window.YT?.Player)
  );
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [intendedPlaying, setIntendedPlaying] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackQuality, setPlaybackQuality] = useState<string | null>(null);
  const [activeMedia, setActiveMedia] = useState<ActiveMediaState | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const applyHighestQuality = useCallback((player: YTPlayer) => {
    try {
      const available =
        typeof player.getAvailableQualityLevels === 'function'
          ? player.getAvailableQualityLevels()
          : [];
      const best = getBestQualityLevel(Array.isArray(available) ? available : []);
      if (typeof player.setPlaybackQuality === 'function') {
        player.setPlaybackQuality(best);
      }
      const current =
        typeof player.getPlaybackQuality === 'function'
          ? player.getPlaybackQuality()
          : best;
      setPlaybackQuality(current || best);
    } catch {
      // Ignore if player isn't ready for quality query yet
    }
  }, []);

  const syncMetadataFromPlayer = useCallback((player: YTPlayer) => {
    try {
      const data = typeof player.getVideoData === 'function' ? player.getVideoData() : null;
      const playlist = typeof player.getPlaylist === 'function' ? player.getPlaylist() : null;
      const firstId = Array.isArray(playlist) && playlist.length > 0 ? playlist[0] : undefined;

      setActiveMedia((prev) => {
        if (!prev) return prev;
        const resolvedTitle =
          data?.title && data.title.trim().length > 0 ? data.title.trim() : prev.title;
        const resolvedVideoId = data?.video_id || prev.videoId || firstId;
        const resolvedThumb =
          prev.thumbnailUrl || (resolvedVideoId ? getVideoThumbnailUrl(resolvedVideoId) : null);

        if (
          resolvedTitle === prev.title &&
          resolvedVideoId === prev.videoId &&
          resolvedThumb === prev.thumbnailUrl
        ) {
          return prev;
        }

        return {
          ...prev,
          title: resolvedTitle,
          videoId: resolvedVideoId,
          thumbnailUrl: resolvedThumb,
        };
      });
    } catch {
      // Ignore metadata read errors
    }
  }, []);

  const createOrLoadPlayer = useCallback(
    (media: ParsedYouTubeMedia, autoplay: boolean) => {
      if (!window.YT || typeof window.YT.Player !== 'function' || !containerRef.current) {
        pendingMediaRef.current = { media, autoplay };
        return;
      }

      setPlayerError(null);

      // If player already exists and is ready, load new media directly
      if (playerRef.current && isPlayerReady) {
        try {
          if (media.kind === 'playlist' && media.playlistId) {
            if (autoplay) {
              playerRef.current.loadPlaylist({
                list: media.playlistId,
                listType: 'playlist',
                index: 0,
              });
            } else {
              playerRef.current.cuePlaylist({
                list: media.playlistId,
                listType: 'playlist',
                index: 0,
              });
            }
          } else if (media.videoId) {
            if (autoplay) {
              playerRef.current.loadVideoById(media.videoId);
            } else {
              playerRef.current.cueVideoById(media.videoId);
            }
          }
          applyHighestQuality(playerRef.current);
          return;
        } catch {
          // Fall through to recreate player if instance was detached
        }
      }

      // Mount inside a fresh child element so YouTube's iframe replacement doesn't conflict with React
      const host = containerRef.current;
      host.innerHTML = '';
      const targetDiv = document.createElement('div');
      targetDiv.className = 'w-full h-full';
      host.appendChild(targetDiv);

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
        playerRef.current = null;
      }

      const playerVars: Record<string, string | number> = {
        autoplay: autoplay ? 1 : 0,
        controls: 1,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        enablejsapi: 1,
        vq: 'highres',
        origin: window.location.origin,
      };

      if (media.kind === 'playlist' && media.playlistId) {
        playerVars.listType = 'playlist';
        playerVars.list = media.playlistId;
      }

      const instance = new window.YT.Player(targetDiv, {
        width: '100%',
        height: '100%',
        videoId: media.kind === 'video' ? media.videoId : undefined,
        playerVars,
        events: {
          onReady: (event) => {
            setIsPlayerReady(true);
            try {
              const iframe = event.target.getIframe?.();
              if (iframe) {
                iframe.setAttribute(
                  'allow',
                  'autoplay; encrypted-media; picture-in-picture; fullscreen'
                );
                iframe.setAttribute('playsinline', '1');
              }
              event.target.setVolume(volumeRef.current);
            } catch {
              // ignore
            }
            applyHighestQuality(event.target);
            syncMetadataFromPlayer(event.target);
          },
          onStateChange: (event) => {
            const state = event.data;
            const YTState = window.YT?.PlayerState;
            if (!YTState) return;

            if (state === YTState.PLAYING) {
              setIsPlaying(true);
              applyHighestQuality(event.target);
              syncMetadataFromPlayer(event.target);
            } else if (state === YTState.PAUSED) {
              setIsPlaying(false);
              if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
                onUnexpectedBackgroundPauseRef.current?.();
              }
            } else if (state === YTState.ENDED) {
              setIsPlaying(false);
              setIntendedPlaying(false);
            } else if (state === YTState.CUED) {
              setIsPlaying(false);
              applyHighestQuality(event.target);
              syncMetadataFromPlayer(event.target);
            }
          },
          onPlaybackQualityChange: (event) => {
            if (typeof event.data === 'string') {
              setPlaybackQuality(event.data);
            }
          },
          onError: (event) => {
            const code = Number(event.data);
            setIsPlaying(false);
            if (code === 101 || code === 150) {
              setPlayerError(
                'Embedded playback unavailable for this video (embedding may be disabled or sign-in required). Try another link.'
              );
            } else if (code === 100) {
              setPlayerError('This video or playlist could not be found or is private.');
            } else {
              setPlayerError('YouTube could not play this link. Check the URL and try again.');
            }
          },
        },
      });

      playerRef.current = instance;
    },
    [applyHighestQuality, isPlayerReady, syncMetadataFromPlayer]
  );

  useEffect(() => {
    let mounted = true;
    ensureYouTubeIframeApi()
      .then(() => {
        if (!mounted) return;
        setIsApiReady(true);
        if (pendingMediaRef.current) {
          const pending = pendingMediaRef.current;
          pendingMediaRef.current = null;
          createOrLoadPlayer(pending.media, pending.autoplay);
        }
      })
      .catch(() => {
        if (!mounted) return;
        setPlayerError(
          'Unable to reach the YouTube IFrame Player API. Check your internet connection.'
        );
      });

    return () => {
      mounted = false;
    };
  }, [createOrLoadPlayer]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, []);

  const loadMedia = useCallback(
    (media: ParsedYouTubeMedia, customTitle?: string, autoplay = true) => {
      const defaultTitle =
        customTitle?.trim() ||
        (media.kind === 'playlist' ? 'YouTube Playlist' : 'YouTube Video');

      setActiveMedia({
        ...media,
        title: defaultTitle,
      });
      setIsPlaying(autoplay);
      setIntendedPlaying(autoplay);
      setPlayerError(null);
      createOrLoadPlayer(media, autoplay);
    },
    [createOrLoadPlayer]
  );

  const play = useCallback(() => {
    if (!activeMedia) return;
    if (playerRef.current && isPlayerReady) {
      try {
        playerRef.current.playVideo();
      } catch {
        // ignore
      }
    }
    setIsPlaying(true);
    setIntendedPlaying(true);
  }, [activeMedia, isPlayerReady]);

  const pause = useCallback(() => {
    if (playerRef.current && isPlayerReady) {
      try {
        playerRef.current.pauseVideo();
      } catch {
        // ignore
      }
    }
    setIsPlaying(false);
    setIntendedPlaying(false);
  }, [isPlayerReady]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const nextTrack = useCallback(() => {
    if (playerRef.current && isPlayerReady) {
      try {
        playerRef.current.nextVideo?.();
      } catch {
        // ignore
      }
    }
  }, [isPlayerReady]);

  const previousTrack = useCallback(() => {
    if (playerRef.current && isPlayerReady) {
      try {
        playerRef.current.previousVideo?.();
      } catch {
        // ignore
      }
    }
  }, [isPlayerReady]);

  const setVolume = useCallback(
    (nextVolume: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(nextVolume)));
      volumeRef.current = clamped;
      setVolumeState(clamped);
      if (playerRef.current && isPlayerReady) {
        try {
          if (clamped > 0 && playerRef.current.isMuted?.()) {
            playerRef.current.unMute();
            setIsMuted(false);
          }
          playerRef.current.setVolume(clamped);
        } catch {
          // ignore
        }
      }
    },
    [isPlayerReady]
  );

  const getVolume = useCallback(() => {
    if (playerRef.current && isPlayerReady) {
      try {
        const v = playerRef.current.getVolume();
        if (typeof v === 'number' && !Number.isNaN(v)) {
          return v;
        }
      } catch {
        // ignore
      }
    }
    return volumeRef.current;
  }, [isPlayerReady]);

  const toggleMute = useCallback(() => {
    if (playerRef.current && isPlayerReady) {
      try {
        if (isMuted) {
          playerRef.current.unMute();
          setIsMuted(false);
        } else {
          playerRef.current.mute();
          setIsMuted(true);
        }
        return;
      } catch {
        // ignore
      }
    }
    setIsMuted((prev) => !prev);
  }, [isMuted, isPlayerReady]);

  const updateActiveTitle = useCallback((title: string) => {
    setActiveMedia((prev) => (prev ? { ...prev, title } : prev));
  }, []);

  return {
    containerRef,
    isApiReady,
    isPlayerReady,
    isPlaying,
    intendedPlaying,
    volume,
    isMuted,
    playbackQuality,
    activeMedia,
    playerError,
    loadMedia,
    play,
    pause,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
    getVolume,
    toggleMute,
    updateActiveTitle,
  };
}
