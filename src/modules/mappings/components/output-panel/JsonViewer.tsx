import { useMemo, useState, type JSX } from 'react';
import { cn } from '@/lib/utils';
import type { JsonTokenKind, JsonViewerProps } from '../../@types';
import {
  JSON_MATCH_VALUE_CLASS_NAME,
  JSON_TOKEN_CLASS_NAMES,
} from '../../constants';
import { jsonLinePaths, tokenizeJsonLine } from '../../utils';

const VALUE_TOKEN_KINDS = new Set<JsonTokenKind>([
  'string',
  'number',
  'literal',
]);

/**
 * Read-only JSON with line numbers and colour; long lines wrap. Hovering a
 * line highlights the same entry in every array item (each note's `text`).
 */
export function JsonViewer({ json }: JsonViewerProps): JSX.Element {
  const lines = useMemo(() => {
    const paths = jsonLinePaths(json);
    return json.split('\n').map((line, index) => ({
      tokens: tokenizeJsonLine(line),
      path: paths[index] ?? null,
    }));
  }, [json]);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  // Only entries inside arrays repeat; anything else would match just itself.
  const matchPath = hoveredPath?.includes('[*]') ? hoveredPath : null;

  return (
    <pre
      className="py-3 font-mono text-[11.5px] leading-5"
      onMouseLeave={() => setHoveredPath(null)}
    >
      <code>
        {lines.map(({ tokens, path }, index) => {
          const isMatch = matchPath !== null && path === matchPath;
          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredPath(path)}
              className={cn(
                'flex transition-colors',
                isMatch
                  ? 'bg-primary/5 dark:bg-primary/10'
                  : 'hover:bg-muted/50',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'w-10 shrink-0 pr-3 text-right select-none',
                  isMatch ? 'text-primary' : 'text-muted-foreground/60',
                )}
              >
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 pr-4 whitespace-pre-wrap [overflow-wrap:anywhere]">
                {tokens.map((token, tokenIndex) => (
                  <span
                    key={tokenIndex}
                    className={cn(
                      JSON_TOKEN_CLASS_NAMES[token.kind],
                      isMatch &&
                        VALUE_TOKEN_KINDS.has(token.kind) &&
                        JSON_MATCH_VALUE_CLASS_NAME,
                    )}
                  >
                    {token.text}
                  </span>
                ))}
              </span>
            </div>
          );
        })}
      </code>
    </pre>
  );
}
