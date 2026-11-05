import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from 'react';
import { CircleAlert, FileCode, Plus, SearchX } from 'lucide-react';
import { toast } from 'sonner';
import {
  ConfirmDialog,
  EmptyState,
  TablePagination,
} from '@/components/common';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';
import { getPageCount, paginate } from '@/utils/pagination';
import type {
  MappingProjectDetailScreenProps,
  MappingTemplate,
  MappingTemplateFormValues,
  TemplateDetailsFormValues,
  MappingTemplateListState,
  MappingTemplateSort,
} from '../../@types';
import {
  DEFAULT_MAPPING_TEMPLATE_SORT,
  DEFAULT_PAGE_SIZE,
  MAPPING_TEMPLATE_SORT_OPTIONS,
  PAGE_SIZE_OPTIONS,
  PAGINATION_THRESHOLD,
  SKELETON_CARD_COUNT,
} from '../../constants';
import {
  apiDtoToMappingTemplate,
  createMappingTemplate,
  deleteMappingTemplate,
  formValuesToSaveMappingTemplatePayload,
  listMappingTemplates,
  mappingTemplateToFormValues,
  updateMappingTemplate,
} from '../../service';
import { filterMappingTemplates, sortMappingTemplates } from '../../utils';
import { MappingProjectCardSkeleton } from '../mapping-project-card';
import { ListToolbar } from '../shared';
import { MappingTemplateCard } from '../template-card';
import {
  EditTemplateDetailsDialog,
  MappingTemplateDialog,
} from '../template-dialog';

import { MappingTemplateEditorScreen } from '../template-editor';
import { MappingProjectHeader } from './MappingProjectHeader';

const GRID_CLASS_NAME =
  'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4';

