import { Fragment, useMemo, useRef, type JSX, type UIEvent } from 'react';
import { cn } from '@/lib/utils';
import type {
  CodeEditorProps,
  CodeLanguage,
  Hl7TokenKind,
  LiquidTokenKind,
} from '../../@types';
import { JSON_TOKEN_CLASS_NAMES } from '../../constants';
import {
  tokenizeHl7Line,
  tokenizeJsonLine,
  tokenizeLiquidLine,
} from '../../utils';

const HL7_TOKEN_CLASS_NAMES: Record<Hl7TokenKind, string> = {
  segment: 'font-bold text-primary',
  'field-separator': 'text-muted-foreground/60',
  separator: 'text-amber-600 dark:text-amber-400',
  value: 'text-foreground',
};

const LIQUID_TOKEN_CLASS_NAMES: Record<LiquidTokenKind, string> = {
  ...JSON_TOKEN_CLASS_NAMES,
  delimiter: 'text-violet-500 dark:text-violet-400',
  keyword: 'font-semibold text-violet-700 dark:text-violet-300',
  filter: 'text-amber-700 dark:text-amber-400',
  variable: 'text-sky-700 dark:text-sky-300',
};

/** One line as coloured spans, in the code's language. */
function renderLine(line: string, language: CodeLanguage): JSX.Element[] {
  const tokens =
    language === 'hl7'
      ? tokenizeHl7Line(line).map((token) => ({
          text: token.text,
          className: HL7_TOKEN_CLASS_NAMES[token.kind],
        }))
      : language === 'liquid'
        ? tokenizeLiquidLine(line).map((token) => ({
            text: token.text,
            className: LIQUID_TOKEN_CLASS_NAMES[token.kind],
          }))
        : tokenizeJsonLine(line).map((token) => ({
            text: token.text,
            className: JSON_TOKEN_CLASS_NAMES[token.kind],
          }));
  return tokens.map((token, index) => (
    <span key={index} className={token.className}>
      {token.text}
    </span>
  ));
}

// The textarea, the coloured copy behind it and the line numbers must all
// lay text out identically.
const TEXT_LAYOUT_CLASS_NAME =
  'm-0 p-3 font-mono text-xs leading-5 whitespace-pre [tab-size:2]';

/**
 * A plain textarea with a coloured copy of its text underneath: the
 * textarea's own text is transparent, so you type into a real field while
 * seeing HL7 segments, JSON keys or Liquid tags picked out. Lines don't wrap;
 * line numbers are optional. Height comes from `className` (default h-60).
 */
export function CodeEditor({
  id,
  value,
  onChange,
  language,
  placeholder,
  invalid = false,
  readOnly = false,
  showLineNumbers = false,
  describedBy,
  ariaLabel,
  className,
}: CodeEditorProps): JSX.Element {
  const backdropRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => value.split('\n'), [value]);
  const isHighlighted = language !== 'plain';

  // The coloured copy and the line numbers follow the textarea's scrolling.
  const handleScroll = (event: UIEvent<HTMLTextAreaElement>): void => {
    const { scrollTop, scrollLeft } = event.currentTarget;
    if (backdropRef.current) {
      backdropRef.current.scrollTop = scrollTop;
      backdropRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.style.transform = `translateY(-${scrollTop}px)`;
    }
  };

  return (
    <div
      className={cn(
        'flex h-60 overflow-hidden rounded-md border bg-muted/30 shadow-xs transition-[color,box-shadow]',
        'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
        invalid && 'border-destructive focus-within:ring-destructive/20',
        className,
      )}
    >
      {showLineNumbers && (
        <div
          aria-hidden
          className="w-11 shrink-0 overflow-hidden border-r bg-muted/40 select-none"
        >
          <div
            ref={gutterRef}
            className="py-3 pr-3 text-right font-mono text-xs leading-5 text-muted-foreground/60"
          >
            {lines.map((_, index) => (
              <div key={index}>{index + 1}</div>
            ))}
          </div>
        </div>
      )}

      <div className="relative min-w-0 flex-1">
        {isHighlighted && (
          <pre
            ref={backdropRef}
            aria-hidden
            className={cn(
              TEXT_LAYOUT_CLASS_NAME,
              'pointer-events-none absolute inset-0 overflow-hidden',
            )}
          >
            {lines.map((line, index) => (
              <Fragment key={index}>
                {renderLine(line, language)}
                {/* A trailing space keeps an empty last line's height */}
                {index < lines.length - 1 ? '\n' : ' '}
              </Fragment>
            ))}
          </pre>
        )}
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          onScroll={handleScroll}
          readOnly={readOnly}
          wrap="off"
          spellCheck={false}
          autoComplete="off"
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          placeholder={placeholder}
          className={cn(
            TEXT_LAYOUT_CLASS_NAME,
            'absolute inset-0 size-full resize-none overflow-auto bg-transparent outline-none placeholder:text-muted-foreground selection:bg-primary/25',
            isHighlighted
              ? 'text-transparent caret-foreground'
              : 'text-foreground',
            readOnly && 'cursor-default',
          )}
        />
      </div>
    </div>
  );
}
