import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FavoritesPanel } from './components/FavoritesPanel';
import { LoginScreen } from './components/LoginScreen';
import { PersonalYouTubeDashboard } from './components/PersonalYouTubeDashboard';
import { PlayerStage } from './components/PlayerStage';
import { SettingsModal } from './components/SettingsModal';
import { SleepTimerPanel } from './components/SleepTimerPanel';
import { StarModal } from './components/StarModal';
import { TopBar } from './components/TopBar';
import { UrlInputBar } from './components/UrlInputBar';
import { YouTubeBrowser } from './components/YouTubeBrowser';
import { useBackgroundPlayback } from './hooks/useBackgroundPlayback';
import { useGoogleYouTubeAuth } from './hooks/useGoogleYouTubeAuth';
import { useSleepTimer } from './hooks/useSleepTimer';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import { useYouTubeSearch } from './hooks/useYouTubeSearch';
import {
  addOrUpdateFavorite,
  FavoriteFolder,
  FavoriteItem,
  findFavoriteForMedia,
  loadFavoritesFromStorage,
  loadSettingsFromStorage,
  moveFavoriteFolder,
  removeFavorite,
  saveFavoritesToStorage,
  saveSettingsToStorage,
  SleepPlayerSettings,
} from './utils/favorites';
import { ParsedYouTubeMedia, parseYouTubeInput } from './utils/youtube';
import { PersonalYouTubeItem } from './utils/youtubePersonal';
import { YouTubeVideoItem } from './utils/youtubeSearch';

