import { useMemo, type JSX } from 'react';
import { Braces, Check, CircleCheck, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { formatFileSize } from '@/utils/file';
import type { OutputPanelProps } from '../../@types';
import { JsonViewer } from './JsonViewer';

/** Right of the template editor: what the mappings produce, live. */
export function OutputPanel({ output }: OutputPanelProps): JSX.Element {
  const json = useMemo(
    () => (output == null ? null : JSON.stringify(output, null, 2)),
    [output],
  );
  const { isCopied, copy } = useCopyToClipboard();

  const handleCopy = async (): Promise<void> => {
    if (!json) return;
    if (!(await copy(json))) {
      toast.error('Couldn’t copy the output', {
        description: 'Your browser blocked clipboard access.',
      });
    }
  };

  return (
    <section
      aria-labelledby="output-panel-heading"
      className="flex min-h-0 flex-1 flex-col bg-card"
    >
      <header className="flex h-11 shrink-0 items-center justify-between gap-3 border-b px-4">
        <div className="flex items-center gap-2">
          <h2
            id="output-panel-heading"
            className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
          >
            Output
          </h2>
          {json && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-px text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void handleCopy()}
          disabled={!json}
          aria-label={isCopied ? 'Copied' : 'Copy output'}
          className="h-7 px-2 text-xs"
        >
          {isCopied ? (
            <Check aria-hidden className="size-3.5 text-emerald-600" />
          ) : (
            <Copy aria-hidden className="size-3.5" />
          )}
          {isCopied ? 'Copied' : 'Copy'}
        </Button>
      </header>

      {json ? (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20">
            <JsonViewer json={json} />
          </div>
          <footer className="flex h-9 shrink-0 items-center justify-between gap-3 border-t px-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CircleCheck
                aria-hidden
                className="size-3.5 text-emerald-600 dark:text-emerald-400"
              />
              Valid JSON
            </span>
            <span className="tabular-nums">
              {json.split('\n').length} lines ·{' '}
              {formatFileSize(new TextEncoder().encode(json).length)}
            </span>
          </footer>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
          <Braces aria-hidden className="size-5 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">
            Nothing to preview
          </p>
          <p className="text-xs text-muted-foreground">
            Add a sample message to see what these mappings produce.
          </p>
        </div>
      )}
    </section>
  );
}
