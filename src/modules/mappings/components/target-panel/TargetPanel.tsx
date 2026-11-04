import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type JSX,
  type ReactNode,
} from 'react';
import {
  ChevronsDownUp,
  ChevronsUpDown,
  Plus,
  Search,
  SearchX,
} from 'lucide-react';
import { LineTabsList, LineTabsTrigger } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type {
  NewTargetField,
  NewTargetGroup,
  TargetAddKind,
  TargetAdding,
  TargetFilter,
  TargetPanelProps,
  TargetTreeNode,
  TargetView,
} from '../../@types';
import {
  TARGET_ADD_KIND,
  TARGET_FILTER,
  TARGET_SAMPLE_ACCEPT,
  TARGET_VIEW,
} from '../../constants';
import {
  collectTargetBranchPaths,
  countTargetFields,
  filterTargetTree,
  findTargetNode,
  humanizeTargetKey,
  targetChildPath,
  targetKeyOf,
} from '../../utils';
import { SampleEmptyState, SampleFileBar } from '../shared';
import { MappingProgress } from './MappingProgress';
import { TargetAddFieldForm } from './TargetAddFieldForm';
import { TargetAddGroupForm } from './TargetAddGroupForm';
import { TargetFilterToggle } from './TargetFilterToggle';
import { TargetTree } from './TargetTree';
import { TargetViewPlaceholder } from './TargetViewPlaceholder';

const TARGET_VIEW_TABS: Array<{ value: TargetView; label: string }> = [
  { value: TARGET_VIEW.FIELDS, label: 'Target' },
  { value: TARGET_VIEW.TABLE, label: 'Table' },
  { value: TARGET_VIEW.LIQUID, label: 'Liquid' },
];

const isTargetView = (value: string): value is TargetView =>
  TARGET_VIEW_TABS.some((tab) => tab.value === value);

/**
 * Middle of the template editor: the output's fields as a tree, each
 * showing where its value comes from, with Table and Liquid views beside it.
 */
