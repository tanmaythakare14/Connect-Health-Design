import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from 'react';
import { CircleAlert, SearchX, ShieldCheck } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { EmptyState, TablePagination } from '@/components/common';
import { Button } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { logger } from '@/utils/logger';
import type {
  AuditEventFilters,
  AuditEventListState,
  AuditStatusFilter,
} from '../../@types';
import {
  ALL_AUDIT_STATUSES_FILTER,
  AUDIT_EVENT_PAGE_SIZE_OPTIONS,
  DEFAULT_AUDIT_EVENT_PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
} from '../../constants';
import { apiDtoToAuditEvent, listAuditEvents } from '../../service';
import { dateRangeToIsoBounds, hasActiveAuditEventFilters } from '../../utils';
import { AuditEventTable } from '../audit-event-table';
import { AuditEventsToolbar } from '../audit-events-toolbar';

/** Audit tab: who did what, when, to which resource — searchable and filterable. */
export function AuditEventsPanel(): JSX.Element {
  const [listState, setListState] = useState<AuditEventListState>({
    status: 'loading',
  });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [status, setStatus] = useState<AuditStatusFilter>(
    ALL_AUDIT_STATUSES_FILTER,
  );
  const [user, setUser] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_AUDIT_EVENT_PAGE_SIZE);
  const [knownTotal, setKnownTotal] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Ignores responses for filters or pages the user has already left.
  const latestRequestId = useRef(0);

  const filters = useMemo<AuditEventFilters>(
    () => ({
      search: debouncedSearch.trim(),
      status,
      user,
      ...dateRangeToIsoBounds(dateRange),
    }),
    [debouncedSearch, status, user, dateRange],
  );

  /**
   * A refresh keeps the current rows on screen (the button spins instead of
   * the table flashing skeletons) and reports a failure as a toast.
   */
  const loadEvents = useCallback(
    async ({ isRefresh = false } = {}): Promise<void> => {
      const requestId = ++latestRequestId.current;
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setListState({ status: 'loading' });
      }
      try {
        const result = await listAuditEvents({ ...filters, page, pageSize });
        if (requestId !== latestRequestId.current) return;
        setListState({
          status: 'success',
          events: result.events.map(apiDtoToAuditEvent),
          total: result.total,
        });
        setKnownTotal(result.total);
      } catch (error) {
        if (requestId !== latestRequestId.current) return;
        logger.error('Loading audit events failed', { error });
        if (isRefresh) {
          toast.error('Couldn’t refresh the audit trail', {
            description: 'Please try again.',
          });
        } else {
          setListState({ status: 'error' });
        }
      } finally {
        if (isRefresh) setIsRefreshing(false);
      }
    },
    [filters, page, pageSize],
  );

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  // Any change to what's being looked at starts again from page 1.
  const handleSearchChange = (value: string): void => {
    setSearch(value);
    setPage(1);
  };
  const handleDateRangeChange = (range: DateRange | undefined): void => {
    setDateRange(range);
    setPage(1);
  };
  const handleStatusChange = (value: AuditStatusFilter): void => {
    setStatus(value);
    setPage(1);
  };
  const handleUserChange = (value: string): void => {
    setUser(value);
    setPage(1);
  };
  const handlePageSizeChange = (value: number): void => {
    setPageSize(value);
    setPage(1);
  };
  const handleClearFilters = (): void => {
    setSearch('');
    setDateRange(undefined);
    setStatus(ALL_AUDIT_STATUSES_FILTER);
    setUser('');
    setPage(1);
  };

  const isFiltered = hasActiveAuditEventFilters({
    search,
    status,
    user,
    dateRange,
  });
  const events = listState.status === 'success' ? listState.events : [];
  // Kept through page loads so the pager doesn't vanish between pages.
  const lastTotal =
    listState.status === 'success' ? listState.total : knownTotal;

  if (listState.status === 'error') {
    return (
      <div className="rounded-xl border bg-card">
        <EmptyState
          tone="destructive"
          icon={CircleAlert}
          title="Audit trail didn’t load"
          description="We couldn’t load the audit events. Please try again."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadEvents()}
            >
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AuditEventsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        status={status}
        onStatusChange={handleStatusChange}
        user={user}
        onUserChange={handleUserChange}
        isRefreshing={isRefreshing}
        onRefresh={() => void loadEvents({ isRefresh: true })}
        disabled={listState.status === 'loading'}
      />

      <AuditEventTable
        events={events}
        isLoading={listState.status === 'loading'}
        emptyState={
          isFiltered ? (
            <EmptyState
              icon={SearchX}
              title="No audit events match your filters"
              description="Try a different search, date range, status or user."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={ShieldCheck}
              title="No audit events yet"
              description="Every action people and services take in ConnectHealth is recorded here."
            />
          )
        }
        footer={
          lastTotal > 0 && (
            <TablePagination
              page={page}
              pageSize={pageSize}
              totalItems={lastTotal}
              itemLabel="events"
              pageSizeOptions={AUDIT_EVENT_PAGE_SIZE_OPTIONS}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          )
        }
      />
    </div>
  );
}
