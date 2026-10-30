import { useCallback, useEffect, useMemo, useState, type JSX } from 'react';
import { Cable, CircleAlert, Plus, SearchX } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState, TablePagination } from '@/components/common';
import { Button } from '@/components/ui/button';
import { getPageCount, paginate } from '@/utils/pagination';
import { logger } from '@/utils/logger';
import type {
  Connection,
  ConnectionListState,
  ConnectionsView,
  ConnectionStatus,
  ConnectionStatusFilter,
  ConnectionTypeFilter,
  EhrSystem,
} from '../../@types';
import {
  ALL_STATUSES_FILTER,
  ALL_TYPES_FILTER,
  CONNECTION_STATUS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from '../../constants';
import {
  apiDtoToConnection,
  apiDtoToConnectionUsage,
  getConnectionUsage,
  listConnections,
  updateConnectionStatus,
} from '../../service';
import { filterConnections } from '../../utils';
import { ConnectionTable } from '../connection-table';
import { ConnectionToolbar } from '../connection-toolbar';
import { AddConnectionScreen } from '../add-connection';
import { ManageConnectionScreen } from '../manage-connection';
import { TestConnectionScreen } from '../test-connection';

export function ConnectionsScreen(): JSX.Element {
  const [listState, setListState] = useState<ConnectionListState>({
    status: 'loading',
  });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] =
    useState<ConnectionTypeFilter>(ALL_TYPES_FILTER);
  const [statusFilter, setStatusFilter] =
    useState<ConnectionStatusFilter>(ALL_STATUSES_FILTER);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  // Local view switch until a router exists; the list keeps its filters while away.
  const [view, setView] = useState<ConnectionsView>('list');
  const [testTarget, setTestTarget] = useState<Connection | null>(null);
  const [manageTarget, setManageTarget] = useState<Connection | null>(null);

  const loadConnections = useCallback(async (): Promise<void> => {
    setListState({ status: 'loading' });
    try {
      const [connectionDtos, usageDto] = await Promise.all([
        listConnections(),
        getConnectionUsage(),
      ]);
      setListState({
        status: 'success',
        data: connectionDtos.map(apiDtoToConnection),
        usage: apiDtoToConnectionUsage(usageDto),
      });
    } catch (error) {
      logger.error('Loading connections failed', { error });
      setListState({
        status: 'error',
        error: 'We couldn’t load your connections. Please try again.',
      });
    }
  }, []);

  useEffect(() => {
    void loadConnections();
  }, [loadConnections]);

  const allConnections = useMemo(
    () => (listState.status === 'success' ? listState.data : []),
    [listState],
  );
  const filteredConnections = useMemo(
    () => filterConnections(allConnections, search, typeFilter, statusFilter),
    [allConnections, search, typeFilter, statusFilter],
  );
  const currentPage = Math.min(
    page,
    getPageCount(filteredConnections.length, pageSize),
  );
  const pageConnections = paginate(filteredConnections, currentPage, pageSize);
  const hasActiveFilters =
    search.trim() !== '' ||
    typeFilter !== ALL_TYPES_FILTER ||
    statusFilter !== ALL_STATUSES_FILTER;

  // Any change to what's being looked at starts again from page 1.
  const handleSearchChange = (value: string): void => {
    setSearch(value);
    setPage(1);
  };
  const handleTypeFilterChange = (value: ConnectionTypeFilter): void => {
    setTypeFilter(value);
    setPage(1);
  };
  const handleStatusFilterChange = (value: ConnectionStatusFilter): void => {
    setStatusFilter(value);
    setPage(1);
  };
  const handlePageSizeChange = (value: number): void => {
    setPageSize(value);
    setPage(1);
  };
  const handleClearFilters = (): void => {
    setSearch('');
    setTypeFilter(ALL_TYPES_FILTER);
    setStatusFilter(ALL_STATUSES_FILTER);
    setPage(1);
  };

  // MOCK: status changes are applied locally first, then saved via the
  // service; a failed save puts the old status back.
  const setConnectionStatus = (
    connectionId: string,
    status: ConnectionStatus,
  ): void => {
    setListState((current) =>
      current.status === 'success'
        ? {
            ...current,
            data: current.data.map((item) =>
              item.id === connectionId ? { ...item, status } : item,
            ),
          }
        : current,
    );
  };

  const saveConnectionStatus = (
    connection: Connection,
    status: ConnectionStatus,
    previousStatus: ConnectionStatus,
  ): Promise<void> => {
    setConnectionStatus(connection.id, status);
    return updateConnectionStatus(connection.id, status).catch((error) => {
      logger.error('Updating connection status failed', {
        connectionId: connection.id,
        error,
      });
      setConnectionStatus(connection.id, previousStatus);
      toast.error('Couldn’t update the connection', {
        description: 'Please try again.',
      });
      throw error;
    });
  };

  const handleToggleActive = (connection: Connection): void => {
    const previousStatus = connection.status;
    const nextStatus =
      previousStatus === CONNECTION_STATUS.ACTIVE
        ? CONNECTION_STATUS.INACTIVE
        : CONNECTION_STATUS.ACTIVE;

    const undo = {
      label: 'Undo',
      onClick: () => {
        void saveConnectionStatus(connection, previousStatus, nextStatus).catch(
          () => undefined,
        ); // already reported via toast
      },
    };

    saveConnectionStatus(connection, nextStatus, previousStatus)
      .then(() => {
        if (nextStatus === CONNECTION_STATUS.ACTIVE) {
          toast.success('Connection activated', {
            description: `“${connection.name}” is live and can be tested.`,
            action: undo,
          });
        } else {
          toast.info('Connection deactivated', {
            description: `“${connection.name}” won’t exchange data until you turn it back on.`,
            action: undo,
          });
        }
      })
      .catch(() => undefined); // already reported via toast
  };

  const handleTest = (connection: Connection): void => {
    setTestTarget(connection);
    setView('test-connection');
  };

  const handleAddConnection = (): void => {
    setView('add-connection');
  };
  // MOCK: the configure step after choosing an EHR doesn't exist yet.
  const handleSelectEhr = (ehrSystem: EhrSystem): void => {
    logger.info('EHR system selected', { ehrSystemId: ehrSystem.id });
  };

  // MOCK: no counting explainer exists yet.
  const handleUsageInfo = (): void => {
    logger.info('Connection usage explainer requested');
  };
  const handleManage = (connection: Connection): void => {
    setManageTarget(connection);
    setView('manage-connection');
  };

  const renderEmptyState = (): JSX.Element => {
    if (listState.status === 'error') {
      return (
        <EmptyState
          tone="destructive"
          icon={CircleAlert}
          title="Connections didn’t load"
          description={listState.error}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadConnections()}
            >
              Try again
            </Button>
          }
        />
      );
    }
    if (hasActiveFilters) {
      return (
        <EmptyState
          icon={SearchX}
          title="No connections match your filters"
          description="Try a different search term, type or status."
          action={
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Clear filters
            </Button>
          }
        />
      );
    }
    return (
      <EmptyState
        icon={Cable}
        title="No connections yet"
        description="Add a connection to start exchanging data with a health system."
        action={
          <Button size="sm" onClick={handleAddConnection}>
            <Plus aria-hidden />
            Add New Connection
          </Button>
        }
      />
    );
  };

  if (view === 'add-connection') {
    return (
      <AddConnectionScreen
        onBack={() => setView('list')}
        onSelect={handleSelectEhr}
      />
    );
  }

  if (view === 'test-connection' && testTarget) {
    return (
      <TestConnectionScreen
        connection={testTarget}
        onBack={() => setView('list')}
      />
    );
  }

  if (view === 'manage-connection' && manageTarget) {
    return (
      <ManageConnectionScreen
        connection={manageTarget}
        onBack={() => setView('list')}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Connections
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your Health System connections and integrations
        </p>
      </div>

      <div className="space-y-4">
        <ConnectionToolbar
          search={search}
          onSearchChange={handleSearchChange}
          typeFilter={typeFilter}
          onTypeFilterChange={handleTypeFilterChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          usage={listState.status === 'success' ? listState.usage : undefined}
          onUsageInfo={handleUsageInfo}
          disabled={listState.status !== 'success'}
          actions={
            <Button onClick={handleAddConnection}>
              <Plus aria-hidden />
              Add New Connection
            </Button>
          }
        />

        <ConnectionTable
          connections={pageConnections}
          isLoading={listState.status === 'loading'}
          skeletonRowCount={DEFAULT_PAGE_SIZE}
          emptyState={renderEmptyState()}
          onManage={handleManage}
          onToggleActive={handleToggleActive}
          onTest={handleTest}
          footer={
            listState.status === 'success' &&
            filteredConnections.length > 0 && (
              <TablePagination
                page={currentPage}
                pageSize={pageSize}
                totalItems={filteredConnections.length}
                itemLabel="connections"
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
              />
            )
          }
        />
      </div>
    </div>
  );
}
