import { useCallback, useEffect, useState, type JSX } from 'react';
import { CircleAlert, CircleCheck, Layers, SearchX } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { logger } from '@/utils/logger';
import type { ConnectionUsageState, UsageFilter } from '../../../@types';
import { USAGE_FILTER } from '../../../constants';
import { apiDtoToConnectionUsage, getConnectionUsage } from '../../../service';
import { filterUsageSlots } from '../../../utils';
import { ConnectionUsageHeaderActions } from './ConnectionUsageHeaderActions';
import { CountingRulesDisclosure } from './CountingRulesDisclosure';
import { SlotCard } from './SlotCard';
import { UsageFilterBar } from './UsageFilterBar';
import { UsageGroupHeading } from './UsageGroupHeading';
import { UsageStatTiles } from './UsageStatTiles';

const BODY_ID = 'connection-usage-body';

/**
 * Collapsible "Connection usage": headline numbers, the counting rules, a
 * filter, then every slot in use.
 */
export function ConnectionUsageSection(): JSX.Element {
  const [state, setState] = useState<ConnectionUsageState>({
    status: 'loading',
  });
  // Starts collapsed; the headline numbers are a click away.
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<UsageFilter>(USAGE_FILTER.ALL);

  const loadUsage = useCallback(async (): Promise<void> => {
    setState({ status: 'loading' });
    try {
      const dto = await getConnectionUsage();
      setState({ status: 'success', data: apiDtoToConnectionUsage(dto) });
    } catch (error) {
      logger.error('Loading connection usage failed', { error });
      setState({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    void loadUsage();
  }, [loadUsage]);

  // Keeps the current numbers on screen while it reloads.
  const handleRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      const dto = await getConnectionUsage();
      setState({ status: 'success', data: apiDtoToConnectionUsage(dto) });
      toast.success('Connection usage is up to date');
    } catch (error) {
      logger.error('Refreshing connection usage failed', { error });
      toast.error('Couldn’t refresh connection usage', {
        description: 'Please try again.',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderBody = (): JSX.Element => {
    if (state.status === 'loading') {
      return (
        <div className="space-y-4" aria-busy>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl bg-muted" />
            ))}
          </div>
          <Skeleton className="h-12 rounded-xl bg-muted" />
          <Skeleton className="h-28 rounded-xl bg-muted" />
        </div>
      );
    }

    if (state.status === 'error') {
      return (
        <div className="rounded-xl border">
          <EmptyState
            tone="destructive"
            icon={CircleAlert}
            title="Connection usage didn’t load"
            description="We couldn’t work out how your connections count. Please try again."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadUsage()}
              >
                Try again
              </Button>
            }
          />
        </div>
      );
    }

    const { data } = state;
    const slots = filterUsageSlots(data.slots, search, filter);

    return (
      <div className="space-y-5">
        <UsageStatTiles usage={data} />
        <CountingRulesDisclosure />
        <UsageFilterBar
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
        />

        {slots.length === 0 && (
          <div className="rounded-xl border border-dashed">
            <EmptyState
              icon={SearchX}
              title="No connections match"
              description="Try a different name, EHR or filter."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setFilter(USAGE_FILTER.ALL);
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          </div>
        )}

        {slots.length > 0 && (
          <div className="space-y-3">
            <UsageGroupHeading
              icon={CircleCheck}
              title="Using a slot"
              count={slots.length}
            />
            <ul className="space-y-3">
              {slots.map((slot) => (
                <SlotCard key={slot.id} slot={slot} />
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <section
      aria-labelledby="connection-usage-heading"
      className="rounded-2xl border bg-card shadow-xs"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 p-6">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
            <Layers aria-hidden className="size-5" />
          </span>
          <div className="min-w-0 space-y-0.5">
            <h3
              id="connection-usage-heading"
              className="text-sm font-semibold text-foreground"
            >
              Connection usage
            </h3>
            <p className="text-sm text-muted-foreground">
              See how your connections count against your plan, and why.
              Connections to the same EHR organization share a single slot.
            </p>
          </div>
        </div>
        <ConnectionUsageHeaderActions
          isOpen={isOpen}
          onToggleOpen={() => setIsOpen((open) => !open)}
          isRefreshing={isRefreshing}
          onRefresh={() => void handleRefresh()}
          refreshDisabled={state.status === 'loading'}
          bodyId={BODY_ID}
        />
      </div>

      {isOpen && (
        <div
          id={BODY_ID}
          className="border-t px-6 py-5 animate-in fade-in-0 slide-in-from-top-1 duration-200"
        >
          {renderBody()}
        </div>
      )}
    </section>
  );
}
