import { useCallback, useEffect, useMemo, useState, type JSX } from 'react';
import { CircleAlert, Search, SearchX } from 'lucide-react';
import { EmptyState } from '@/components/common';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { logger } from '@/utils/logger';
import type { EhrSystemListState, SelectEhrScreenProps } from '../../@types';
import { EHR_SKELETON_CARD_COUNT } from '../../constants';
import { apiDtoToEhrSystem, listEhrSystems } from '../../service';
import { filterEhrSystems } from '../../utils';
import { EhrSystemCard } from './EhrSystemCard';
import { EnterpriseSupportCallout } from './EnterpriseSupportCallout';

const GRID_CLASS_NAME =
  'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4';

export function SelectEhrScreen({
  onBack,
  onSelect,
}: SelectEhrScreenProps): JSX.Element {
  const [listState, setListState] = useState<EhrSystemListState>({
    status: 'loading',
  });
  const [search, setSearch] = useState('');

  const loadEhrSystems = useCallback(async (): Promise<void> => {
    setListState({ status: 'loading' });
    try {
      const dtos = await listEhrSystems();
      setListState({ status: 'success', data: dtos.map(apiDtoToEhrSystem) });
    } catch (error) {
      logger.error('Loading EHR systems failed', { error });
      setListState({
        status: 'error',
        error: 'We couldn’t load the list of EHR systems. Please try again.',
      });
    }
  }, []);

  useEffect(() => {
    void loadEhrSystems();
  }, [loadEhrSystems]);

  const filteredEhrSystems = useMemo(
    () =>
      listState.status === 'success'
        ? filterEhrSystems(listState.data, search)
        : [],
    [listState, search],
  );

  // MOCK: no enterprise contact flow exists yet.
  const handleContact = (): void => {
    logger.info('Enterprise support contact requested');
  };

  const renderContent = (): JSX.Element => {
    if (listState.status === 'loading') {
      return (
        <div className={GRID_CLASS_NAME} aria-busy>
          {Array.from({ length: EHR_SKELETON_CARD_COUNT }, (_, index) => (
            <div key={index} className="rounded-xl border bg-card p-5">
              <div className="flex items-start gap-3">
                <Skeleton className="size-11 bg-muted" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32 bg-muted" />
                  <Skeleton className="h-4 w-full bg-muted" />
                </div>
              </div>
              <div className="mt-4 flex gap-1.5">
                <Skeleton className="h-5 w-16 bg-muted" />
                <Skeleton className="h-5 w-20 bg-muted" />
                <Skeleton className="h-5 w-14 bg-muted" />
              </div>
              <Skeleton className="mt-8 ml-auto h-6 w-20 bg-muted" />
            </div>
          ))}
        </div>
      );
    }

    if (listState.status === 'error') {
      return (
        <div className="rounded-xl border bg-card">
          <EmptyState
            tone="destructive"
            icon={CircleAlert}
            title="EHR systems didn’t load"
            description={listState.error}
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadEhrSystems()}
              >
                Try again
              </Button>
            }
          />
        </div>
      );
    }

    if (filteredEhrSystems.length === 0) {
      return (
        <div className="rounded-xl border bg-card">
          <EmptyState
            icon={SearchX}
            title="No EHR systems match your search"
            description="Try a different name or capability, such as “FHIR R4”."
            action={
              <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                Clear search
              </Button>
            }
          />
        </div>
      );
    }

    return (
      <ul className={GRID_CLASS_NAME}>
        {filteredEhrSystems.map((ehrSystem) => (
          <li key={ehrSystem.id}>
            <EhrSystemCard ehrSystem={ehrSystem} onSelect={onSelect} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6 p-6">
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
            <BreadcrumbPage>Add New Connection</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Heading on the left, search on the right; wraps below on narrow screens */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Select EHR System
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose the health system you want to integrate with
          </p>
        </div>

        <div className="relative w-full max-w-sm">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search EHR systems..."
            aria-label="Search EHR systems"
            className="bg-background pl-9"
            disabled={listState.status !== 'success'}
            autoFocus
          />
        </div>
      </div>

      {renderContent()}

      {listState.status === 'success' && (
        <EnterpriseSupportCallout onContact={handleContact} />
      )}
    </div>
  );
}
