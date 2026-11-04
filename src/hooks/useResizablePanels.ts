import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

interface UseResizablePanelsOptions {
  /** Each panel's starting share of the row, left to right */
  initialSizes: number[];
  /** Each panel's narrowest width while dragging, left to right */
  minSizesPx: number[];
}

interface UseResizablePanelsResult {
  /** Each panel's share of the row; use as its `flex-grow` (with `flex-basis: 0`) */
  sizes: number[];
  /** Ref callback for panel `index`, so its width can be measured */
  panelRef: (index: number) => (element: HTMLElement | null) => void;
  /** Starts dragging the handle between panel `index` and `index + 1` */
  startResize: (index: number, event: ReactPointerEvent) => void;
  /** Moves that handle by `deltaPx` (keyboard) */
  resizeBy: (index: number, deltaPx: number) => void;
  /** Back to the starting widths */
  reset: () => void;
  /** The handle being dragged, if any */
  activeHandle: number | null;
}

/**
 * Side-by-side panels whose shared edges can be dragged. Only the two panels
 * next to a handle change, and widths are kept as flex shares so a hidden
 * panel or a window resize keeps the proportions.
 */
export function useResizablePanels({
  initialSizes,
  minSizesPx,
}: UseResizablePanelsOptions): UseResizablePanelsResult {
  const [sizes, setSizes] = useState(initialSizes);
  const [activeHandle, setActiveHandle] = useState<number | null>(null);
  const panels = useRef<Array<HTMLElement | null>>([]);
  const stopDrag = useRef<(() => void) | null>(null);

  useEffect(() => () => stopDrag.current?.(), []);

  const panelRef = useCallback(
    (index: number) =>
      (element: HTMLElement | null): void => {
        panels.current[index] = element;
      },
    [],
  );

  /** Current pixel widths of the two panels either side of handle `index`. */
  const measure = useCallback(
    (index: number): [left: number, right: number] => [
      panels.current[index]?.getBoundingClientRect().width ?? 0,
      panels.current[index + 1]?.getBoundingClientRect().width ?? 0,
    ],
    [],
  );

  /**
   * New sizes after moving the edge between `index` and `index + 1` by
   * `deltaPx`, where `widths` are the two panels' widths when `from` applied.
   */
  const shifted = useCallback(
    (
      from: number[],
      index: number,
      deltaPx: number,
      [left, right]: [number, number],
    ): number[] => {
      const span = left + right;
      const minLeft = minSizesPx[index] ?? 0;
      const minRight = minSizesPx[index + 1] ?? 0;
      if (span <= minLeft + minRight) return from;

      const nextLeft = Math.min(
        Math.max(left + deltaPx, minLeft),
        span - minRight,
      );
      const share = from[index] + from[index + 1];
      const next = [...from];
      next[index] = (share * nextLeft) / span;
      next[index + 1] = share - next[index];
      return next;
    },
    [minSizesPx],
  );

  const startResize = (index: number, event: ReactPointerEvent): void => {
    if (event.button !== 0) return;
    event.preventDefault();
    // Everything is measured once, at the start: each move is applied to
    // these, never to the already-resized panels, so changes can't compound.
    const startX = event.clientX;
    const startSizes = sizes;
    const startWidths = measure(index);
    const { cursor, userSelect } = document.body.style;

    const handleMove = (moveEvent: PointerEvent): void => {
      setSizes(
        shifted(startSizes, index, moveEvent.clientX - startX, startWidths),
      );
    };
    const handleUp = (): void => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
      document.body.style.cursor = cursor;
      document.body.style.userSelect = userSelect;
      setActiveHandle(null);
      stopDrag.current = null;
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    // Keep the resize cursor and stop text selection while the pointer
    // wanders off the handle.
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    setActiveHandle(index);
    stopDrag.current = handleUp;
  };

  const resizeBy = (index: number, deltaPx: number): void => {
    // The panels on screen match `sizes`, so measure them now.
    setSizes(shifted(sizes, index, deltaPx, measure(index)));
  };

  const reset = (): void => setSizes(initialSizes);

  return { sizes, panelRef, startResize, resizeBy, reset, activeHandle };
}
