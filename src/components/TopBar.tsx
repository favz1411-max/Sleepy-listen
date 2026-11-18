import { Moon, SlidersHorizontal } from 'lucide-react';

interface TopBarProps {
  onOpenSettings: () => void;
  onSignOut: () => void;
}

export function TopBar({ onOpenSettings, onSignOut }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 h-14 bg-[#07090d]/90 backdrop-blur-md border-b border-white/[0.07]">
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
        <a
          href="#top"
          className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight text-[#f5efe6] whitespace-nowrap shrink-0"
        >
          <Moon className="w-5 h-5 text-[#e5a95c]" aria-hidden="true" />
          <span>Sleep Player</span>
        </a>

        <nav
          aria-label="Primary sections"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#c8bfb0]/80"
        >
          <a
            href="#player-section"
            className="hover:text-[#f5efe6] transition-colors whitespace-nowrap shrink-0"
          >
            Player
          </a>
          <a
            href="#personal-dashboard"
            className="hover:text-[#f5efe6] transition-colors whitespace-nowrap shrink-0"
          >
            My YouTube
          </a>
          <a
            href="#browse-section"
            className="hover:text-[#f5efe6] transition-colors whitespace-nowrap shrink-0"
          >
            Search
          </a>
          <button
            type="button"
            onClick={onSignOut}
            className="hover:text-[#e5a95c] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Sign Out
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#11161f] hover:bg-[#19202d] hover:border-[#e5a95c]/45 active:scale-[0.98] border border-white/[0.08] text-sm font-medium text-[#f5efe6] flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c]"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#e5a95c]" aria-hidden="true" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}

