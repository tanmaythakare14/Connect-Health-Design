import {
  useMemo,
  useState,
  type CSSProperties,
  type JSX,
  type ReactNode,
} from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog, PanelResizeHandle } from '@/components/common';
import { useResizablePanels } from '@/hooks/useResizablePanels';
import { logger } from '@/utils/logger';
import type {
  MappingTemplateEditorScreenProps,
  SourceSample,
  SourceTreeNode,
  TargetSample,
  TargetTreeNode,
  TargetValueChange,
} from '../../@types';
import { TEMPLATE_INPUT_TYPE_LABELS } from '../../constants';
import {
  MOCK_MAPPED_SOURCE_REFS,
  MOCK_SOURCE_SAMPLE,
} from '../../mocks/sourceSample';
import { MOCK_LIVE_OUTPUT } from '../../mocks/liveOutput';
import { MOCK_TARGET_SAMPLE } from '../../mocks/targetSample';
import {
  addTargetListItem,
  applyTargetValue,
  collectMappingLinks,
  countTargetFields,
  insertTargetNode,
  removeTargetNode,
  renameSourceField,
} from '../../utils';
import { saveMappingTemplateMappings } from '../../service';
import { MappingWireLayer } from '../mapping-wires';
import { OutputPanel } from '../output-panel';
import { SourcePanel } from '../source-panel';
import { TargetPanel, TargetValueDialog } from '../target-panel';
import { TemplateEditorHeader } from './TemplateEditorHeader';

// Columns, left to right: source, the gap for mapping threads, target,
// output. Every edge can be dragged; the panels start equal, the gap narrow.
const COLUMN = { SOURCE: 0, GAP: 1, TARGET: 2, OUTPUT: 3 } as const;
const COLUMN_INITIAL_SIZES = [1, 0.12, 1, 1];
const COLUMN_MIN_WIDTHS_PX = [280, 32, 280, 280];

// Stable empties, so the threads don't redraw on every render.
const EMPTY_SOURCE_TREE: SourceTreeNode[] = [];
const EMPTY_TARGET_TREE: TargetTreeNode[] = [];

const PANEL_CLASS_NAME = 'flex min-h-0 min-w-0 basis-0 flex-col';

/** What deleting a target field or group takes with it, in plain words. */
function describeTargetDelete(node: TargetTreeNode | null): ReactNode {
  if (!node) return null;
  const name = (
    <span className="font-medium text-foreground">“{node.label}”</span>
  );
  if (node.children) {
    const { total, mapped } = countTargetFields(node.children);
    return (
      <>
        This removes the {name} group and the {total}{' '}
        {total === 1 ? 'field' : 'fields'} in it from the target
        {mapped > 0 && (
          <>
            , along with {mapped} {mapped === 1 ? 'mapping' : 'mappings'}
          </>
        )}
        . The output won’t include it any more.
      </>
    );
  }
  return (
    <>
      This removes {name}{' '}
      <span className="font-mono text-xs">({node.path})</span> from the target
      {node.source && (
        <>
          , along with its mapping from{' '}
          <span className="font-medium text-foreground">
            {node.source.label}
          </span>
        </>
      )}
      . The output won’t include it any more.
    </>
  );
}

