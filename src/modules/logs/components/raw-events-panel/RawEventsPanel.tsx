import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from 'react';
import { CircleAlert, ScrollText, SearchX } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { EmptyState, TablePagination } from '@/components/common';
import { Button } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { logger } from '@/utils/logger';
import type {
  RawEventFilters,
  RawEventLevelFilter,
  RawEventListState,
  RawEventStatusFilter,
} from '../../@types';
import {
  ALL_RAW_EVENTS_FILTER,
  DEFAULT_RAW_EVENT_PAGE_SIZE,
  RAW_EVENT_PAGE_SIZE_OPTIONS,
  SEARCH_DEBOUNCE_MS,
} from '../../constants';
import { apiDtoToRawEvent, listRawEvents } from '../../service';
import { dateRangeToIsoBounds, hasActiveRawEventFilters } from '../../utils';
import { RawEventTable } from '../raw-event-table';
import { RawEventsToolbar } from '../raw-events-toolbar';

/** Application → Raw: the searchable, filterable application event log. */
export function RawEventsPanel(): JSX.Element {
  const [listState, setListState] = useState<RawEventListState>({
    status: 'loading',
  });
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [status, setStatus] = useState<RawEventStatusFilter>(
    ALL_RAW_EVENTS_FILTER,
  );
  const [level, setLevel] = useState<RawEventLevelFilter>(
    ALL_RAW_EVENTS_FILTER,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_RAW_EVENT_PAGE_SIZE);
  const [knownTotal, setKnownTotal] = useState(0);
  // Ignores responses for filters or pages the user has already left.
  const latestRequestId = useRef(0);

  const filters = useMemo<RawEventFilters>(
    () => ({
      search: debouncedSearch.trim(),
      level,
      status,
      ...dateRangeToIsoBounds(dateRange),
    }),
    [debouncedSearch, level, status, dateRange],
  );

  const loadEvents = useCallback(async (): Promise<void> => {
    const requestId = ++latestRequestId.current;
    setListState({ status: 'loading' });
    try {
      const result = await listRawEvents({
        ...filters,
        page,
        pageSize,
      });
      if (requestId !== latestRequestId.current) return;
      setListState({
        status: 'success',
        events: result.events.map(apiDtoToRawEvent),
        total: result.total,
      });
      setKnownTotal(result.total);
    } catch (error) {
      if (requestId !== latestRequestId.current) return;
      logger.error('Loading application events failed', { error });
      setListState({ status: 'error' });
    }
  }, [filters, page, pageSize]);

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
  const handleStatusChange = (value: RawEventStatusFilter): void => {
    setStatus(value);
    setPage(1);
  };
  const handleLevelChange = (value: RawEventLevelFilter): void => {
    setLevel(value);
    setPage(1);
  };
  const handlePageSizeChange = (value: number): void => {
    setPageSize(value);
    setPage(1);
  };
  const handleClearFilters = (): void => {
    setSearch('');
    setDateRange(undefined);
    setStatus(ALL_RAW_EVENTS_FILTER);
    setLevel(ALL_RAW_EVENTS_FILTER);
    setPage(1);
  };

  const isFiltered = hasActiveRawEventFilters({
    search,
    level,
    status,
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
          title="Events didn’t load"
          description="We couldn’t load the application log. Please try again."
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
      <RawEventsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        status={status}
        onStatusChange={handleStatusChange}
        level={level}
        onLevelChange={handleLevelChange}
      />

      <RawEventTable
        events={events}
        isLoading={listState.status === 'loading'}
        emptyState={
          isFiltered ? (
            <EmptyState
              icon={SearchX}
              title="No events match your filters"
              description="Try a different search, date range, status or event type."
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
              icon={ScrollText}
              title="No events yet"
              description="Application events show up here as ConnectHealth runs."
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
              pageSizeOptions={RAW_EVENT_PAGE_SIZE_OPTIONS}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          )
        }
      />
    </div>
  );
}
