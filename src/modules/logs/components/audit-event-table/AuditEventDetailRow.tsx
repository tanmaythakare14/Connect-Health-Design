import type { JSX } from 'react';
import { Info, UserRound } from 'lucide-react';
import { CopyTextBlock } from '@/components/common';
import { TableCell, TableRow } from '@/components/ui/table';
import type { AuditEventDetailRowProps } from '../../@types';
import { AUDIT_ACTOR_TYPE_LABELS } from '../../constants';
import { AuditDetailList } from './AuditDetailList';
import { AUDIT_EVENT_COLUMNS } from './columns';

/** Full-width row under an expanded audit event. */
export function AuditEventDetailRow({
  event,
  id,
}: AuditEventDetailRowProps): JSX.Element {
  return (
    <TableRow
      id={id}
      className="border-l-2 border-l-primary bg-muted/40 hover:bg-muted/40 animate-in fade-in-0 slide-in-from-top-1 duration-200"
    >
      <TableCell
        colSpan={AUDIT_EVENT_COLUMNS.length}
        className="p-0 whitespace-normal"
      >
        <div className="space-y-5 px-6 py-5">
          <div className="grid gap-x-12 gap-y-5 lg:grid-cols-2">
            <AuditDetailList
              title="Event details"
              icon={Info}
              items={[
                { label: 'Event ID', value: event.id },
                {
                  label: 'Event type',
                  value: `${event.eventType} (${event.action})`,
                },
                { label: 'Event display', value: event.display },
                { label: 'Source', value: event.source },
              ]}
            />
            <AuditDetailList
              title="Technical details"
              icon={UserRound}
              items={[
                { label: 'User ID', value: event.actorId },
                {
                  label: 'Actor type',
                  value: AUDIT_ACTOR_TYPE_LABELS[event.actorType],
                },
                { label: 'IP address', value: event.ipAddress },
              ]}
            />
          </div>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Metadata</h3>
            <CopyTextBlock value={event.metadataJson} label="Event metadata" />
          </section>
        </div>
      </TableCell>
    </TableRow>
  );
}
