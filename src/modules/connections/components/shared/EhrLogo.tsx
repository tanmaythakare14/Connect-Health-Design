import type { JSX } from 'react';
import { cn } from '@/lib/utils';
import type { EhrLogoProps } from '../../@types';

/**
 * A vendor wordmark on a white chip. The chip stays white in dark mode too,
 * so brand colours (and dark wordmarks) read correctly without recolouring.
 * Size the chip with `className`.
 */
export function EhrLogo({ src, alt, className }: EhrLogoProps): JSX.Element {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md border bg-white dark:border-white/10',
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="max-h-full max-w-full object-contain"
      />
    </span>
  );
}
