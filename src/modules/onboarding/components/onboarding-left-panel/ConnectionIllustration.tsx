import type { JSX } from 'react';
import { Network } from 'lucide-react';
import type { ConnectedSystemNode } from '../../@types';

const HUB = { x: 200, y: 160 };

// Laid out on an ellipse around the hub (viewBox 400 × 320).
const SYSTEM_NODES: ConnectedSystemNode[] = [
  { label: 'EHR', x: 200, y: 44 },
  { label: 'Lab', x: 330, y: 105 },
  { label: 'Pharmacy', x: 330, y: 215 },
  { label: 'Payer', x: 200, y: 276 },
  { label: 'Imaging', x: 70, y: 215 },
  { label: 'HIE', x: 70, y: 105 },
];

const NODE_WIDTH = 84;
const NODE_HEIGHT = 30;

export function ConnectionIllustration(): JSX.Element {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <svg
        viewBox="0 0 400 320"
        className="h-auto w-full"
        role="img"
        aria-label="ConnectHealth hub connecting EHR, lab, pharmacy, payer, imaging and HIE systems"
      >
        <ellipse
          cx={HUB.x}
          cy={HUB.y}
          rx="130"
          ry="96"
          className="fill-none stroke-primary-foreground/15"
          strokeDasharray="2 6"
        />

        {SYSTEM_NODES.map((node) => (
          <line
            key={`line-${node.label}`}
            x1={HUB.x}
            y1={HUB.y}
            x2={node.x}
            y2={node.y}
            className="stroke-primary-foreground/35"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        ))}

        {SYSTEM_NODES.map((node) => (
          <circle
            key={`packet-${node.label}`}
            cx={HUB.x + (node.x - HUB.x) * 0.55}
            cy={HUB.y + (node.y - HUB.y) * 0.55}
            r="3"
            className="fill-primary-foreground"
          />
        ))}

        <circle
          cx={HUB.x}
          cy={HUB.y}
          r="46"
          className="fill-primary-foreground/10 stroke-primary-foreground/25"
        />
        <circle
          cx={HUB.x}
          cy={HUB.y}
          r="32"
          className="fill-primary-foreground"
        />

        {SYSTEM_NODES.map((node) => (
          <g key={`node-${node.label}`}>
            <rect
              x={node.x - NODE_WIDTH / 2}
              y={node.y - NODE_HEIGHT / 2}
              width={NODE_WIDTH}
              height={NODE_HEIGHT}
              rx={NODE_HEIGHT / 2}
              className="fill-primary-foreground"
            />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-primary text-xs font-semibold"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Network className="size-7 text-primary" aria-hidden />
      </div>
    </div>
  );
}
