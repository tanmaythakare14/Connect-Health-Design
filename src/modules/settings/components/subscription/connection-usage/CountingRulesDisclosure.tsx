import { useState, type JSX } from 'react';
import { ChevronDown, CircleHelp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CONNECTION_COUNTING_RULES } from '../../../constants';

const PANEL_ID = 'connection-counting-rules';

/** "How are connections counted?" — the slot rules, open by default. */
export function CountingRulesDisclosure(): JSX.Element {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="rounded-xl border bg-muted/30">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={PANEL_ID}
        className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium text-foreground outline-none hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <CircleHelp aria-hidden className="size-4 text-primary" />
        How are connections counted?
        <ChevronDown
          aria-hidden
          className={cn(
            'ml-auto size-4 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen && (
        <ul
          id={PANEL_ID}
          className="space-y-2 border-t px-4 py-3 text-sm text-muted-foreground animate-in fade-in-0 slide-in-from-top-1 duration-200"
        >
          {CONNECTION_COUNTING_RULES.map((rule) => (
            <li key={rule} className="flex gap-2.5">
              <span
                aria-hidden
                className="mt-2 size-1 shrink-0 rounded-full bg-primary/60"
              />
              {rule}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
