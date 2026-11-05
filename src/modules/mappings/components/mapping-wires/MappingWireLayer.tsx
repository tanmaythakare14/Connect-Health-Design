import { useEffect, useRef, useState, type JSX } from 'react';
import { Check, X } from 'lucide-react';
import type {
  MappingLink,
  MappingSuggestion,
  MappingWireLayerProps,
  SourceTreeNode,
  TargetTreeNode,
} from '../../@types';
import { findSourceAncestors, findTargetAncestors } from '../../utils';

interface Point {
  x: number;
  y: number;
}

interface Anchor extends Point {
  /** False when the field's row is hidden and a collapsed parent stands in */
  isExact: boolean;
}

interface Wire {
  key: string;
  link: MappingLink;
  /** Set on an auto-map guess, drawn dashed amber */
  suggestion?: MappingSuggestion;
  d: string;
  /** Where the remove button sits: the curve's midpoint */
  mid: Point;
  /** Both ends are on screen: drawn solid, the rest dotted and faded */
  isActive: boolean;
}

/** How far into the row a thread starts when it has to use the row edge. */
const ROW_EDGE_INSET_PX = 8;

/** Grace period so the pointer can travel from a thread to its × button. */
const HOVER_CLOSE_DELAY_MS = 150;

const centerOf = (rect: DOMRect): Point => ({
  x: rect.left + rect.width / 2,
  y: rect.top + rect.height / 2,
});

/**
 * Where a thread attaches: the field's own port, or — when it's inside a
 * collapsed branch — the nearest open parent (its port, else its row edge).
 */
function findAnchor(
  side: 'source' | 'target',
  candidates: string[],
): Anchor | null {
  for (const [index, id] of candidates.entries()) {
    const port = document.getElementById(`${side}-port-${id}`);
    if (port)
      return {
        ...centerOf(port.getBoundingClientRect()),
        isExact: index === 0,
      };

    const row = document.getElementById(`${side}-row-${id}`);
    if (row) {
      const rect = row.getBoundingClientRect();
      return {
        x:
          side === 'source'
            ? rect.right - ROW_EDGE_INSET_PX
            : rect.left + ROW_EDGE_INSET_PX,
        y: rect.top + rect.height / 2,
        isExact: false,
      };
    }
  }
  return null;
}

/** An S-curve from the source port across the gap to the target port. */
function curve(from: Point, to: Point): string {
  const bend = Math.max(40, (to.x - from.x) * 0.45);
  return `M ${from.x} ${from.y} C ${from.x + bend} ${from.y}, ${to.x - bend} ${to.y}, ${to.x} ${to.y}`;
}

function computeWires(
  container: HTMLElement,
  links: MappingLink[],
  suggestions: MappingSuggestion[],
  sourceTree: SourceTreeNode[],
  targetTree: TargetTreeNode[],
): Wire[] {
  const sourceViewport = container.querySelector(
    '[data-wire-viewport="source"]',
  );
  const targetViewport = container.querySelector(
    '[data-wire-viewport="target"]',
  );
  // No trees on screen (no sample, or Table / Liquid view): nothing to join.
  if (!sourceViewport || !targetViewport) return [];

  const origin = container.getBoundingClientRect();
  const sourceBounds = sourceViewport.getBoundingClientRect();
  const targetBounds = targetViewport.getBoundingClientRect();

  /** Keeps a point inside its panel's scroll area; says if it had to move. */
  const clamp = (point: Point, bounds: DOMRect): [Point, boolean] => {
    const y = Math.min(Math.max(point.y, bounds.top), bounds.bottom);
    return [{ x: point.x - origin.left, y: y - origin.top }, y === point.y];
  };

  const entries: Array<[MappingLink, MappingSuggestion | undefined]> = [
    ...links.map((link): [MappingLink, undefined] => [link, undefined]),
    ...suggestions.map((s): [MappingLink, MappingSuggestion] => [s, s]),
  ];
  return entries.flatMap(([link, suggestion], index): Wire[] => {
    const source = findAnchor('source', [
      link.sourceRef,
      ...(findSourceAncestors(sourceTree, link.sourceRef) ?? []).reverse(),
    ]);
    const target = findAnchor('target', [
      link.targetPath,
      ...(findTargetAncestors(targetTree, link.targetPath) ?? []).reverse(),
    ]);
    if (!source || !target) return [];

    const [from, isSourceVisible] = clamp(source, sourceBounds);
    const [to, isTargetVisible] = clamp(target, targetBounds);
    return [
      {
        key: `${suggestion ? 'suggest:' : ''}${link.sourceRef}→${link.targetPath}#${index}`,
        link,
        suggestion,
        d: curve(from, to),
        // The S-curve is symmetric, so its midpoint is the ends' average.
        mid: { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 },
        isActive:
          source.isExact &&
          target.isExact &&
          isSourceVisible &&
          isTargetVisible,
      },
    ];
  });
}

