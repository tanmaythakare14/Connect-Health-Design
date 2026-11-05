import { useCallback, useEffect, useMemo, useState, type JSX } from 'react';
import { CircleAlert, FileCode, Plus, SearchX, Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  ConfirmDialog,
  EmptyState,
  TablePagination,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { logger } from '@/utils/logger';
import { getPageCount, paginate } from '@/utils/pagination';
import type {
  ImportMappingProjectRequest,
  ImportMappingProjectResult,
  MappingProject,
  MappingProjectListState,
  MappingProjectSort,
  MappingsTab,
  MappingTemplate,
  NewMappingProjectFormValues,
} from '../../@types';
import {
  DEFAULT_MAPPING_PROJECT_SORT,
  DEFAULT_PAGE_SIZE,
  MAPPING_PROJECT_SORT_OPTIONS,
  MAPPINGS_TAB,
  PAGE_SIZE_OPTIONS,
  PAGINATION_THRESHOLD,
  SKELETON_CARD_COUNT,
} from '../../constants';
import {
  apiDtoToMappingProject,
  createMappingProject,
  deleteMappingProject,
  duplicateMappingProject,
  formValuesToCreateMappingProjectPayload,
  importMappingProject,
  listMappingProjects,
} from '../../service';
import {
  deriveProjectFormat,
  filterMappingProjects,
  findMappingProjectByName,
  isMappingsTab,
  sortMappingProjects,
} from '../../utils';
import { ImportMappingProjectDialog } from '../import-project';
import { NewMappingProjectDialog } from '../new-project';
import {
  MappingProjectCard,
  MappingProjectCardSkeleton,
} from '../mapping-project-card';
import { MappingProjectDetailScreen } from '../project-detail';
import { ListToolbar } from '../shared';
import {
  MappingsSectionContent,
  MappingsSectionTabs,
} from '../mappings-section';

const GRID_CLASS_NAME =
  'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4';

export function MappingsScreen(): JSX.Element {
  const [activeTab, setActiveTab] = useState<MappingsTab>(
    MAPPINGS_TAB.MAPPINGS,
  );
  const [listState, setListState] = useState<MappingProjectListState>({
    status: 'loading',
  });
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<MappingProjectSort>(
    DEFAULT_MAPPING_PROJECT_SORT,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  // Stays set after close so the dialog text doesn't vanish mid-animation.
  const [deleteTarget, setDeleteTarget] = useState<MappingProject | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  // Local view switch until a router exists; the grid keeps its search, sort
  // and page while a project is open.
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);

  const loadProjects = useCallback(async (): Promise<void> => {
    setListState({ status: 'loading' });
    try {
      const dtos = await listMappingProjects();
      setListState({
        status: 'success',
        data: dtos.map(apiDtoToMappingProject),
      });
    } catch (error) {
      logger.error('Loading mapping projects failed', { error });
      setListState({
        status: 'error',
        error: 'We couldn’t load your mapping projects. Please try again.',
      });
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const visibleProjects = useMemo(
    () =>
      listState.status === 'success'
        ? sortMappingProjects(
            filterMappingProjects(listState.data, search),
            sort,
          )
        : [],
    [listState, search, sort],
  );
  const currentPage = Math.min(
    page,
    getPageCount(visibleProjects.length, pageSize),
  );
  const pageProjects = paginate(visibleProjects, currentPage, pageSize);

  // Any change to what's being looked at starts again from page 1.
  const handleSearchChange = (value: string): void => {
    setSearch(value);
    setPage(1);
  };
  const handleSortChange = (value: MappingProjectSort): void => {
    setSort(value);
    setPage(1);
  };
  const handlePageSizeChange = (value: number): void => {
    setPageSize(value);
    setPage(1);
  };
  const handleClearSearch = (): void => {
    setSearch('');
    setPage(1);
  };

  const updateProjects = (
    update: (projects: MappingProject[]) => MappingProject[],
  ): void => {
    setListState((current) =>
      current.status === 'success'
        ? { ...current, data: update(current.data) }
        : current,
    );
  };

  const handleDuplicate = async (project: MappingProject): Promise<void> => {
    try {
      const copy = apiDtoToMappingProject(
        await duplicateMappingProject(project),
      );
      // MOCK: add locally until the list is re-fetched from a real API.
      updateProjects((projects) => [copy, ...projects]);
      toast.success('Project duplicated', {
        description: `“${copy.name}” is ready to edit.`,
      });
    } catch (error) {
      logger.error('Duplicating mapping project failed', {
        error,
        projectId: project.id,
      });
      toast.error('Couldn’t duplicate the project', {
        description: 'Please try again.',
      });
    }
  };

  const handleDelete = (project: MappingProject): void => {
    setDeleteTarget(project);
    setIsDeleteDialogOpen(true);
  };

  // Rejections propagate so ConfirmDialog can show its inline error.
  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) {
      return;
    }
    await deleteMappingProject(deleteTarget.id);
    // MOCK: remove locally until the list is re-fetched from a real API.
    updateProjects((projects) =>
      projects.filter((project) => project.id !== deleteTarget.id),
    );
    toast.success('Project deleted', {
      description: `“${deleteTarget.name}” and its templates are gone.`,
    });
  };

  // Rejections propagate so the dialog can show its inline error.
  const handleCreateProject = async (
    values: NewMappingProjectFormValues,
  ): Promise<void> => {
    const created = apiDtoToMappingProject(
      await createMappingProject(
        formValuesToCreateMappingProjectPayload(values),
      ),
    );
    // MOCK: prepend locally until the list is re-fetched from a real API.
    updateProjects((projects) => [created, ...projects]);
    // Clear the search so the new card is visible first.
    handleClearSearch();
    setIsNewDialogOpen(false);
    toast.success('Project created', {
      description: `“${created.name}” is ready for its first template.`,
    });
  };

  // Rejections propagate so the dialog can show its inline error.
  const handleImportProject = async (
    request: ImportMappingProjectRequest,
  ): Promise<ImportMappingProjectResult> => {
    const imported = apiDtoToMappingProject(
      await importMappingProject(request),
    );
    const existing =
      listState.status === 'success'
        ? findMappingProjectByName(listState.data, imported.name)
        : undefined;

    // MOCK: stands in for the server's 409 on a duplicate name.
    if (existing && !request.overwrite) {
      return { status: 'conflict', name: imported.name };
    }

    // Overwrite replaces the same-named project; either way the import goes first.
    updateProjects((projects) => [
      imported,
      ...projects.filter((project) => project.id !== existing?.id),
    ]);
    handleClearSearch();
    setIsImportDialogOpen(false);
    toast.success('Project imported', {
      description: `“${imported.name}” is ready to open.`,
    });
    return { status: 'imported' };
  };

  const handleNewProject = (): void => {
    setIsNewDialogOpen(true);
  };

  const handleOpen = (project: MappingProject): void => {
    setOpenProjectId(project.id);
  };

  // Keeps the card's template count, format and "updated" time in step with
  // changes made on the project's screen.
  const handleTemplatesChange = (
    projectId: string,
    templates: MappingTemplate[],
  ): void => {
    updateProjects((projects) =>
      projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              templateCount: templates.length,
              format: deriveProjectFormat(templates),
              updatedAt: new Date().toISOString(),
            }
          : project,
      ),
    );
  };

  // MOCK: the edit and export flows don't exist yet.
  const handleEditDetails = (project: MappingProject): void => {
    logger.info('Edit mapping project requested', { projectId: project.id });
  };
  const handleExport = (project: MappingProject): void => {
    logger.info('Export mapping project requested', { projectId: project.id });
  };

  const openProject =
    listState.status === 'success' && openProjectId
      ? listState.data.find((project) => project.id === openProjectId)
      : undefined;

  const renderContent = (): JSX.Element => {
    if (listState.status === 'loading') {
      return (
        <div className={GRID_CLASS_NAME} aria-busy>
          {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
            <MappingProjectCardSkeleton key={index} />
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
            title="Mapping projects didn’t load"
            description={listState.error}
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadProjects()}
              >
                Try again
              </Button>
            }
          />
        </div>
      );
    }

    if (visibleProjects.length === 0) {
      return (
        <div className="rounded-xl border bg-card">
          {search.trim() !== '' ? (
            <EmptyState
              icon={SearchX}
              title="No projects match your search"
              description="Try a different project name or description."
              action={
                <Button variant="outline" size="sm" onClick={handleClearSearch}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={FileCode}
              title="No mapping projects yet"
              description="Create a project to start mapping fields between message formats."
              action={
                <Button size="sm" onClick={handleNewProject}>
                  <Plus aria-hidden />
                  New Project
                </Button>
              }
            />
          )}
        </div>
      );
    }

    return (
      <ul className={GRID_CLASS_NAME}>
        {pageProjects.map((project) => (
          <li key={project.id}>
            <MappingProjectCard
              project={project}
              onOpen={handleOpen}
              onEditDetails={handleEditDetails}
              onDuplicate={(item) => void handleDuplicate(item)}
              onExport={handleExport}
              onDelete={handleDelete}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        if (isMappingsTab(value)) setActiveTab(value);
      }}
      className="h-full min-h-0 gap-0"
    >
      {/* Each view scrolls under its own breadcrumbs and Mappings | Filters
          strip; the tabs only switch the body below the strip. */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {openProject ? (
          <MappingProjectDetailScreen
            project={openProject}
            onBack={() => setOpenProjectId(null)}
            onTemplatesChange={handleTemplatesChange}
          />
        ) : (
          <>
            <MappingsSectionTabs />
            <MappingsSectionContent
              className="space-y-6 p-6"
              filtersClassName="p-6"
            >
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Mapping Projects
                </h1>
                <p className="text-sm text-muted-foreground">
                  Author field mappings visually and run them in workflows via
                  the Mapper node
                </p>
              </div>

              <div className="space-y-4">
                <ListToolbar
                  search={search}
                  onSearchChange={handleSearchChange}
                  searchPlaceholder="Search projects"
                  sort={sort}
                  sortOptions={MAPPING_PROJECT_SORT_OPTIONS}
                  onSortChange={handleSortChange}
                  count={
                    listState.status === 'success'
                      ? visibleProjects.length
                      : null
                  }
                  countNoun={{ one: 'project', other: 'projects' }}
                  disabled={listState.status !== 'success'}
                  actions={
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setIsImportDialogOpen(true)}
                      >
                        <Upload aria-hidden />
                        Import Project
                      </Button>
                      <Button onClick={handleNewProject}>
                        <Plus aria-hidden />
                        New Project
                      </Button>
                    </>
                  }
                />

                {renderContent()}

                {listState.status === 'success' &&
                  visibleProjects.length > PAGINATION_THRESHOLD && (
                    <div className="rounded-lg border bg-card">
                      <TablePagination
                        page={currentPage}
                        pageSize={pageSize}
                        totalItems={visibleProjects.length}
                        itemLabel="projects"
                        pageSizeOptions={PAGE_SIZE_OPTIONS}
                        onPageChange={setPage}
                        onPageSizeChange={handlePageSizeChange}
                      />
                    </div>
                  )}
              </div>
            </MappingsSectionContent>
          </>
        )}
      </div>

      <NewMappingProjectDialog
        open={isNewDialogOpen}
        onOpenChange={setIsNewDialogOpen}
        onCreate={handleCreateProject}
      />

      <ImportMappingProjectDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImportProject}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        destructive
        title="Delete mapping project?"
        description={
          <>
            This permanently deletes{' '}
            <span className="font-medium text-foreground">
              “{deleteTarget?.name}”
            </span>{' '}
            and all of its templates. Workflows using its Mapper node will stop
            mapping. You can’t undo this.
          </>
        }
        confirmLabel="Delete project"
        pendingLabel="Deleting…"
        onConfirm={handleConfirmDelete}
        errorMessage="We couldn’t delete the project. Please try again."
      />
    </Tabs>
  );
}
