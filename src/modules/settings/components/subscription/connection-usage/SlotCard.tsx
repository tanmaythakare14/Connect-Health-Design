import type { JSX } from 'react';
import { Cloud, KeyRound, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SlotCardProps } from '../../../@types';
import { LICENSE_SOURCE_LABELS, LICENSE_SOURCE_TYPE } from '../../../constants';
import { describeSlotConnection } from '../../../utils';

const CHIP_CLASS_NAME =
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset';

/** Tint per connection type; anything else falls back to neutral. */
const TYPE_BADGE_CLASS_NAMES: Partial<Record<string, string>> = {
  backend:
    'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900/60',
  standalone:
    'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900/60',
  embed:
    'bg-pink-50 text-pink-700 ring-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:ring-pink-900/60',
};
const NEUTRAL_TYPE_BADGE_CLASS_NAME =
  'bg-muted text-muted-foreground ring-border';

/**
 * One slot: its EHR organization, then a timeline of the connections counted
 * in it. The first bullet holds the slot; any below it share that slot.
 */
export function SlotCard({ slot }: SlotCardProps): JSX.Element {
  const shareCount = slot.connections.length;
  const isShared = shareCount > 1;
  const SourceIcon =
    slot.source === LICENSE_SOURCE_TYPE.AWS_MARKETPLACE ? Cloud : KeyRound;

  return (
    <li className="rounded-xl border bg-card p-4 transition-colors duration-200 hover:border-primary/30">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-primary"
          >
            {slot.ehr.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {slot.ehr}
            </p>
            {slot.organization ? (
              <p
                title={slot.organization}
                className="truncate text-xs text-muted-foreground"
              >
                {slot.organization}
              </p>
            ) : (
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                Pending configuration — FHIR URL isn’t set yet
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              CHIP_CLASS_NAME,
              'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900/60',
            )}
          >
            Uses 1 slot
          </span>
          <span
            className={cn(
              CHIP_CLASS_NAME,
              'bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:ring-teal-900/60',
            )}
          >
            <SourceIcon aria-hidden className="size-3" />
            {LICENSE_SOURCE_LABELS[slot.source]}
          </span>
          {isShared && (
            <span
              className={cn(
                CHIP_CLASS_NAME,
                'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60',
              )}
            >
              <Users aria-hidden className="size-3" />
              {shareCount} connections share this slot
            </span>
          )}
        </div>
      </div>

      {/* Bullets sit under the EHR tile; the text lines up with the EHR name */}
      <ol
        aria-label={`Connections in the ${slot.ehr} slot`}
        className="mt-4 space-y-4"
      >
        {slot.connections.map((connection, index) => {
          const isHolder = index === 0;
          const isLast = index === shareCount - 1;
          return (
            <li key={connection.id} className="relative pl-12">
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute top-5 -bottom-4 left-[17px] border-l-2 border-dotted border-border"
                />
              )}
              <span
                aria-hidden
                className={cn(
                  'absolute top-1 left-[11px] size-3.5 rounded-full border-2 bg-card',
                  isHolder
                    ? 'border-primary ring-3 ring-primary/15'
                    : 'border-amber-500',
                )}
              />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {connection.name}
                </span>
                <span
                  className={cn(
                    'rounded-md px-1.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset',
                    TYPE_BADGE_CLASS_NAMES[connection.type] ??
                      NEUTRAL_TYPE_BADGE_CLASS_NAME,
                  )}
                >
                  {connection.type}
                </span>
                <span className="text-xs text-muted-foreground">
                  {connection.ehr}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {describeSlotConnection(slot, index)}
              </p>
            </li>
          );
        })}
      </ol>
    </li>
  );
}
