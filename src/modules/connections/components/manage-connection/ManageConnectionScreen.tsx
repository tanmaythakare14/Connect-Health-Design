import type { JSX } from 'react';
import { PencilRuler } from 'lucide-react';
import { EmptyState } from '@/components/common';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type {
  ConnectionDetailsProps,
  ConnectionType,
  ManageConnectionScreenProps,
} from '../../@types';
import {
  CONNECTION_TYPE_LABELS,
  CONNECTION_TYPE_SETUP_LABELS,
} from '../../constants';
import { ConnectionStatusBadge } from '../connection-table/ConnectionStatusBadge';
import { ConnectionTypeBadge } from '../connection-table/ConnectionTypeBadge';
import { BackendSetup } from './types/backend';
import { EmbedSetup } from './types/embed';
import { OpendentalSetup } from './types/opendental';
import { StandaloneSetup } from './types/standalone';
import { UnitySetup } from './types/unity';

/**
 * Per-type details. Add an entry here as each type's screen is designed;
 * types without one show a placeholder.
 */
const DETAILS_BY_TYPE: Partial<
  Record<ConnectionType, (props: ConnectionDetailsProps) => JSX.Element>
> = {
  standalone: StandaloneSetup,
  embed: EmbedSetup,
  opendental: OpendentalSetup,
  unity: UnitySetup,
  backend: BackendSetup,
};

/**
 * Shared shell for every connection type's manage screen. It fills the full
 * height of the content area so a details screen can dock its action bar to
 * the bottom, even when the form is short.
 */
export function ManageConnectionScreen({
  connection,
  onBack,
}: ManageConnectionScreenProps): JSX.Element {
  const Details = DETAILS_BY_TYPE[connection.type];

  return (
    <div className="flex min-h-full flex-col gap-6 p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button
                type="button"
                onClick={onBack}
                className="rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                Connections
              </button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-64 truncate">
              {connection.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
            {connection.name}
          </h1>
          <ConnectionTypeBadge type={connection.type} />
          <ConnectionStatusBadge status={connection.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          Set up and manage this{' '}
          {CONNECTION_TYPE_SETUP_LABELS[connection.type].toLowerCase()}{' '}
          connection
        </p>
      </div>

      <div className="flex flex-1 flex-col">
        {Details ? (
          <Details connection={connection} />
        ) : (
          <div className="rounded-xl border bg-card">
            <EmptyState
              icon={PencilRuler}
              title={`${CONNECTION_TYPE_LABELS[connection.type]} details are on the way`}
              description="This connection type’s settings screen hasn’t been designed yet."
            />
          </div>
        )}
      </div>
    </div>
  );
}
