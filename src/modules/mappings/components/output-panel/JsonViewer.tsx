import { useMemo, type JSX } from 'react';
import type { JsonViewerProps } from '../../@types';
import { JSON_TOKEN_CLASS_NAMES } from '../../constants';
import { tokenizeJsonLine } from '../../utils';

/** Read-only JSON with line numbers and colour; long lines wrap. */
export function JsonViewer({ json }: JsonViewerProps): JSX.Element {
  const lines = useMemo(() => json.split('\n').map(tokenizeJsonLine), [json]);

  return (
    <pre className="py-3 font-mono text-[11.5px] leading-5">
      <code>
        {lines.map((tokens, index) => (
          <div key={index} className="flex hover:bg-muted/50">
            <span
              aria-hidden
              className="w-10 shrink-0 pr-3 text-right text-muted-foreground/60 select-none"
            >
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 pr-4 whitespace-pre-wrap [overflow-wrap:anywhere]">
              {tokens.map((token, tokenIndex) => (
                <span
                  key={tokenIndex}
                  className={JSON_TOKEN_CLASS_NAMES[token.kind]}
                >
                  {token.text}
                </span>
              ))}
            </span>
          </div>
        ))}
      </code>
    </pre>
  );
}
