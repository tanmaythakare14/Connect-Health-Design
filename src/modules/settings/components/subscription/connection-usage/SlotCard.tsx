import type { JSX } from 'react';
import { Cloud, KeyRound, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SlotCardProps } from '../../../@types';
import { LICENSE_SOURCE_LABELS, LICENSE_SOURCE_TYPE } from '../../../constants';
import { describeSlotConnection } from '../../../utils';

const CHIP_CLASS_NAME =
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium';

/** One slot: its EHR organization, chips, and every connection sharing it. */
export function SlotCard({ slot }: SlotCardProps): JSX.Element {
  const isShared = slot.connections.length > 1;
  const SourceIcon =
    slot.source === LICENSE_SOURCE_TYPE.AWS_MARKETPLACE ? Cloud : KeyRound;

  return (
    <li className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/30">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="min-w-0 text-sm font-semibold text-foreground">
          {slot.ehr}
          <span className="font-normal text-muted-foreground"> — </span>
          {slot.organization ? (
            <span className="font-mono text-xs font-medium break-all text-muted-foreground">
              {slot.organization}
            </span>
          ) : (
            <span className="font-normal text-amber-700 italic dark:text-amber-300">
              pending configuration
            </span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              CHIP_CLASS_NAME,
              'border-primary/20 bg-accent text-accent-foreground',
            )}
          >
            1 slot
          </span>
          <span
            className={cn(
              CHIP_CLASS_NAME,
              'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300',
            )}
          >
            <SourceIcon aria-hidden className="size-3" />
            {LICENSE_SOURCE_LABELS[slot.source]}
          </span>
          {isShared && (
            <span
              className={cn(
                CHIP_CLASS_NAME,
                'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
              )}
            >
              <Users aria-hidden className="size-3" />
              {slot.connections.length} connections share this slot
            </span>
          )}
        </div>
      </div>

      <ul className="mt-3 space-y-2 border-t pt-3">
        {slot.connections.map((connection, index) => (
          <li key={connection.id} className="text-sm">
            <span className="font-medium text-foreground">
              {connection.name}
            </span>{' '}
            <span className="text-xs text-muted-foreground">
              ({connection.ehr} · {connection.type})
            </span>
            <span className="text-muted-foreground">
              {' '}
              — {describeSlotConnection(slot, index)}
            </span>
          </li>
        ))}
      </ul>
    </li>
  );
}
