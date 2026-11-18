import { useEffect } from 'react';
import { Atom, Headphones, Info, Moon, Music, X } from 'lucide-react';
import {
  FAVORITE_FOLDERS,
  FavoriteFolder,
  SleepPlayerSettings,
} from '../utils/favorites';
import { formatQualityLabel } from '../utils/youtube';

interface SettingsModalProps {
  isOpen: boolean;
  settings: SleepPlayerSettings;
  playbackQuality: string | null;
  onUpdateSettings: (next: SleepPlayerSettings) => void;
  onClose: () => void;
}

export function SettingsModal({
  isOpen,
  settings,
  playbackQuality,
  onUpdateSettings,
  onClose,
}: SettingsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const setDefaultFolder = (folder: FavoriteFolder) => {
    onUpdateSettings({ ...settings, defaultFolder: folder });
  };

  const toggleDimVideo = () => {
    onUpdateSettings({ ...settings, dimPlayerVideo: !settings.dimPlayerVideo });
  };

  const toggleBackgroundPlayback = () => {
    onUpdateSettings({
      ...settings,
      backgroundPlayback: !settings.backgroundPlayback,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        className="w-full sm:max-w-lg bg-[#0e1219] border border-white/[0.09] rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 space-y-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between gap-3">
          <h2
            id="settings-modal-title"
            className="font-display text-xl font-semibold text-[#e2e8f0]"
          >
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#161d29] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Playback Quality & Required YouTube Note */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-semibold text-[#cbd5e1]">
            Playback &amp; Audio Quality
          </h3>
          <div className="rounded-xl bg-[#07090d] border border-white/[0.06] p-4 space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-[#94a3b8]">Requested quality</span>
              <span className="font-medium text-[#e5a95c]">
                {formatQualityLabel(playbackQuality)}
              </span>
            </div>
            <div className="pt-2 border-t border-white/[0.06] flex items-start gap-2.5 text-xs text-[#94a3b8] leading-relaxed">
              <Info className="w-4 h-4 text-[#7c8ba1] shrink-0 mt-0.5" aria-hidden="true" />
              <p>
                Audio quality is controlled by YouTube. Sleep Player automatically requests the highest available playback quality from the official YouTube IFrame Player API.
              </p>
            </div>
          </div>
        </div>

        {/* Default Favorites Folder */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-semibold text-[#cbd5e1]">
            Default Favorites Folder
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {FAVORITE_FOLDERS.map((folder) => {
              const isSelected = settings.defaultFolder === folder;
              return (
                <button
                  key={folder}
                  type="button"
                  onClick={() => setDefaultFolder(folder)}
                  aria-pressed={isSelected}
                  className={`min-h-[48px] px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c] ${
                    isSelected
                      ? 'bg-[#e5a95c]/15 border-[#e5a95c] text-[#f3c47d]'
                      : 'bg-[#141a24] border-white/[0.08] text-[#cbd5e1] hover:bg-[#1b2330]'
                  }`}
                >
                  {folder === 'Science' ? (
                    <Atom className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Music className="w-4 h-4" aria-hidden="true" />
                  )}
                  <span>{folder}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Background Playback & Lock Screen Audio */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-semibold text-[#cbd5e1]">
            Background Playback
          </h3>
          <button
            type="button"
            role="switch"
            aria-checked={settings.backgroundPlayback}
            onClick={toggleBackgroundPlayback}
            className="w-full min-h-[56px] px-4 py-3 rounded-xl bg-[#07090d] border border-white/[0.07] hover:border-white/[0.14] flex items-center justify-between gap-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c]"
          >
            <div className="flex items-center gap-3">
              <Headphones className="w-5 h-5 text-[#e5a95c] shrink-0" aria-hidden="true" />
              <div>
                <div className="text-sm font-medium text-[#e2e8f0]">
                  Background audio mode
                </div>
                <div className="text-xs text-[#7c8ba1]">
                  Enables lock-screen media controls, silent Web Audio session keep-alive, and auto-resume when backgrounded
                </div>
              </div>
            </div>
            <span
              className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                settings.backgroundPlayback ? 'bg-[#e5a95c] justify-end' : 'bg-[#1f2735] justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#090c11]" />
            </span>
          </button>
          <p className="text-xs text-[#7c8ba1] leading-relaxed px-1">
            Uses the Media Session API and an active browser audio session so playback and the sleep timer continue when switching apps or locking the screen. Allow background playback if prompted by your mobile browser.
          </p>
        </div>

        {/* Low-Brightness Video Dimming */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-semibold text-[#cbd5e1]">
            Nightstand Display
          </h3>
          <button
            type="button"
            role="switch"
            aria-checked={settings.dimPlayerVideo}
            onClick={toggleDimVideo}
            className="w-full min-h-[56px] px-4 py-3 rounded-xl bg-[#07090d] border border-white/[0.07] hover:border-white/[0.14] flex items-center justify-between gap-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c]"
          >
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-[#e5a95c] shrink-0" aria-hidden="true" />
              <div>
                <div className="text-sm font-medium text-[#e2e8f0]">
                  Dim video frame
                </div>
                <div className="text-xs text-[#7c8ba1]">
                  Adds a dark overlay over bright video scenes while playing
                </div>
              </div>
            </div>
            <span
              className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
                settings.dimPlayerVideo ? 'bg-[#e5a95c] justify-end' : 'bg-[#1f2735] justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-[#090c11]" />
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[52px] px-5 py-3 rounded-xl bg-[#161d29] hover:bg-[#1e2738] border border-white/[0.09] text-base font-medium text-[#e2e8f0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c]"
        >
          Done
        </button>
      </div>
    </div>
  );
}