export default function App() {
  const [settings, setSettings] = useState<SleepPlayerSettings>(() =>
    loadSettingsFromStorage(typeof window !== 'undefined' ? window.localStorage : null)
  );
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() =>
    loadFavoritesFromStorage(typeof window !== 'undefined' ? window.localStorage : null)
  );
  const [activeFolder, setActiveFolder] = useState<FavoriteFolder>(
    () => settings.defaultFolder
  );
  const [isStarModalOpen, setIsStarModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const notifyBackgroundPausedRef = useRef<() => void>(() => {});

  const player = useYouTubePlayer({
    onUnexpectedBackgroundPause: () => notifyBackgroundPausedRef.current(),
  });
  const sleepTimer = useSleepTimer({
    getVolume: player.getVolume,
    setVolume: player.setVolume,
    pauseVideo: player.pause,
  });
  const youtubeSearch = useYouTubeSearch();
  const googleAuth = useGoogleYouTubeAuth();

  useEffect(() => {
    saveFavoritesToStorage(
      typeof window !== 'undefined' ? window.localStorage : null,
      favorites
    );
  }, [favorites]);

  useEffect(() => {
    saveSettingsToStorage(
      typeof window !== 'undefined' ? window.localStorage : null,
      settings
    );
  }, [settings]);

  const existingFavorite = useMemo(() => {
    if (!player.activeMedia) return undefined;
    return findFavoriteForMedia(favorites, {
      url: player.activeMedia.canonicalUrl,
      kind: player.activeMedia.kind,
      videoId: player.activeMedia.videoId,
      playlistId: player.activeMedia.playlistId,
    });
  }, [favorites, player.activeMedia]);

  const handleResumeFromMediaSession = useCallback(() => {
    sleepTimer.restoreVolumeAfterSleep();
    player.play();
  }, [player, sleepTimer]);

  const backgroundPlayback = useBackgroundPlayback({
    enabled: settings.backgroundPlayback,
    activeMedia: player.activeMedia,
    favoriteFolder: existingFavorite?.folder,
    isPlaying: player.isPlaying,
    intendedPlaying: player.intendedPlaying,
    isSleepTimerPaused: sleepTimer.status === 'completed',
    onPlay: handleResumeFromMediaSession,
    onPause: player.pause,
    onNextTrack: player.nextTrack,
    onPreviousTrack: player.previousTrack,
  });

  useEffect(() => {
    notifyBackgroundPausedRef.current = backgroundPlayback.notifyBackgroundPaused;
  }, [backgroundPlayback.notifyBackgroundPaused]);

  const handlePlayMedia = useCallback(
    (media: ParsedYouTubeMedia, customTitle?: string) => {
      sleepTimer.restoreVolumeAfterSleep();
      backgroundPlayback.activateAudioSession();
      player.loadMedia(media, customTitle, true);
    },
    [player, sleepTimer, backgroundPlayback]
  );

  const handleSelectBrowseVideo = useCallback(
    (video: YouTubeVideoItem) => {
      handlePlayMedia(
        {
          kind: 'video',
          videoId: video.videoId,
          canonicalUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
          thumbnailUrl: video.thumbnailUrl,
        },
        video.title
      );
      if (typeof window !== 'undefined' && window.scrollY > 280) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [handlePlayMedia]
  );

  const handleSelectPersonalItem = useCallback(
    (item: PersonalYouTubeItem) => {
      handlePlayMedia(
        {
          kind: 'video',
          videoId: item.videoId,
          canonicalUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
          thumbnailUrl: item.thumbnailUrl,
        },
        item.title
      );
      if (typeof window !== 'undefined' && window.scrollY > 280) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [handlePlayMedia]
  );

  const handlePlayFavorite = useCallback(
    (item: FavoriteItem) => {
      sleepTimer.restoreVolumeAfterSleep();
      backgroundPlayback.activateAudioSession();
      const parsed = parseYouTubeInput(item.url);
      if (parsed.ok) {
        player.loadMedia(parsed.media, item.title, true);
      } else {
        player.loadMedia(
          {
            kind: item.kind,
            videoId: item.videoId,
            playlistId: item.playlistId,
            canonicalUrl: item.url,
            thumbnailUrl: item.thumbnailUrl,
          },
          item.title,
          true
        );
      }
    },
    [player, sleepTimer, backgroundPlayback]
  );

  const handleTogglePlayPause = useCallback(() => {
    if (!player.isPlaying) {
      sleepTimer.restoreVolumeAfterSleep();
      backgroundPlayback.activateAudioSession();
    } else {
      backgroundPlayback.suspendAudioSession();
    }
    player.togglePlayPause();
  }, [player, sleepTimer, backgroundPlayback]);

  const handleSaveFavorite = useCallback(
    (title: string, folder: FavoriteFolder) => {
      if (!player.activeMedia) return;
      const cleanTitle = title.trim() || player.activeMedia.title;
      setFavorites((prev) =>
        addOrUpdateFavorite(prev, {
          title: cleanTitle,
          thumbnailUrl: player.activeMedia!.thumbnailUrl,
          url: player.activeMedia!.canonicalUrl,
          kind: player.activeMedia!.kind,
          videoId: player.activeMedia!.videoId,
          playlistId: player.activeMedia!.playlistId,
          folder,
        })
      );
      player.updateActiveTitle(cleanTitle);
      setActiveFolder(folder);
      setIsStarModalOpen(false);
    },
    [player]
  );

  const handleMoveFavorite = useCallback((id: string, folder: FavoriteFolder) => {
    setFavorites((prev) => moveFavoriteFolder(prev, id, folder));
  }, []);

  const handleRemoveFavorite = useCallback((id: string) => {
    setFavorites((prev) => removeFavorite(prev, id));
  }, []);

  if (!googleAuth.isAuthenticated) {
    return (
      <LoginScreen
        isSigningIn={googleAuth.isSigningIn}
        authError={googleAuth.authError}
        onSignInWithGoogle={() => void googleAuth.signInWithGoogle()}
        onSignInWithToken={(token) => void googleAuth.signInWithCustomToken(token)}
      />
    );
  }

  return (
    <div id="top" className="min-h-screen bg-[#07090d] text-[#f5efe6] flex flex-col">
      <TopBar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSignOut={() => {
          player.pause();
          googleAuth.signOut();
        }}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-9 space-y-8 sm:space-y-10">
        <div
          id="player-section"
          className="scroll-mt-20 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start"
        >
          {/* Primary Column: URL Input & YouTube Player Stage */}
          <div className="lg:col-span-7 space-y-5">
            <UrlInputBar onPlayMedia={(media) => handlePlayMedia(media)} />

            <PlayerStage
              containerRef={player.containerRef}
              activeMedia={player.activeMedia}
              isPlaying={player.isPlaying}
              volume={player.volume}
              isMuted={player.isMuted}
              playbackQuality={player.playbackQuality}
              playerError={player.playerError}
              dimVideo={settings.dimPlayerVideo}
              backgroundPlayback={settings.backgroundPlayback}
              existingFavorite={existingFavorite}
              onTogglePlayPause={handleTogglePlayPause}
              onVolumeChange={player.setVolume}
              onToggleMute={player.toggleMute}
              onOpenStarModal={() => setIsStarModalOpen(true)}
            />
          </div>

          {/* Secondary Column: Sleep Timer & Favorites (Science / Songs) */}
          <div className="lg:col-span-5 space-y-5">
            <SleepTimerPanel
              status={sleepTimer.status}
              selectedMinutes={sleepTimer.selectedMinutes}
              remainingSeconds={sleepTimer.remainingSeconds}
              fadeSecondsLeft={sleepTimer.fadeSecondsLeft}
              onStartTimer={sleepTimer.startTimer}
              onCancelTimer={sleepTimer.cancelTimer}
            />

            <FavoritesPanel
              favorites={favorites}
              activeFolder={activeFolder}
              activeMedia={player.activeMedia}
              onSelectFolder={setActiveFolder}
              onPlayFavorite={handlePlayFavorite}
              onMoveFavorite={handleMoveFavorite}
              onRemoveFavorite={handleRemoveFavorite}
            />
          </div>
        </div>

        {/* Personalized YouTube Dashboard (Saved Playlists, Channel Subscriptions, Liked Videos) */}
        <div id="personal-dashboard" className="scroll-mt-20">
          <PersonalYouTubeDashboard
            activeTab={googleAuth.activeTab}
            feeds={googleAuth.feeds}
            isLoading={googleAuth.isLoadingFeeds}
            error={googleAuth.feedError}
            activeVideoId={player.activeMedia?.videoId}
            userName={googleAuth.session?.userName ?? 'YouTube Member'}
            onSelectTab={googleAuth.setActiveTab}
            onRefresh={() => void googleAuth.refreshPersonalFeeds()}
            onSelectItem={handleSelectPersonalItem}
          />
        </div>

        {/* Native YouTube Browsing & Search Grid */}
        <div id="browse-section" className="scroll-mt-20">
          <YouTubeBrowser
            query={youtubeSearch.query}
            activeCategory={youtubeSearch.activeCategory}
            results={youtubeSearch.results}
            isLoading={youtubeSearch.isLoading}
            error={youtubeSearch.error}
            activeVideoId={player.activeMedia?.videoId}
            onQueryChange={youtubeSearch.setQuery}
            onSubmitSearch={() => void youtubeSearch.submitSearch()}
            onSelectCategory={(category) => void youtubeSearch.selectCategory(category)}
            onClearSearch={() => void youtubeSearch.clearSearch()}
            onSelectVideo={handleSelectBrowseVideo}
          />
        </div>
      </main>

      <StarModal
        isOpen={isStarModalOpen}
        activeMedia={player.activeMedia}
        existingFavorite={existingFavorite}
        defaultFolder={activeFolder}
        onSave={handleSaveFavorite}
        onRemove={handleRemoveFavorite}
        onClose={() => setIsStarModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        playbackQuality={player.playbackQuality}
        onUpdateSettings={setSettings}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