/**
 * The mapping threads between the source and target trees, drawn over the
 * editor. Threads whose two ends are both on screen are solid; the rest are
 * dotted and faded, pinned to the edge of the panel they've scrolled out of.
 * Hovering a thread highlights it and shows a × at its middle to remove it.
 * Auto-map guesses are dashed amber; clicking one offers Accept and Reject.
 * Render inside the (positioned) row that holds both panels.
 */
export function MappingWireLayer({
  links,
  suggestions,
  sourceTree,
  targetTree,
  onRemoveLink,
  onAcceptSuggestion,
  onRejectSuggestion,
}: MappingWireLayerProps): JSX.Element {
  const layerRef = useRef<HTMLDivElement>(null);
  const [wires, setWires] = useState<Wire[]>([]);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const leaveTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  // Esc puts a picked suggestion back.
  useEffect(() => {
    if (!selectedKey) return;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setSelectedKey(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedKey]);

  useEffect(() => {
    const layer = layerRef.current;
    const container = layer?.parentElement;
    if (!layer || !container) return;

    // At most one redraw per frame, however many scroll events arrive.
    let frame = 0;
    const draw = (): void => {
      frame = 0;
      setWires(
        computeWires(container, links, suggestions, sourceTree, targetTree),
      );
    };
    const schedule = (): void => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    // Panel resizes (dragging an edge, the window) move every port.
    const resizes = new ResizeObserver(schedule);
    const observeViewports = (): void => {
      resizes.observe(container);
      container
        .querySelectorAll('[data-wire-viewport]')
        .forEach((viewport) => resizes.observe(viewport));
    };
    // Branches opening or closing, search, a tab switch: rows come and go.
    const mutations = new MutationObserver((records) => {
      // Redrawing the threads (or showing a ×) changes this layer itself;
      // that's no reason to redraw again (it would loop forever).
      if (records.every((record) => layer.contains(record.target))) return;
      observeViewports();
      schedule();
    });

    observeViewports();
    mutations.observe(container, { childList: true, subtree: true });
    // Scroll doesn't bubble, so listen in the capture phase.
    container.addEventListener('scroll', schedule, true);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      resizes.disconnect();
      mutations.disconnect();
      container.removeEventListener('scroll', schedule, true);
    };
  }, [links, suggestions, sourceTree, targetTree]);

  const hoverWire = (key: string): void => {
    window.clearTimeout(leaveTimer.current);
    setHoveredKey(key);
  };
  const leaveWire = (): void => {
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(
      () => setHoveredKey(null),
      HOVER_CLOSE_DELAY_MS,
    );
  };

  // Only real mappings get the remove ×; a picked guess gets its own pill.
  const hovered = wires.find(
    (wire) => wire.key === hoveredKey && !wire.suggestion,
  );
  const selected = wires.find((wire) => wire.key === selectedKey);
  const isInFocus = (wire: Wire): number =>
    Number(wire.key === hoveredKey || wire.key === selectedKey);
  // Faded threads first, then solid, then guesses, then the one in focus.
  const ordered = [...wires].sort(
    (a, b) =>
      isInFocus(a) - isInFocus(b) ||
      Number(Boolean(a.suggestion)) - Number(Boolean(b.suggestion)) ||
      Number(a.isActive) - Number(b.isActive),
  );

  const settleSelected = (accept: boolean): void => {
    if (!selected?.suggestion) return;
    setSelectedKey(null);
    if (accept) onAcceptSuggestion(selected.suggestion);
    else onRejectSuggestion(selected.suggestion);
  };

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0 z-20">
      <svg aria-hidden className="absolute inset-0 size-full overflow-visible">
        {ordered.map((wire) => {
          const isHovered = wire.key === hoveredKey;
          const isSelected = wire.key === selectedKey;
          return (
            <g key={wire.key}>
              <path
                d={wire.d}
                fill="none"
                strokeLinecap="round"
                className={
                  wire.suggestion
                    ? isSelected || isHovered
                      ? 'stroke-amber-500 stroke-[2.5] opacity-100 [stroke-dasharray:7_4]'
                      : 'stroke-amber-500 stroke-[1.5] opacity-80 transition-opacity [stroke-dasharray:6_4]'
                    : isHovered
                      ? 'stroke-primary stroke-[2.5] opacity-100'
                      : wire.isActive
                        ? 'stroke-primary stroke-[1.5] opacity-80 transition-opacity'
                        : 'stroke-muted-foreground stroke-1 opacity-30 transition-opacity [stroke-dasharray:2_4]'
                }
              />
              {/* A wide, invisible copy that's easy to hover (and click) */}
              <path
                d={wire.d}
                fill="none"
                stroke="transparent"
                strokeWidth={14}
                pointerEvents="stroke"
                onMouseEnter={() => hoverWire(wire.key)}
                onMouseLeave={leaveWire}
                onClick={
                  wire.suggestion
                    ? () =>
                        setSelectedKey((current) =>
                          current === wire.key ? null : wire.key,
                        )
                    : undefined
                }
                className={wire.suggestion ? 'cursor-pointer' : undefined}
              />
            </g>
          );
        })}
      </svg>

      {hovered && (
        <button
          type="button"
          onClick={() => {
            setHoveredKey(null);
            onRemoveLink(hovered.link);
          }}
          onMouseEnter={() => hoverWire(hovered.key)}
          onMouseLeave={leaveWire}
          onFocus={() => hoverWire(hovered.key)}
          onBlur={leaveWire}
          aria-label={`Remove mapping ${hovered.link.sourceRef} to ${hovered.link.targetPath}`}
          title="Remove this mapping"
          style={{ left: hovered.mid.x, top: hovered.mid.y }}
          className="pointer-events-auto absolute flex size-6 -translate-1/2 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-md outline-none transition-colors animate-in fade-in-0 zoom-in-75 duration-150 hover:border-destructive hover:bg-destructive hover:text-white focus-visible:ring-[3px] focus-visible:ring-destructive/40"
        >
          <X aria-hidden className="size-3.5" />
        </button>
      )}

      {selected?.suggestion && (
        <div
          role="group"
          aria-label={`Suggested mapping ${selected.link.sourceRef} to ${selected.link.targetPath}`}
          style={{ left: selected.mid.x, top: selected.mid.y }}
          className="pointer-events-auto absolute flex -translate-1/2 items-center gap-0.5 rounded-full border border-amber-500/40 bg-background p-0.5 shadow-lg animate-in fade-in-0 zoom-in-90 duration-150"
        >
          <button
            type="button"
            autoFocus
            onClick={() => settleSelected(true)}
            className="flex h-6 items-center gap-1 rounded-full bg-primary px-2.5 text-[11px] font-semibold text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <Check aria-hidden className="size-3" />
            Accept
          </button>
          <button
            type="button"
            onClick={() => settleSelected(false)}
            aria-label="Reject"
            title="Reject this suggestion"
            className="flex size-6 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-[3px] focus-visible:ring-destructive/40"
          >
            <X aria-hidden className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
