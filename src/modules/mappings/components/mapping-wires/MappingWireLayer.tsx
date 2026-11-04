import { useEffect, useRef, useState, type JSX } from 'react';
import type {
  MappingLink,
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
  d: string;
  /** Both ends are on screen: drawn solid, the rest dotted and faded */
  isActive: boolean;
}

/** How far into the row a thread starts when it has to use the row edge. */
const ROW_EDGE_INSET_PX = 8;

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

  return links.flatMap((link, index): Wire[] => {
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
        key: `${link.sourceRef}→${link.targetPath}#${index}`,
        d: curve(from, to),
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
 * Render inside the (positioned) row that holds both panels.
 */
export function MappingWireLayer({
  links,
  sourceTree,
  targetTree,
}: MappingWireLayerProps): JSX.Element {
  const svgRef = useRef<SVGSVGElement>(null);
  const [wires, setWires] = useState<Wire[]>([]);

  useEffect(() => {
    const container = svgRef.current?.parentElement;
    if (!container) return;

    // At most one redraw per frame, however many scroll events arrive.
    let frame = 0;
    const draw = (): void => {
      frame = 0;
      setWires(computeWires(container, links, sourceTree, targetTree));
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
      // Redrawing the threads changes the SVG itself; that's no reason to
      // redraw again (it would loop forever).
      const svg = svgRef.current;
      if (svg && records.every((record) => svg.contains(record.target))) {
        return;
      }
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
  }, [links, sourceTree, targetTree]);

  // Faded threads first, so the solid ones sit on top.
  const ordered = [...wires].sort(
    (a, b) => Number(a.isActive) - Number(b.isActive),
  );

  return (
    <svg
      ref={svgRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 size-full overflow-visible"
    >
      {ordered.map((wire) => (
        <path
          key={wire.key}
          d={wire.d}
          fill="none"
          strokeLinecap="round"
          className={
            wire.isActive
              ? 'stroke-primary stroke-[1.5] opacity-80 transition-opacity'
              : 'stroke-muted-foreground stroke-1 opacity-30 transition-opacity [stroke-dasharray:2_4]'
          }
        />
      ))}
    </svg>
  );
}
