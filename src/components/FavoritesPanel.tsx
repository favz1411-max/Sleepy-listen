import { ArrowRightLeft, Atom, Music, Play, Star, Trash2 } from 'lucide-react';
import {
  FAVORITE_FOLDERS,
  FavoriteFolder,
  FavoriteItem,
  filterFavoritesByFolder,
  normalizeMediaKey,
} from '../utils/favorites';
import { ActiveMediaState } from '../hooks/useYouTubePlayer';
import { MediaThumbnail } from './MediaThumbnail';

interface FavoritesPanelProps {
  favorites: FavoriteItem[];
  activeFolder: FavoriteFolder;
  activeMedia: ActiveMediaState | null;
  onSelectFolder: (folder: FavoriteFolder) => void;
  onPlayFavorite: (item: FavoriteItem) => void;
  onMoveFavorite: (id: string, targetFolder: FavoriteFolder) => void;
  onRemoveFavorite: (id: string) => void;
}

export function FavoritesPanel({
  favorites,
  activeFolder,
  activeMedia,
  onSelectFolder,
  onPlayFavorite,
  onMoveFavorite,
  onRemoveFavorite,
}: FavoritesPanelProps) {
  const folderItems = filterFavoritesByFolder(favorites, activeFolder);
  const activeKey = activeMedia
    ? normalizeMediaKey({
        url: activeMedia.canonicalUrl,
        kind: activeMedia.kind,
        videoId: activeMedia.videoId,
        playlistId: activeMedia.playlistId,
      })
    : null;

  return (
    <section
      aria-label="Favorites"
      className="bg-[#0e1219] border border-white/[0.07] rounded-2xl p-4 sm:p-5 flex flex-col"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-[#e5a95c]" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-[#e2e8f0]">
            Favorites
          </h2>
        </div>
        <span className="text-xs text-[#7c8ba1] tabular-nums">
          {favorites.length} saved on device
        </span>
      </div>

      {/* Folder Segmented Tabs */}
      <div
        role="tablist"
        aria-label="Favorite folders"
        className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#07090d] border border-white/[0.06] mb-4"
      >
        {FAVORITE_FOLDERS.map((folder) => {
          const isSelected = activeFolder === folder;
          const count = filterFavoritesByFolder(favorites, folder).length;
          return (
            <button
              key={folder}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => onSelectFolder(folder)}
              className={`min-h-[48px] px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c] ${
                isSelected
                  ? 'bg-[#161d29] text-[#f3c47d] border border-white/[0.08]'
                  : 'text-[#94a3b8] hover:text-[#cbd5e1]'
              }`}
            >
              {folder === 'Science' ? (
                <Atom className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Music className="w-4 h-4" aria-hidden="true" />
              )}
              <span>{folder}</span>
              <span className="text-xs tabular-nums opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Folder Items List */}
      {folderItems.length === 0 ? (
        <div className="rounded-xl bg-[#07090d]/70 border border-white/[0.05] px-5 py-10 text-center">
          <p className="text-sm font-medium text-[#cbd5e1]">
            No favorites in {activeFolder} yet
          </p>
          <p className="mt-1.5 text-xs text-[#7c8ba1] max-w-xs mx-auto">
            Play any YouTube video or playlist and tap the Star button to save it to {activeFolder}.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-white/[0.06] -mx-1">
          {folderItems.map((item) => {
            const isCurrent = activeKey !== null && normalizeMediaKey(item) === activeKey;
            const otherFolder: FavoriteFolder =
              item.folder === 'Science' ? 'Songs' : 'Science';

            return (
              <li
                key={item.id}
                className="py-2.5 px-1 first:pt-0 last:pb-0 flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => onPlayFavorite(item)}
                  aria-label={`Play ${item.title}`}
                  className={`flex-1 min-w-0 min-h-[68px] p-2 rounded-xl flex items-center gap-3 text-left transition-colors active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c] ${
                    isCurrent
                      ? 'bg-[#e5a95c]/12 border border-[#e5a95c]/30'
                      : 'hover:bg-[#141a24] border border-transparent'
                  }`}
                >
                  <div className="relative w-24 aspect-video rounded-lg overflow-hidden shrink-0">
                    <MediaThumbnail
                      src={item.thumbnailUrl}
                      alt={item.title}
                      kind={item.kind}
                      className="w-full h-full"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-black/25 flex items-center justify-center"
                    >
                      <Play className="w-4 h-4 text-[#e2e8f0] fill-current opacity-85" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-sm font-medium line-clamp-2 ${
                        isCurrent ? 'text-[#f3c47d]' : 'text-[#e2e8f0]'
                      }`}
                    >
                      {item.title}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-[#7c8ba1]">
                      <span>{item.kind === 'playlist' ? 'Playlist' : 'Video'}</span>
                      {isCurrent && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#e5a95c]">Loaded</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onMoveFavorite(item.id, otherFolder)}
                    aria-label={`Move "${item.title}" to ${otherFolder}`}
                    title={`Move to ${otherFolder}`}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#161d29] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c]"
                  >
                    <ArrowRightLeft className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveFavorite(item.id)}
                    aria-label={`Remove "${item.title}"`}
                    title="Remove favorite"
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#94a3b8] hover:text-[#f87171] hover:bg-[#241215] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c]"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
