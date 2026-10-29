import { useCallback, useEffect, useMemo, useState, type JSX } from 'react';
import { CircleAlert, Plus, SearchX, Upload, Workflow } from 'lucide-react';
import {
  ConfirmDialog,
  EmptyState,
  SuccessDialog,
  TablePagination,
} from '@/components/common';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';
import { getPageCount, paginate } from '@/utils/pagination';
import type {
  AddWorkflowFormValues,
  ImportWorkflowRequest,
  ImportWorkflowResult,
  Workflow as WorkflowItem,
  WorkflowConnectionFilter,
  WorkflowListState,
} from '../../@types';
import {
  ALL_CONNECTIONS_FILTER,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  SKELETON_CARD_COUNT,
  WORKFLOW_STATUS,
} from '../../constants';
import {
  apiDtoToWorkflow,
  createWorkflow,
  formValuesToCreateWorkflowPayload,
  deleteWorkflow,
  importWorkflow,
  listWorkflows,
} from '../../service';
import {
  filterWorkflows,
  findWorkflowByName,
  getConnectionOptions,
} from '../../utils';
import { AddWorkflowDialog } from '../add-workflow';
import { ImportWorkflowDialog } from '../import-workflow';
import { WorkflowCard, WorkflowCardSkeleton } from '../workflow-card';
import { WorkflowToolbar } from '../workflow-toolbar';

const GRID_CLASS_NAME =
  'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4';