/** One mapping project: its details, then every template in it. */
export function MappingProjectDetailScreen({
  project,
  onBack,
  onTemplatesChange,
}: MappingProjectDetailScreenProps): JSX.Element {
  const [listState, setListState] = useState<MappingTemplateListState>({
    status: 'loading',
  });
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<MappingTemplateSort>(
    DEFAULT_MAPPING_TEMPLATE_SORT,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  // The dialog edits this template, or adds one when it's null.
  const [editTarget, setEditTarget] = useState<MappingTemplate | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  // Edit from a card changes only the name and description.
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  // Stays set after close so the dialog text doesn't vanish mid-animation.
  const [deleteTarget, setDeleteTarget] = useState<MappingTemplate | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // Briefly highlights a card that was just added or saved.
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  // The template whose fields are being mapped; replaces the list while set.
  const [openTemplateId, setOpenTemplateId] = useState<string | null>(null);

  const loadTemplates = useCallback(async (): Promise<void> => {
    setListState({ status: 'loading' });
    try {
      const dtos = await listMappingTemplates(project.id);
      setListState({
        status: 'success',
        data: dtos.map(apiDtoToMappingTemplate),
      });
    } catch (error) {
      logger.error('Loading mapping templates failed', {
        error,
        projectId: project.id,
      });
      setListState({
        status: 'error',
        error: 'We couldn’t load this project’s templates. Please try again.',
      });
    }
  }, [project.id]);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  // The grid may have been scrolled; open the project at its top.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    rootRef.current?.scrollIntoView({ block: 'start' });
  }, []);

  useEffect(() => {
    if (!highlightedId) return;
    const timer = setTimeout(() => setHighlightedId(null), 2000);
    return () => clearTimeout(timer);
  }, [highlightedId]);

  const allTemplates = useMemo(
    () => (listState.status === 'success' ? listState.data : []),
    [listState],
  );
  const visibleTemplates = useMemo(
    () =>
      sortMappingTemplates(filterMappingTemplates(allTemplates, search), sort),
    [allTemplates, search, sort],
  );
  const currentPage = Math.min(
    page,
    getPageCount(visibleTemplates.length, pageSize),
  );
  const pageTemplates = paginate(visibleTemplates, currentPage, pageSize);

  // Any change to what's being looked at starts again from page 1.
  const handleSearchChange = (value: string): void => {
    setSearch(value);
    setPage(1);
  };
  const handleSortChange = (value: MappingTemplateSort): void => {
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

  /** Applies a change locally and tells the projects grid about it. */
  const commitTemplates = (
    update: (templates: MappingTemplate[]) => MappingTemplate[],
  ): void => {
    const next = update(allTemplates);
    setListState({ status: 'success', data: next });
    onTemplatesChange(project.id, next);
  };

  const handleAddTemplate = (): void => {
    setIsTemplateDialogOpen(true);
  };

  const handleEdit = (template: MappingTemplate): void => {
    setEditTarget(template);
    setIsDetailsDialogOpen(true);
  };

  // Rejections propagate so the dialog can show its inline error.
  const handleSaveDetails = async (
    values: TemplateDetailsFormValues,
  ): Promise<void> => {
    if (!editTarget) return;
    // Everything else is saved back exactly as it was.
    const payload = formValuesToSaveMappingTemplatePayload({
      ...mappingTemplateToFormValues(editTarget),
      ...values,
    });
    const updated = apiDtoToMappingTemplate(
      await updateMappingTemplate(project.id, editTarget.id, payload),
    );
    commitTemplates((templates) =>
      templates.map((template) =>
        template.id === updated.id ? updated : template,
      ),
    );
    setIsDetailsDialogOpen(false);
    setHighlightedId(updated.id);
    toast.success('Template updated', {
      description: `“${updated.name}” has been saved.`,
    });
  };

  // Rejections propagate so the dialog can show its inline error.
  const handleCreateTemplate = async (
    values: MappingTemplateFormValues,
  ): Promise<void> => {
    const created = apiDtoToMappingTemplate(
      await createMappingTemplate(
        project.id,
        formValuesToSaveMappingTemplatePayload(values),
      ),
    );
    commitTemplates((templates) => [created, ...templates]);
    // Show the new card first: no search, newest first, page 1.
    setSearch('');
    setSort(DEFAULT_MAPPING_TEMPLATE_SORT);
    setPage(1);
    setIsTemplateDialogOpen(false);
    setHighlightedId(created.id);
    toast.success('Template added', {
      description: `“${created.name}” is a draft until its fields are mapped.`,
    });
  };

  const handleDelete = (template: MappingTemplate): void => {
    setDeleteTarget(template);
    setIsDeleteDialogOpen(true);
  };

  // Rejections propagate so ConfirmDialog can show its inline error.
  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) {
      return;
    }
    await deleteMappingTemplate(project.id, deleteTarget.id);
    commitTemplates((templates) =>
      templates.filter((template) => template.id !== deleteTarget.id),
    );
    toast.success('Template deleted', {
      description: `“${deleteTarget.name}” was removed from this project.`,
    });
  };

  const handleOpen = (template: MappingTemplate): void => {
    setOpenTemplateId(template.id);
  };

  const openTemplate = allTemplates.find(
    (template) => template.id === openTemplateId,
  );
  if (openTemplate) {
    return (
      <MappingTemplateEditorScreen
        project={project}
        template={openTemplate}
        onBack={() => setOpenTemplateId(null)}
        onBackToProjects={onBack}
      />
    );
  }

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
            title="Templates didn’t load"
            description={listState.error}
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadTemplates()}
              >
                Try again
              </Button>
            }
          />
        </div>
      );
    }

    if (visibleTemplates.length === 0) {
      return (
        <div className="rounded-xl border border-dashed bg-card">
          {search.trim() !== '' ? (
            <EmptyState
              icon={SearchX}
              title="No templates match your search"
              description="Try a different name, description or message type."
              action={
                <Button variant="outline" size="sm" onClick={handleClearSearch}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={FileCode}
              title="No templates yet"
              description="A template maps one kind of message, for example an HL7 admit into a JSON body. Add the first one to start mapping."
              action={
                <Button size="sm" onClick={handleAddTemplate}>
                  <Plus aria-hidden />
                  Add Template
                </Button>
              }
            />
          )}
        </div>
      );
    }

    return (
      <ul className={GRID_CLASS_NAME}>
        {pageTemplates.map((template) => (
          <li
            key={template.id}
            className={
              template.id === highlightedId
                ? 'rounded-xl ring-2 ring-primary/40 ring-offset-2 ring-offset-background transition-shadow duration-500 animate-in fade-in-0 zoom-in-95'
                : undefined
            }
          >
            <MappingTemplateCard
              template={template}
              onOpen={handleOpen}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div
      ref={rootRef}
      className="space-y-6 p-6 animate-in fade-in-0 slide-in-from-right-2 duration-200"
    >
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button
                type="button"
                onClick={onBack}
                className="rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                Mappings
              </button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-64 truncate">
              {project.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Full width: cancel out the page padding */}
      <MappingProjectHeader
        project={project}
        templates={listState.status === 'success' ? listState.data : null}
      />

      <section
        aria-labelledby="mapping-templates-heading"
        className="space-y-4"
      >
        <div className="space-y-0.5 border-t pt-6">
          <h2
            id="mapping-templates-heading"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            Templates
          </h2>
          <p className="text-sm text-muted-foreground">
            Each template maps one kind of message. The Mapper node picks the
            one that matches the incoming message.
          </p>
        </div>

        <ListToolbar
          search={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search templates"
          sort={sort}
          sortOptions={MAPPING_TEMPLATE_SORT_OPTIONS}
          onSortChange={handleSortChange}
          count={
            listState.status === 'success' ? visibleTemplates.length : null
          }
          countNoun={{ one: 'template', other: 'templates' }}
          disabled={listState.status !== 'success'}
          actions={
            <Button
              onClick={handleAddTemplate}
              disabled={listState.status !== 'success'}
            >
              <Plus aria-hidden />
              Add Template
            </Button>
          }
        />

        {renderContent()}

        {listState.status === 'success' &&
          visibleTemplates.length > PAGINATION_THRESHOLD && (
            <div className="rounded-lg border bg-card">
              <TablePagination
                page={currentPage}
                pageSize={pageSize}
                totalItems={visibleTemplates.length}
                itemLabel="templates"
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
      </section>

      <MappingTemplateDialog
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
        template={null}
        onSubmit={handleCreateTemplate}
      />

      <EditTemplateDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        template={editTarget}
        onSubmit={handleSaveDetails}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        destructive
        title="Delete template?"
        description={
          <>
            This permanently deletes{' '}
            <span className="font-medium text-foreground">
              “{deleteTarget?.name}”
            </span>{' '}
            and its field mappings. Messages it handled will no longer be mapped
            by this project. You can’t undo this.
          </>
        }
        confirmLabel="Delete template"
        pendingLabel="Deleting…"
        onConfirm={handleConfirmDelete}
        errorMessage="We couldn’t delete the template. Please try again."
      />
    </div>
  );
}
