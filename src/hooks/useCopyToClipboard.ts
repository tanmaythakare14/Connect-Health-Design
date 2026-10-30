import { useEffect, useRef, useState } from 'react';
import { logger } from '@/utils/logger';

const COPIED_RESET_MS = 2000;

interface UseCopyToClipboardResult {
  /** True for ~2 seconds after a successful copy */
  isCopied: boolean;
  /** Copies the text; resolves true on success, false if the browser refused */
  copy: (text: string) => Promise<boolean>;
}

/** Clipboard copy with a short-lived "copied" flag for button feedback. */
export function useCopyToClipboard(): UseCopyToClipboardResult {
  const [isCopied, setIsCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const copy = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(
        () => setIsCopied(false),
        COPIED_RESET_MS,
      );
      return true;
    } catch (error) {
      logger.warn('Copy to clipboard failed', { error });
      return false;
    }
  };

  return { isCopied, copy };
}