export function TargetPanel({
  sample,
  onReplaceSample,
  onRemoveSample,
  onEditValue,
  onEditRules,
  onDeleteField,
  onAddNode,
  onAddItem,
}: TargetPanelProps): JSX.Element {
  const tree = useMemo(() => sample?.tree ?? [], [sample]);
  const branchPaths = useMemo(() => collectTargetBranchPaths(tree), [tree]);
  const { mapped, total } = useMemo(() => countTargetFields(tree), [tree]);

  const [view, setView] = useState<TargetView>(TARGET_VIEW.FIELDS);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<TargetFilter>(TARGET_FILTER.ALL);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    () => new Set(branchPaths),
  );
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [adding, setAdding] = useState<TargetAdding | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // A new sample file starts fully open, with nothing selected. Edits to
  // the tree (adding, deleting) keep what was collapsed and open new branches.
  const [shownTree, setShownTree] = useState(tree);
  const [shownFileName, setShownFileName] = useState(sample?.fileName);
  if (shownTree !== tree) {
    setShownTree(tree);
    if (shownFileName !== sample?.fileName) {
      setShownFileName(sample?.fileName);
      setExpandedPaths(new Set(branchPaths));
      setSelectedPath(null);
    } else {
      const known = new Set(collectTargetBranchPaths(shownTree));
      setExpandedPaths(
        (current) =>
          new Set([...current, ...branchPaths.filter((p) => !known.has(p))]),
      );
    }
  }

  const isNarrowed = query.trim() !== '' || filter !== TARGET_FILTER.ALL;
  const visibleTree = useMemo(
    () => filterTargetTree(tree, query, filter),
    [tree, query, filter],
  );
  const isAllExpanded = branchPaths.every((path) => expandedPaths.has(path));

  const handleToggle = (path: string): void => {
    setExpandedPaths((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) onReplaceSample(file);
    event.target.value = ''; // the same file can be picked again
  };

  const openFilePicker = (): void => fileInputRef.current?.click();

  /** The + menu on a branch: open the matching inline form, or copy an item. */
  const handleAddRequest = (
    parent: TargetTreeNode,
    kind: TargetAddKind,
  ): void => {
    if (kind === TARGET_ADD_KIND.ITEM) {
      onAddItem(parent);
      return;
    }
    // Show the form, and the new row once added, whatever was filtered.
    setQuery('');
    setFilter(TARGET_FILTER.ALL);
    setExpandedPaths((current) => new Set([...current, parent.path]));
    setAdding({ parentPath: parent.path, kind });
  };

  const handleAddField = (
    parent: TargetTreeNode | null,
    field: NewTargetField,
  ): void => {
    onAddNode(parent?.path ?? null, {
      path: targetChildPath(parent, field.name),
      label: humanizeTargetKey(field.name),
      valueType: field.valueType,
      isList: field.isList,
    });
    setAdding(null);
  };

  const handleAddGroup = (
    parent: TargetTreeNode | null,
    group: NewTargetGroup,
  ): void => {
    const groupNode: TargetTreeNode = {
      path: targetChildPath(parent, group.name),
      label: humanizeTargetKey(group.name),
      isList: group.isList,
      children: [],
    };
    if (group.firstField) {
      groupNode.children = [
        {
          path: targetChildPath(groupNode, group.firstField),
          label: humanizeTargetKey(group.firstField),
          valueType: 'text',
        },
      ];
    }
    onAddNode(parent?.path ?? null, groupNode);
    setExpandedPaths((current) => new Set([...current, groupNode.path]));
    setAdding(null);
  };

  /** The open inline form for `parent` (null: the top level), if any. */
  const renderAddForm = (parent: TargetTreeNode | null): ReactNode => {
    if (!adding || adding.parentPath !== (parent?.path ?? null)) return null;
    // Look the branch up in the full tree: the one shown may be filtered.
    const siblings = parent
      ? (findTargetNode(tree, parent.path)?.children ?? [])
      : tree;
    const takenNames = siblings.map((node) => targetKeyOf(node.path));
    const cancel = (): void => setAdding(null);
    return adding.kind === TARGET_ADD_KIND.GROUP ? (
      <TargetAddGroupForm
        takenNames={takenNames}
        onSubmit={(group) => handleAddGroup(parent, group)}
        onCancel={cancel}
      />
    ) : (
      <TargetAddFieldForm
        takenNames={takenNames}
        onSubmit={(field) => handleAddField(parent, field)}
        onCancel={cancel}
      />
    );
  };

  const clearNarrowing = (): void => {
    setQuery('');
    setFilter(TARGET_FILTER.ALL);
  };

  const renderFields = (): JSX.Element => {
    if (!sample) {
      return (
        <SampleEmptyState
          title="Add a target sample"
          description="Upload a JSON example of the output. Its fields become the targets you map onto."
          onUpload={openFilePicker}
        />
      );
    }

    return (
      <>
        <div className="shrink-0 space-y-2.5 p-3 pb-2">
          <SampleFileBar
            fileName={sample.fileName}
            caption="Target sample · shapes the output"
            noun="target sample"
            onReplace={openFilePicker}
            onRemove={onRemoveSample}
          />
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search field, path or source"
                aria-label="Search target fields"
                className="h-8 pl-8 text-xs"
              />
            </div>
            <TargetFilterToggle
              value={filter}
              onChange={setFilter}
              neededCount={total - mapped}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setExpandedPaths(
                      isAllExpanded ? new Set() : new Set(branchPaths),
                    )
                  }
                  disabled={isNarrowed || branchPaths.length === 0}
                  aria-label={isAllExpanded ? 'Collapse all' : 'Expand all'}
                  className="size-8"
                >
                  {isAllExpanded ? (
                    <ChevronsDownUp aria-hidden className="size-3.5" />
                  ) : (
                    <ChevronsUpDown aria-hidden className="size-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isAllExpanded ? 'Collapse all' : 'Expand all'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div
          data-wire-viewport="target"
          className="min-h-0 flex-1 overflow-y-auto px-2 pb-3"
        >
          {visibleTree.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <SearchX aria-hidden className="size-5 text-muted-foreground" />
              <p className="text-sm text-foreground">
                {filter === TARGET_FILTER.NEEDED && query.trim() === ''
                  ? 'Every field is mapped'
                  : 'No fields match'}
              </p>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={clearNarrowing}
                className="h-auto p-0 text-xs"
              >
                Show all fields
              </Button>
            </div>
          ) : (
            <TargetTree
              nodes={visibleTree}
              expandedPaths={expandedPaths}
              forceExpanded={isNarrowed}
              selectedPath={selectedPath}
              onToggle={handleToggle}
              onSelect={setSelectedPath}
              onEditValue={onEditValue}
              onEditRules={onEditRules}
              onDeleteField={onDeleteField}
              onAddField={handleAddRequest}
              renderAddForm={renderAddForm}
            />
          )}
        </div>

        <div className="shrink-0 border-t p-3">
          {renderAddForm(null) ?? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setAdding({ parentPath: null, kind: TARGET_ADD_KIND.FIELD })
              }
              className="w-full border-dashed text-muted-foreground hover:text-foreground"
            >
              <Plus aria-hidden />
              Add target field
            </Button>
          )}
        </div>
      </>
    );
  };

  return (
    <Tabs
      value={view}
      onValueChange={(value) => {
        if (isTargetView(value)) setView(value);
      }}
      className="flex min-h-0 flex-1 flex-col gap-0 bg-card"
    >
      <header className="flex h-11 shrink-0 items-center justify-between gap-3 border-b px-4">
        <LineTabsList aria-label="Target view" className="w-auto border-b-0">
          {TARGET_VIEW_TABS.map((tab) => (
            <LineTabsTrigger
              key={tab.value}
              value={tab.value}
              className="h-11 text-xs font-semibold"
            >
              {tab.label}
            </LineTabsTrigger>
          ))}
        </LineTabsList>
        {sample && <MappingProgress mapped={mapped} total={total} />}
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept={TARGET_SAMPLE_ACCEPT}
        onChange={handleFileChange}
        className="hidden"
        tabIndex={-1}
        aria-hidden
      />

      <TabsContent
        value={TARGET_VIEW.FIELDS}
        className="mt-0 flex min-h-0 flex-1 flex-col"
      >
        {renderFields()}
      </TabsContent>
      <TabsContent
        value={TARGET_VIEW.TABLE}
        className="mt-0 flex min-h-0 flex-1 flex-col"
      >
        <TargetViewPlaceholder
          title="Table view"
          description="Every mapping as a row: target, source and rules side by side."
        />
      </TabsContent>
      <TabsContent
        value={TARGET_VIEW.LIQUID}
        className="mt-0 flex min-h-0 flex-1 flex-col"
      >
        <TargetViewPlaceholder
          title="Liquid view"
          description="The Liquid template these mappings produce."
        />
      </TabsContent>
    </Tabs>
  );
}
