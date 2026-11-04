import type { JSX, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import type { PanelResizeHandleProps } from './types';

const KEY_STEP_PX = 24;
const KEY_STEP_LARGE_PX = 96;

/**
 * The divider between two side-by-side panels: drag it, or focus it and use
 * the arrow keys (Shift for bigger steps). Double-click restores equal widths.
 */
export function PanelResizeHandle({
  label,
  isActive,
  onPointerDown,
  onResizeBy,
  onReset,
  className,
}: PanelResizeHandleProps): JSX.Element {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const step = event.shiftKey ? KEY_STEP_LARGE_PX : KEY_STEP_PX;
    if (event.key === 'ArrowLeft') onResizeBy(-step);
    else if (event.key === 'ArrowRight') onResizeBy(step);
    else if (event.key === 'Enter') onReset();
    else return;
    event.preventDefault();
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      title="Drag to resize · double-click to reset"
      tabIndex={0}
      data-active={isActive || undefined}
      onPointerDown={onPointerDown}
      onKeyDown={handleKeyDown}
      onDoubleClick={onReset}
      className={cn(
        'group/handle relative z-10 w-px shrink-0 cursor-col-resize touch-none bg-border outline-none',
        className,
      )}
    >
      {/* Wider than the 1px line so it's easy to grab */}
      <span aria-hidden className="absolute inset-y-0 -inset-x-1.5" />
      <span
        aria-hidden
        className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-primary opacity-0 transition-opacity duration-150 group-hover/handle:opacity-100 group-focus-visible/handle:opacity-100 group-data-active/handle:opacity-100"
      />
      <span
        aria-hidden
        className="absolute top-1/2 left-1/2 h-8 w-1.5 -translate-1/2 rounded-full border bg-background shadow-xs transition-colors group-hover/handle:border-primary group-focus-visible/handle:border-primary group-data-active/handle:border-primary"
      />
    </div>
  );
}