/** Maps one template's source fields onto its target, full height. */
export function MappingTemplateEditorScreen({
  project,
  template,
  onBack,
  onBackToProjects,
}: MappingTemplateEditorScreenProps): JSX.Element {
  const { sizes, panelRef, startResize, resizeBy, reset, activeHandle } =
    useResizablePanels({
      initialSizes: COLUMN_INITIAL_SIZES,
      minSizesPx: COLUMN_MIN_WIDTHS_PX,
    });
  const panelStyle = (index: number): CSSProperties => ({
    flexGrow: sizes[index],
    minWidth: COLUMN_MIN_WIDTHS_PX[index],
  });

  // MOCK: every template opens on the same parsed ORM^O01 sample.
  const [sample, setSample] = useState<SourceSample | null>(MOCK_SOURCE_SAMPLE);

  // MOCK: the tree isn't re-parsed from the file yet; only its name changes.
  const handleReplaceSample = (file: File): void => {
    setSample({ fileName: file.name, tree: MOCK_SOURCE_SAMPLE.tree });
    toast.success('Sample replaced', {
      description: `Fields now come from “${file.name}”.`,
    });
  };

  const handleRemoveSample = (): void => {
    const removed = sample;
    setSample(null);
    toast('Sample removed', {
      description: 'Your mappings are kept.',
      action: { label: 'Undo', onClick: () => setSample(removed) },
    });
  };

  // MOCK: the target tree isn't re-parsed from the file yet either.
  const [targetSample, setTargetSample] = useState<TargetSample | null>(
    MOCK_TARGET_SAMPLE,
  );
  const links = useMemo(
    () => collectMappingLinks(targetSample?.tree ?? EMPTY_TARGET_TREE),
    [targetSample],
  );
  // Stays set after close so the dialog text doesn't vanish mid-animation.
  const [deleteTarget, setDeleteTarget] = useState<TargetTreeNode | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // The field the Output value dialog is for; kept while it closes.
  const [valueTarget, setValueTarget] = useState<TargetTreeNode | null>(null);
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);

  // What was last saved, to tell whether there's anything new to save.
  const [saved, setSaved] = useState({
    sample: MOCK_SOURCE_SAMPLE as SourceSample | null,
    targetSample: MOCK_TARGET_SAMPLE as TargetSample | null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const hasUnsavedChanges =
    sample !== saved.sample || targetSample !== saved.targetSample;

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    try {
      await saveMappingTemplateMappings(project.id, template.id);
      setSaved({ sample, targetSample });
      toast.success('Mappings saved', {
        description: `“${template.name}” is up to date.`,
      });
    } catch (error) {
      logger.error('Saving template mappings failed', {
        error,
        templateId: template.id,
      });
      toast.error('We couldn’t save your mappings', {
        description: 'Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // MOCK: auto-mapping isn't designed yet.
  const handleAutoMap = (): void => {
    logger.info('Auto-map fields requested', { templateId: template.id });
  };

  const handleReplaceTargetSample = (file: File): void => {
    setTargetSample({ fileName: file.name, tree: MOCK_TARGET_SAMPLE.tree });
    toast.success('Target sample replaced', {
      description: `Target fields now come from “${file.name}”.`,
    });
  };

  const handleRemoveTargetSample = (): void => {
    const removed = targetSample;
    setTargetSample(null);
    toast('Target sample removed', {
      description: 'Your mappings are kept.',
      action: { label: 'Undo', onClick: () => setTargetSample(removed) },
    });
  };

  // MOCK: renames in the local sample only until saving exists.
  const handleRenameSourceField = (ref: string, label: string): void => {
    setSample((current) =>
      current
        ? { ...current, tree: renameSourceField(current.tree, ref, label) }
        : current,
    );
  };

  // MOCK: field rules and custom values aren't designed yet.
  const handleEditTargetValue = (node: TargetTreeNode): void => {
    setValueTarget(node);
    setIsValueDialogOpen(true);
  };

  // MOCK: set on the local tree only until saving exists.
  const handleApplyTargetValue = (
    path: string,
    change: TargetValueChange,
  ): void => {
    setTargetSample((current) =>
      current
        ? { ...current, tree: applyTargetValue(current.tree, path, change) }
        : current,
    );
  };

  const handleEditTargetRules = (node: TargetTreeNode): void => {
    logger.info('Edit target field rules requested', {
      templateId: template.id,
      path: node.path,
    });
  };

  // MOCK: only removed from the local tree until saving exists.
  const handleDeleteTargetField = (node: TargetTreeNode): void => {
    setDeleteTarget(node);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDeleteTarget = (): void => {
    if (!deleteTarget) return;
    setTargetSample((current) =>
      current
        ? {
            ...current,
            tree: removeTargetNode(current.tree, deleteTarget.path),
          }
        : current,
    );
    toast.success(deleteTarget.children ? 'Group deleted' : 'Field deleted', {
      description: `“${deleteTarget.label}” was removed from the target.`,
    });
  };

  // MOCK: added to the local tree only until saving exists.
  const handleAddTargetNode = (
    parentPath: string | null,
    node: TargetTreeNode,
  ): void => {
    setTargetSample((current) =>
      current
        ? { ...current, tree: insertTargetNode(current.tree, parentPath, node) }
        : current,
    );
  };

  // MOCK: added to the local tree only until saving exists.
  const handleAddTargetItem = (group: TargetTreeNode): void => {
    setTargetSample((current) =>
      current
        ? { ...current, tree: addTargetListItem(current.tree, group.path) }
        : current,
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col animate-in fade-in-0 duration-200">
      <TemplateEditorHeader
        project={project}
        template={template}
        onBack={onBack}
        onBackToProjects={onBackToProjects}
        onAutoMap={handleAutoMap}
        onSave={() => void handleSave()}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
      />

      <div className="relative flex min-h-0 flex-1">
        <div
          ref={panelRef(COLUMN.SOURCE)}
          style={panelStyle(COLUMN.SOURCE)}
          className={PANEL_CLASS_NAME}
        >
          <SourcePanel
            sourceLabel={TEMPLATE_INPUT_TYPE_LABELS[template.inputType]}
            sample={sample}
            mappedRefs={MOCK_MAPPED_SOURCE_REFS}
            onReplaceSample={handleReplaceSample}
            onRemoveSample={handleRemoveSample}
            onRenameField={handleRenameSourceField}
          />
        </div>

        <PanelResizeHandle
          label="Resize source panel"
          isActive={activeHandle === COLUMN.SOURCE}
          onPointerDown={(event) => startResize(COLUMN.SOURCE, event)}
          onResizeBy={(delta) => resizeBy(COLUMN.SOURCE, delta)}
          onReset={reset}
        />

        {/* Room for the mapping threads between the two trees. */}
        <div
          aria-hidden
          ref={panelRef(COLUMN.GAP)}
          style={panelStyle(COLUMN.GAP)}
          className="basis-0 bg-canvas"
        />

        <PanelResizeHandle
          label="Resize gap between source and target"
          isActive={activeHandle === COLUMN.GAP}
          onPointerDown={(event) => startResize(COLUMN.GAP, event)}
          onResizeBy={(delta) => resizeBy(COLUMN.GAP, delta)}
          onReset={reset}
        />

        <div
          ref={panelRef(COLUMN.TARGET)}
          style={panelStyle(COLUMN.TARGET)}
          className={PANEL_CLASS_NAME}
        >
          <TargetPanel
            sample={targetSample}
            onReplaceSample={handleReplaceTargetSample}
            onRemoveSample={handleRemoveTargetSample}
            onEditValue={handleEditTargetValue}
            onEditRules={handleEditTargetRules}
            onDeleteField={handleDeleteTargetField}
            onAddNode={handleAddTargetNode}
            onAddItem={handleAddTargetItem}
          />
        </div>

        <PanelResizeHandle
          label="Resize target and output panels"
          isActive={activeHandle === COLUMN.TARGET}
          onPointerDown={(event) => startResize(COLUMN.TARGET, event)}
          onResizeBy={(delta) => resizeBy(COLUMN.TARGET, delta)}
          onReset={reset}
          className="max-xl:hidden"
        />

        <div
          ref={panelRef(COLUMN.OUTPUT)}
          style={panelStyle(COLUMN.OUTPUT)}
          className={`${PANEL_CLASS_NAME} max-xl:hidden`}
        >
          {/* MOCK: the preview isn't rendered from the mappings yet. */}
          <OutputPanel output={sample ? MOCK_LIVE_OUTPUT : null} />
        </div>

        <MappingWireLayer
          links={links}
          sourceTree={sample?.tree ?? EMPTY_SOURCE_TREE}
          targetTree={targetSample?.tree ?? EMPTY_TARGET_TREE}
        />
      </div>

      <TargetValueDialog
        open={isValueDialogOpen}
        onOpenChange={setIsValueDialogOpen}
        node={valueTarget}
        onApply={handleApplyTargetValue}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        destructive
        title={deleteTarget?.children ? 'Delete group?' : 'Delete field?'}
        description={describeTargetDelete(deleteTarget)}
        confirmLabel={deleteTarget?.children ? 'Delete group' : 'Delete field'}
        confirmIcon={Trash2}
        onConfirm={handleConfirmDeleteTarget}
      />
    </div>
  );
}