export function WorkflowsScreen(): JSX.Element {
  const [listState, setListState] = useState<WorkflowListState>({
    status: 'loading',
  });
  const [search, setSearch] = useState('');
  const [connectionFilter, setConnectionFilter] =
    useState<WorkflowConnectionFilter>(ALL_CONNECTIONS_FILTER);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  // The workflow stays set after close so the dialog text doesn't vanish mid-animation.
  const [createdWorkflow, setCreatedWorkflow] = useState<WorkflowItem | null>(
    null,
  );
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WorkflowItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const loadWorkflows = useCallback(async (): Promise<void> => {
    setListState({ status: 'loading' });
    try {
      const dtos = await listWorkflows();
      setListState({ status: 'success', data: dtos.map(apiDtoToWorkflow) });
    } catch (error) {
      logger.error('Loading workflows failed', { error });
      setListState({
        status: 'error',
        error: 'We couldn’t load your workflows. Please try again.',
      });
    }
  }, []);

  useEffect(() => {
    void loadWorkflows();
  }, [loadWorkflows]);

  const allWorkflows = useMemo(
    () => (listState.status === 'success' ? listState.data : []),
    [listState],
  );
  const connectionOptions = useMemo(
    () => getConnectionOptions(allWorkflows),
    [allWorkflows],
  );
  const filteredWorkflows = useMemo(
    () => filterWorkflows(allWorkflows, search, connectionFilter),
    [allWorkflows, search, connectionFilter],
  );
  const currentPage = Math.min(
    page,
    getPageCount(filteredWorkflows.length, pageSize),
  );
  const pageWorkflows = paginate(filteredWorkflows, currentPage, pageSize);
  const hasActiveFilters =
    search.trim() !== '' || connectionFilter !== ALL_CONNECTIONS_FILTER;

  // Any change to what's being looked at starts again from page 1.
  const handleSearchChange = (value: string): void => {
    setSearch(value);
    setPage(1);
  };
  const handleConnectionFilterChange = (
    value: WorkflowConnectionFilter,
  ): void => {
    setConnectionFilter(value);
    setPage(1);
  };
  const handlePageSizeChange = (value: number): void => {
    setPageSize(value);
    setPage(1);
  };
  const handleClearFilters = (): void => {
    setSearch('');
    setConnectionFilter(ALL_CONNECTIONS_FILTER);
    setPage(1);
  };

  // MOCK: pausing / resuming only updates local state until the API exists.
  const setWorkflowStatus = (
    workflowId: string,
    status: WorkflowItem['status'],
  ): void => {
    setListState((current) =>
      current.status === 'success'
        ? {
            ...current,
            data: current.data.map((item) =>
              item.id === workflowId ? { ...item, status } : item,
            ),
          }
        : current,
    );
  };

  const handleToggleStatus = (workflow: WorkflowItem): void => {
    const isPausing = workflow.status === WORKFLOW_STATUS.ACTIVE;
    setWorkflowStatus(
      workflow.id,
      isPausing ? WORKFLOW_STATUS.INACTIVE : WORKFLOW_STATUS.ACTIVE,
    );

    // Undo restores whatever the status was before this toggle.
    const undo = {
      label: 'Undo',
      onClick: () => setWorkflowStatus(workflow.id, workflow.status),
    };
    if (isPausing) {
      toast.info('Workflow paused', {
        description: `“${workflow.name}” won’t run until you resume it.`,
        action: undo,
      });
    } else {
      toast.success('Workflow resumed', {
        description: `“${workflow.name}” is active and will run on its next trigger.`,
        action: undo,
      });
    }
  };

  const handleAddWorkflow = (): void => {
    setIsAddDialogOpen(true);
  };

  // Rejections propagate so the dialog can show its inline error.
  const handleCreateWorkflow = async (
    values: AddWorkflowFormValues,
  ): Promise<void> => {
    const dto = await createWorkflow(formValuesToCreateWorkflowPayload(values));
    const created = apiDtoToWorkflow(dto);

    // MOCK: prepend locally until the list is re-fetched from a real API.
    setListState((current) =>
      current.status === 'success'
        ? { ...current, data: [created, ...current.data] }
        : current,
    );
    // Clear filters so the new card is visible first.
    handleClearFilters();
    setIsAddDialogOpen(false);
    setCreatedWorkflow(created);
    setIsSuccessDialogOpen(true);
  };

  const handleImport = (): void => {
    setIsImportDialogOpen(true);
  };

  // Rejections propagate so the dialog can show its inline error.
  const handleImportWorkflow = async (
    request: ImportWorkflowRequest,
  ): Promise<ImportWorkflowResult> => {
    const imported = apiDtoToWorkflow(await importWorkflow(request));
    const existing = findWorkflowByName(allWorkflows, imported.name);

    // MOCK: stands in for the server's 409 on a duplicate name.
    if (existing && !request.overwrite) {
      return { status: 'conflict', name: imported.name };
    }

    // Overwrite replaces the same-named workflow; either way the import goes first.
    setListState((current) =>
      current.status === 'success'
        ? {
            ...current,
            data: [
              imported,
              ...current.data.filter((item) => item.id !== existing?.id),
            ],
          }
        : current,
    );
    handleClearFilters();
    setIsImportDialogOpen(false);
    return { status: 'imported' };
  };

  const handleDelete = (workflow: WorkflowItem): void => {
    setDeleteTarget(workflow);
    setIsDeleteDialogOpen(true);
  };

  // Rejections propagate so ConfirmDialog can show its inline error.
  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) {
      return;
    }
    await deleteWorkflow(deleteTarget.id);
    // MOCK: remove locally until the list is re-fetched from a real API.
    setListState((current) =>
      current.status === 'success'
        ? {
            ...current,
            data: current.data.filter((item) => item.id !== deleteTarget.id),
          }
        : current,
    );
  };

  // MOCK: the builder, export and settings flows don't exist yet.
  const handleOpen = (workflow: WorkflowItem): void => {
    logger.info('Open workflow requested', { workflowId: workflow.id });
  };
  const handleExport = (workflow: WorkflowItem): void => {
    logger.info('Export workflow requested', { workflowId: workflow.id });
  };
  const handleSettings = (workflow: WorkflowItem): void => {
    logger.info('Workflow settings requested', { workflowId: workflow.id });
  };

  const renderContent = (): JSX.Element => {
    if (listState.status === 'loading') {
      return (
        <div className={GRID_CLASS_NAME} aria-busy>
          {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
            <WorkflowCardSkeleton key={index} />
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
            title="Workflows didn’t load"
            description={listState.error}
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadWorkflows()}
              >
                Try again
              </Button>
            }
          />
        </div>
      );
    }

    if (filteredWorkflows.length === 0) {
      return (
        <div className="rounded-xl border bg-card">
          {hasActiveFilters ? (
            <EmptyState
              icon={SearchX}
              title="No workflows match your filters"
              description="Try a different search term or connection."
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
              icon={Workflow}
              title="No workflows yet"
              description="Create a workflow to start moving data between your connections."
              action={
                <Button size="sm" onClick={handleAddWorkflow}>
                  <Plus aria-hidden />
                  Add Workflow
                </Button>
              }
            />
          )}
        </div>
      );
    }

    return (
      <ul className={GRID_CLASS_NAME}>
        {pageWorkflows.map((workflow) => (
          <li key={workflow.id}>
            <WorkflowCard
              workflow={workflow}
              onOpen={handleOpen}
              onToggleStatus={handleToggleStatus}
              onExport={handleExport}
              onSettings={handleSettings}
              onDelete={handleDelete}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Workflows
        </h1>
        <p className="text-sm text-muted-foreground">
          Build and manage the workflows that move data between your connections
        </p>
      </div>

      <div className="space-y-4">
        <WorkflowToolbar
          search={search}
          onSearchChange={handleSearchChange}
          connectionFilter={connectionFilter}
          onConnectionFilterChange={handleConnectionFilterChange}
          connectionOptions={connectionOptions}
          disabled={listState.status !== 'success'}
          actions={
            <>
              <Button variant="outline" onClick={handleImport}>
                <Upload aria-hidden />
                Import
              </Button>
              <Button onClick={handleAddWorkflow}>
                <Plus aria-hidden />
                Add Workflow
              </Button>
            </>
          }
        />

        {renderContent()}

        {listState.status === 'success' && filteredWorkflows.length > 0 && (
          <div className="rounded-lg border bg-card">
            <TablePagination
              page={currentPage}
              pageSize={pageSize}
              totalItems={filteredWorkflows.length}
              itemLabel="workflows"
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </div>

      <AddWorkflowDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onCreate={handleCreateWorkflow}
      />

      <ImportWorkflowDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImportWorkflow}
      />

      <SuccessDialog
        open={isSuccessDialogOpen}
        onOpenChange={setIsSuccessDialogOpen}
        title="Workflow created"
        description={
          <>
            <span className="font-medium text-foreground">
              {createdWorkflow?.name}
            </span>{' '}
            is ready. Open it to start adding nodes.
          </>
        }
        primaryAction={{
          label: 'Open workflow',
          onClick: () => {
            if (createdWorkflow) {
              handleOpen(createdWorkflow);
            }
          },
        }}
        secondaryAction={{ label: 'Back to workflows', onClick: () => {} }}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        destructive
        title="Delete workflow?"
        description={
          <>
            <span className="font-medium text-foreground">
              {deleteTarget?.name}
            </span>{' '}
            and all of its nodes will be permanently deleted. This can’t be
            undone.
          </>
        }
        confirmLabel="Delete workflow"
        pendingLabel="Deleting…"
        onConfirm={handleConfirmDelete}
        errorMessage="We couldn’t delete the workflow. Please try again."
      />
    </div>
  );
}
