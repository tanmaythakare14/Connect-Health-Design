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
  GroupCondition,
  MappingLink,
  MappingSuggestion,
  MappingTemplateEditorScreenProps,
  SourceSample,
  SourceSampleSubmission,
  SourceTreeNode,
  TargetSample,
  TargetSampleSubmission,
  TargetTreeNode,
  TargetValueChange,
} from '../../@types';
import {
  TEMPLATE_INPUT_TYPE_LABELS,
  TEMPLATE_OUTPUT_TYPE,
} from '../../constants';
import { MOCK_SOURCE_SAMPLE } from '../../mocks/sourceSample';
import { MOCK_LIVE_OUTPUT } from '../../mocks/liveOutput';
import { MOCK_SOURCE_PAYLOAD } from '../../mocks/sourcePayload';
import { MOCK_TARGET_PAYLOAD } from '../../mocks/targetPayload';
import { MOCK_TARGET_SAMPLE } from '../../mocks/targetSample';
import {
  addTargetListItem,
  applyMappingSuggestions,
  applyTargetValue,
  collectMappingLinks,
  countTargetFields,
  insertTargetNode,
  isSameMappingLink,
  openMappingSuggestions,
  removeTargetLink,
  removeTargetNode,
  renameSourceField,
  setTargetConditions,
  suggestMappings,
} from '../../utils';
import { saveMappingTemplateMappings } from '../../service';
import { GroupConditionsDialog } from '../conditions-dialog';
import {
  MappingsSectionContent,
  MappingsSectionTabs,
} from '../mappings-section';
import { MappingWireLayer } from '../mapping-wires';
import { OutputPanel } from '../output-panel';
import { ReplaceSampleDialog, TargetSampleDialog } from '../sample-dialog';
import { SourcePanel } from '../source-panel';
import { TargetPanel, TargetValueDialog } from '../target-panel';
import { AutoMapBanner } from './AutoMapBanner';
import { TemplateEditorActions } from './TemplateEditorActions';
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

  // The pasted payload behind the sample, and whether to keep it with the template.
  const [samplePayload, setSamplePayload] = useState(MOCK_SOURCE_PAYLOAD);
  const [saveSampleWithTemplate, setSaveSampleWithTemplate] = useState(true);
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false);

  // MOCK: the payload isn't parsed yet, so the tree stays the ORM^O01 one.
  const handleLoadSample = (submission: SourceSampleSubmission): void => {
    setSamplePayload(submission.payload);
    setSaveSampleWithTemplate(submission.saveWithTemplate);
    setSample({
      fileName: `${submission.messageType || 'Pasted'} sample message`,
      tree: MOCK_SOURCE_SAMPLE.tree,
    });
    toast.success('Source fields loaded', {
      description: submission.saveWithTemplate
        ? 'The sample will be saved with the template.'
        : 'The sample is kept for this session only.',
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
  // Source fields with a thread to the target, so the Source panel marks them.
  const mappedSourceRefs = useMemo(
    () => new Set(links.map((link) => link.sourceRef)),
    [links],
  );

  // MOCK: removed from the local tree only until saving exists.
  const handleRemoveLink = (link: MappingLink): void => {
    if (!targetSample) return;
    const before = targetSample;
    setTargetSample({
      ...targetSample,
      tree: removeTargetLink(targetSample.tree, link),
    });
    toast('Mapping removed', {
      description: `${link.sourceRef} no longer fills ${link.targetPath}.`,
      action: { label: 'Undo', onClick: () => setTargetSample(before) },
    });
  };
  // Stays set after close so the dialog text doesn't vanish mid-animation.
  const [deleteTarget, setDeleteTarget] = useState<TargetTreeNode | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // The field the Output value dialog is for; kept while it closes.
  const [valueTarget, setValueTarget] = useState<TargetTreeNode | null>(null);
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
  // The group the Conditions dialog is for; kept while it closes.
  const [conditionsTarget, setConditionsTarget] =
    useState<TargetTreeNode | null>(null);
  const [isConditionsDialogOpen, setIsConditionsDialogOpen] = useState(false);

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

  // Auto-map guesses waiting for review. Ones whose field has since been
  // mapped (or deleted) drop out on their own.
  const [suggestions, setSuggestions] = useState<MappingSuggestion[]>([]);
  const openSuggestions = useMemo(
    () =>
      openMappingSuggestions(
        targetSample?.tree ?? EMPTY_TARGET_TREE,
        suggestions,
      ),
    [targetSample, suggestions],
  );

  const handleAutoMap = (): void => {
    if (!sample || !targetSample) {
      toast('Add both samples first', {
        description: 'Auto-map matches source fields to target fields by name.',
      });
      return;
    }
    const found = suggestMappings(sample.tree, targetSample.tree);
    setSuggestions(found);
    if (found.length > 0) {
      toast.info(
        `${found.length} ${found.length === 1 ? 'field' : 'fields'} matched`,
        { description: 'Review the amber lines, then Accept all.' },
      );
      return;
    }
    const { mapped, total } = countTargetFields(targetSample.tree);
    if (mapped === total) {
      toast.success('Every field is already mapped');
    } else {
      toast('No matches found', {
        description:
          'Map the remaining fields by hand, or give them a fixed value.',
      });
    }
  };

  // MOCK: applied to the local tree only until saving exists.
  const acceptSuggestions = (accepted: MappingSuggestion[]): void => {
    if (!targetSample || accepted.length === 0) return;
    const before = { targetSample, suggestions };
    setTargetSample({
      ...targetSample,
      tree: applyMappingSuggestions(targetSample.tree, accepted),
    });
    setSuggestions((current) =>
      current.filter(
        (item) => !accepted.some((done) => isSameMappingLink(item, done)),
      ),
    );
    const [first] = accepted;
    toast.success(
      `${accepted.length} ${accepted.length === 1 ? 'mapping' : 'mappings'} added`,
      {
        description:
          accepted.length === 1
            ? `${first.sourceRef} now fills ${first.targetPath}.`
            : 'Check them in the target, then save.',
        action: {
          label: 'Undo',
          onClick: () => {
            setTargetSample(before.targetSample);
            setSuggestions(before.suggestions);
          },
        },
      },
    );
  };

  const handleRejectSuggestion = (rejected: MappingSuggestion): void => {
    setSuggestions((current) =>
      current.filter((item) => !isSameMappingLink(item, rejected)),
    );
  };

  const handleDiscardSuggestions = (): void => {
    const discarded = suggestions;
    setSuggestions([]);
    toast('Suggestions discarded', {
      action: { label: 'Undo', onClick: () => setSuggestions(discarded) },
    });
  };

  // The pasted JSON behind the target sample, and its options.
  const [targetPayload, setTargetPayload] = useState(MOCK_TARGET_PAYLOAD);
  const [saveTargetWithTemplate, setSaveTargetWithTemplate] = useState(true);
  const [useTargetAsTemplate, setUseTargetAsTemplate] = useState(false);
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false);

  // MOCK: the JSON isn't parsed yet, so the tree stays the feeding-order one.
  const handleLoadTargetSample = (submission: TargetSampleSubmission): void => {
    setTargetPayload(submission.payload);
    setSaveTargetWithTemplate(submission.saveWithTemplate);
    setUseTargetAsTemplate(submission.useAsOutputTemplate);
    setTargetSample({
      fileName: 'Target sample (JSON)',
      tree: MOCK_TARGET_SAMPLE.tree,
    });
    toast.success('Target fields loaded', {
      description: submission.useAsOutputTemplate
        ? 'Unmapped fields will keep the sample’s values.'
        : submission.saveWithTemplate
          ? 'The sample will be saved with the template.'
          : 'Only the field structure and names will be saved.',
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

  // Groups and objects get conditions; field rules aren't designed yet.
  const handleEditTargetRules = (node: TargetTreeNode): void => {
    if (node.children) {
      setConditionsTarget(node);
      setIsConditionsDialogOpen(true);
      return;
    }
    logger.info('Edit target field rules requested', {
      templateId: template.id,
      path: node.path,
    });
  };

  // MOCK: set on the local tree only until saving exists.
  const handleSaveConditions = (
    path: string,
    conditions: GroupCondition[],
  ): void => {
    setTargetSample((current) =>
      current
        ? {
            ...current,
            tree: setTargetConditions(current.tree, path, conditions),
          }
        : current,
    );
    toast.success(
      conditions.length > 0 ? 'Conditions saved' : 'Conditions removed',
      {
        description:
          conditions.length > 0
            ? `The group is written only when ${
                conditions.length === 1
                  ? 'its condition holds'
                  : `all ${conditions.length} conditions hold`
              }.`
            : 'The group is always written.',
      },
    );
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
      />
      <MappingsSectionTabs
        actions={
          <TemplateEditorActions
            template={template}
            onAutoMap={handleAutoMap}
            onSave={() => void handleSave()}
            hasUnsavedChanges={hasUnsavedChanges}
            isSaving={isSaving}
          />
        }
      />

      <MappingsSectionContent
        className="flex min-h-0 flex-1 flex-col"
        filtersClassName="min-h-0 flex-1 overflow-y-auto p-6"
      >
        {openSuggestions.length > 0 && (
          <AutoMapBanner
            count={openSuggestions.length}
            onAcceptAll={() => acceptSuggestions(openSuggestions)}
            onDiscard={handleDiscardSuggestions}
          />
        )}
        <div className="relative flex min-h-0 flex-1">
          <div
            ref={panelRef(COLUMN.SOURCE)}
            style={panelStyle(COLUMN.SOURCE)}
            className={PANEL_CLASS_NAME}
          >
            <SourcePanel
              sourceLabel={TEMPLATE_INPUT_TYPE_LABELS[template.inputType]}
              sample={sample}
              mappedRefs={mappedSourceRefs}
              onReplaceSample={() => setIsReplaceDialogOpen(true)}
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
              onReplaceSample={() => setIsTargetDialogOpen(true)}
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
            suggestions={openSuggestions}
            sourceTree={sample?.tree ?? EMPTY_SOURCE_TREE}
            targetTree={targetSample?.tree ?? EMPTY_TARGET_TREE}
            onRemoveLink={handleRemoveLink}
            onAcceptSuggestion={(suggestion) => acceptSuggestions([suggestion])}
            onRejectSuggestion={handleRejectSuggestion}
          />
        </div>
      </MappingsSectionContent>

      <ReplaceSampleDialog
        open={isReplaceDialogOpen}
        onOpenChange={setIsReplaceDialogOpen}
        inputType={template.inputType}
        initialMessageType={template.messageType}
        initialMessageVersion={template.messageVersion}
        initialPayload={samplePayload}
        initialSaveWithTemplate={saveSampleWithTemplate}
        onLoad={handleLoadSample}
      />

      <TargetSampleDialog
        open={isTargetDialogOpen}
        onOpenChange={setIsTargetDialogOpen}
        hasSample={targetSample !== null}
        messageType={template.messageType}
        canUseAsOutputTemplate={
          template.outputType === TEMPLATE_OUTPUT_TYPE.FHIR_JSON
        }
        initialPayload={targetPayload}
        initialSaveWithTemplate={saveTargetWithTemplate}
        initialUseAsOutputTemplate={useTargetAsTemplate}
        onLoad={handleLoadTargetSample}
      />

      <GroupConditionsDialog
        open={isConditionsDialogOpen}
        onOpenChange={setIsConditionsDialogOpen}
        node={conditionsTarget}
        onSave={handleSaveConditions}
      />

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
