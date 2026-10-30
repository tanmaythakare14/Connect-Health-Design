import type { JSX, ReactNode } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import type { RawEventDetailRowProps } from '../../@types';
import { RAW_EVENT_COLUMNS } from './columns';
import { CopyableId } from './CopyableId';

/** Full-width row under an expanded event: label / value pairs. */
export function RawEventDetailRow({
  event,
  id,
}: RawEventDetailRowProps): JSX.Element {
  const fields: Array<{ label: string; value: ReactNode }> = [
    {
      label: 'Event type',
      value: <span className="font-mono text-xs">{event.level}</span>,
    },
    {
      label: 'Source',
      value: (
        <span className="font-mono text-xs break-all">{event.source}</span>
      ),
    },
    // Only request-scoped events carry one; background jobs don't.
    ...(event.correlationId
      ? [
          {
            label: 'Correlation ID',
            value: (
              <CopyableId value={event.correlationId} label="correlation ID" />
            ),
          },
        ]
      : []),
    { label: 'Message', value: event.message },
  ];

  return (
    <TableRow
      id={id}
      className="border-l-2 border-l-primary bg-muted/40 hover:bg-muted/40 animate-in fade-in-0 slide-in-from-top-1 duration-200"
    >
      <TableCell
        colSpan={RAW_EVENT_COLUMNS.length}
        className="p-0 whitespace-normal"
      >
        <dl className="grid grid-cols-[8rem_minmax(0,1fr)] items-baseline gap-x-6 gap-y-2.5 px-6 py-4 text-sm">
          {fields.map((field) => (
            <div key={field.label} className="contents">
              <dt className="text-muted-foreground">{field.label}</dt>
              <dd className="min-w-0 text-foreground">{field.value}</dd>
            </div>
          ))}
        </dl>
      </TableCell>
    </TableRow>
  );
}
