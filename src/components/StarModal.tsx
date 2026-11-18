import { FormEvent, useEffect, useState } from 'react';
import { Atom, Music, Trash2, X } from 'lucide-react';
import {
  FAVORITE_FOLDERS,
  FavoriteFolder,
  FavoriteItem,
} from '../utils/favorites';
import { ActiveMediaState } from '../hooks/useYouTubePlayer';

interface StarModalProps {
  isOpen: boolean;
  activeMedia: ActiveMediaState | null;
  existingFavorite: FavoriteItem | undefined;
  defaultFolder: FavoriteFolder;
  onSave: (title: string, folder: FavoriteFolder) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}

export function StarModal({
  isOpen,
  activeMedia,
  existingFavorite,
  defaultFolder,
  onSave,
  onRemove,
  onClose,
}: StarModalProps) {
  const [title, setTitle] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<FavoriteFolder>(defaultFolder);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(existingFavorite?.title ?? activeMedia?.title ?? '');
    setSelectedFolder(existingFavorite?.folder ?? defaultFolder);
  }, [isOpen, existingFavorite, activeMedia, defaultFolder]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !activeMedia) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSave(title, selectedFolder);
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
        aria-labelledby="star-modal-title"
        className="w-full sm:max-w-md bg-[#0e1219] border border-white/[0.09] rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 space-y-5"
      >
        <div className="flex items-center justify-between gap-3">
          <h2
            id="star-modal-title"
            className="font-display text-lg font-semibold text-[#e2e8f0]"
          >
            {existingFavorite ? 'Edit Favorite' : 'Save to Favorites'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close save favorite dialog"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#161d29] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="favorite-title-input"
              className="block text-sm font-medium text-[#cbd5e1]"
            >
              Title
            </label>
            <input
              id="favorite-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for bedtime..."
              className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-[#07090d] border border-white/[0.09] text-base text-[#e2e8f0] placeholder:text-[#64748b] focus:outline-none focus:border-[#e5a95c]/70 focus:ring-1 focus:ring-[#e5a95c]/70"
            />
          </div>

          <div className="space-y-2">
            <span className="block text-sm font-medium text-[#cbd5e1]">
              Folder
            </span>
            <div className="grid grid-cols-2 gap-3">
              {FAVORITE_FOLDERS.map((folder) => {
                const isSelected = selectedFolder === folder;
                return (
                  <button
                    key={folder}
                    type="button"
                    onClick={() => setSelectedFolder(folder)}
                    aria-pressed={isSelected}
                    className={`min-h-[52px] px-4 py-3 rounded-xl border text-base font-medium flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c] ${
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

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 min-h-[52px] px-5 py-3 rounded-xl bg-[#e5a95c] hover:bg-[#eeb973] active:scale-[0.98] text-[#090c11] font-semibold text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c]"
            >
              {existingFavorite ? 'Update Favorite' : `Save to ${selectedFolder}`}
            </button>

            {existingFavorite && (
              <button
                type="button"
                onClick={() => {
                  onRemove(existingFavorite.id);
                  onClose();
                }}
                className="min-h-[52px] px-4 py-3 rounded-xl bg-[#241215] hover:bg-[#32171b] border border-[#f87171]/25 text-[#fca5a5] font-medium text-base flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f87171]"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
