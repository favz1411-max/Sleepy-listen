import { FormEvent, useState } from 'react';
import { Link2, Play, X } from 'lucide-react';
import { ParsedYouTubeMedia, parseYouTubeInput } from '../utils/youtube';

interface UrlInputBarProps {
  onPlayMedia: (media: ParsedYouTubeMedia) => void;
}

export function UrlInputBar({ onPlayMedia }: UrlInputBarProps) {
  const [urlValue, setUrlValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = parseYouTubeInput(urlValue);
    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }
    setErrorMessage(null);
    onPlayMedia(result.media);
  };

  const handleClear = () => {
    setUrlValue('');
    setErrorMessage(null);
  };

  return (
    <section
      aria-label="Load YouTube link"
      className="bg-[#0e1219] border border-white/[0.07] rounded-2xl p-4 sm:p-5"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <label htmlFor="youtube-url-input" className="sr-only">
              YouTube video or playlist URL
            </label>
            <Link2
              className="w-5 h-5 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="youtube-url-input"
              type="url"
              inputMode="url"
              value={urlValue}
              onChange={(e) => {
                setUrlValue(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Paste YouTube video or playlist link..."
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={errorMessage ? 'youtube-url-error' : undefined}
              className="w-full min-h-[52px] pl-11 pr-11 py-3 rounded-xl bg-[#07090d] border border-white/[0.09] text-base text-[#e2e8f0] placeholder:text-[#64748b] focus:outline-none focus:border-[#e5a95c]/70 focus:ring-1 focus:ring-[#e5a95c]/70"
            />
            {urlValue.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear link input"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#94a3b8] hover:text-[#e2e8f0] absolute right-1 top-1/2 -translate-y-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c]"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="min-h-[52px] px-6 py-3 rounded-xl bg-[#e5a95c] hover:bg-[#eeb973] active:scale-[0.98] text-[#090c11] font-semibold text-base flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5a95c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e1219]"
          >
            <Play className="w-5 h-5 fill-current" aria-hidden="true" />
            <span>Load &amp; Play</span>
          </button>
        </div>

        {errorMessage ? (
          <p
            id="youtube-url-error"
            role="alert"
            className="text-sm text-[#f87171] pl-1"
          >
            {errorMessage}
          </p>
        ) : (
          <p className="text-xs text-[#7c8ba1] pl-1">
            Supports youtube.com, youtu.be, Shorts, and playlist links via the official YouTube Player.
          </p>
        )}
      </form>
    </section>
  );
}
