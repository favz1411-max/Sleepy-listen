import { useState } from 'react';
import { ListMusic, Moon } from 'lucide-react';
import { YouTubeMediaKind } from '../utils/youtube';

interface MediaThumbnailProps {
  src: string | null;
  alt: string;
  kind: YouTubeMediaKind;
  className?: string;
}

export function MediaThumbnail({
  src,
  alt,
  kind,
  className = '',
}: MediaThumbnailProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`relative flex items-center justify-center bg-gradient-to-br from-[#161c26] to-[#0b0e14] border border-white/[0.06] text-[#94a3b8] ${className}`}
        aria-hidden="true"
      >
        {kind === 'playlist' ? (
          <ListMusic className="w-5 h-5 text-[#e5a95c]/80" />
        ) : (
          <Moon className="w-5 h-5 text-[#94a3b8]" />
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`object-cover bg-[#111620] ${className}`}
    />
  );
}
