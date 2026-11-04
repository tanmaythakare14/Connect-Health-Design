import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type JSX,
} from 'react';
import { ChevronsDownUp, ChevronsUpDown, Search, SearchX } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { SourcePanelProps, SourceTreeNode } from '../../@types';
import {
  HL7_REF_PATTERN,
  MANUAL_SOURCE_GROUP_REF,
  SOURCE_SAMPLE_ACCEPT,
} from '../../constants';
import {
  collectBranchRefs,
  collectSourceFieldRefs,
  collectSourceRefs,
  countSourceFields,
  filterSourceTree,
  findSourceAncestors,
} from '../../utils';
import { SampleEmptyState, SampleFileBar } from '../shared';
import { ManualRefInput } from './ManualRefInput';
import { SourceTree } from './SourceTree';

/**
 * Left side of the template editor: the sample message as a searchable
 * field tree, plus fields added by ref when the sample doesn't have them.
 */
export function SourcePanel({
  sourceLabel,
  sample,
  mappedRefs,
  onReplaceSample,
  onRemoveSample,
  onRenameField,
}: SourcePanelProps): JSX.Element {
  const tree = useMemo(() => sample?.tree ?? [], [sample]);
  const branchRefs = useMemo(() => collectBranchRefs(tree), [tree]);
  const sampleRefs = useMemo(() => new Set(collectSourceRefs(tree)), [tree]);
  const sampleFieldRefs = useMemo(
    () => new Set(collectSourceFieldRefs(tree)),
    [tree],
  );

  const [query, setQuery] = useState('');
  const [expandedRefs, setExpandedRefs] = useState<Set<string>>(
    () => new Set([...branchRefs, MANUAL_SOURCE_GROUP_REF]),
  );
  const [selectedRef, setSelectedRef] = useState<string | null>(null);
  const [manualRefs, setManualRefs] = useState<string[]>([]);
  // Names given to fields added by ref (they aren't in the sample).
  const [manualLabels, setManualLabels] = useState<Record<string, string>>({});
  const [editingRef, setEditingRef] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Set when a row should be brought into view after the next render.
  const scrollToRef = useRef<string | null>(null);

  // A new sample file starts fully open, with nothing selected. Edits to
  // the same sample (a changed value) keep what's open and selected.
  const [shownFileName, setShownFileName] = useState(sample?.fileName);
  if (shownFileName !== sample?.fileName) {
    setShownFileName(sample?.fileName);
    setExpandedRefs(new Set([...branchRefs, MANUAL_SOURCE_GROUP_REF]));
    setSelectedRef(null);
    setEditingRef(null);
  }

  useEffect(() => {
    if (!scrollToRef.current) return;
    document
      .getElementById(`source-row-${scrollToRef.current}`)
      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    scrollToRef.current = null;
  });

  const manualGroup = useMemo<SourceTreeNode[]>(
    () =>
      manualRefs.length === 0
        ? []
        : [
            {
              ref: MANUAL_SOURCE_GROUP_REF,
              label: 'Added by ref',
              children: manualRefs.map((ref) => ({
                ref,
                label: manualLabels[ref] ?? ref,
                valueType: 'text',
              })),
            },
          ],
    [manualRefs, manualLabels],
  );

  const isSearching = query.trim() !== '';
  const visibleTree = useMemo(
    () => filterSourceTree(tree, query),
    [tree, query],
  );
  const visibleManual = useMemo(
    () => filterSourceTree(manualGroup, query),
    [manualGroup, query],
  );
  const isAllExpanded = branchRefs.every((ref) => expandedRefs.has(ref));
  const fieldCount = countSourceFields(tree) + manualRefs.length;
  const mappedCount = [...mappedRefs].filter(
    (ref) => sampleFieldRefs.has(ref) || manualRefs.includes(ref),
  ).length;

  const handleToggle = (ref: string): void => {
    setExpandedRefs((current) => {
      const next = new Set(current);
      if (next.has(ref)) next.delete(ref);
      else next.add(ref);
      return next;
    });
  };

  const handleToggleAll = (): void => {
    setExpandedRefs(
      isAllExpanded
        ? new Set()
        : new Set([...branchRefs, MANUAL_SOURCE_GROUP_REF]),
    );
  };

  /** Clears the search and opens every branch above `ref`, then selects it. */
  const revealField = (ref: string): void => {
    const ancestors = findSourceAncestors(tree, ref) ?? [
      MANUAL_SOURCE_GROUP_REF,
    ];
    setQuery('');
    setExpandedRefs((current) => new Set([...current, ...ancestors]));
    setSelectedRef(ref);
    scrollToRef.current = ref;
  };

  const handleAddRef = (raw: string): string | null => {
    const ref = raw.toUpperCase();
    if (!HL7_REF_PATTERN.test(ref)) {
      return 'Use a ref like PID.5.1 — segment, then field and component numbers.';
    }
    if (manualRefs.includes(ref)) {
      return `${ref} is already in the list.`;
    }
    if (sampleRefs.has(ref)) {
      revealField(ref);
      toast.info(`${ref} is already in the sample`, {
        description: 'We’ve selected it for you.',
      });
      return null;
    }
    setManualRefs((current) => [...current, ref]);
    revealField(ref);
    return null;
  };

  const handleRemoveRef = (ref: string): void => {
    setManualRefs((current) => current.filter((item) => item !== ref));
    if (selectedRef === ref) setSelectedRef(null);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) onReplaceSample(file);
    event.target.value = ''; // the same file can be picked again
  };

  const openFilePicker = (): void => fileInputRef.current?.click();

  const handleStartEdit = (ref: string): void => {
    setSelectedRef(ref);
    setEditingRef(ref);
  };

  const handleSaveEdit = (ref: string, label: string): void => {
    if (manualRefs.includes(ref)) {
      setManualLabels((current) => ({ ...current, [ref]: label }));
    } else {
      onRenameField(ref, label);
    }
    setEditingRef(null);
  };

  const treeProps = {
    expandedRefs,
    forceExpanded: isSearching,
    mappedRefs,
    selectedRef,
    onToggle: handleToggle,
    onSelect: setSelectedRef,
    editingRef,
    onStartEdit: handleStartEdit,
    onSaveEdit: handleSaveEdit,
    onCancelEdit: () => setEditingRef(null),
  };

  return (
    <section
      aria-labelledby="source-panel-heading"
      className="flex min-h-0 flex-1 flex-col bg-card"
    >
      <header className="flex h-11 shrink-0 items-center justify-between gap-3 border-b px-4">
        <div className="flex items-center gap-2">
          <h2
            id="source-panel-heading"
            className="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
          >
            Source
          </h2>
          <Badge
            variant="outline"
            className="rounded-md border-primary/30 bg-accent px-1.5 py-0 text-[11px] font-semibold text-primary"
          >
            {sourceLabel}
          </Badge>
        </div>
        {sample && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{mappedCount}</span>{' '}
            of {fieldCount} fields mapped
          </p>
        )}
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept={SOURCE_SAMPLE_ACCEPT}
        onChange={handleFileChange}
        className="hidden"
        tabIndex={-1}
        aria-hidden
      />

      {sample ? (
        <>
          <div className="shrink-0 space-y-2.5 p-3 pb-2">
            <SampleFileBar
              fileName={sample.fileName}
              caption="Sample message · values are for preview only"
              noun="sample"
              onReplace={openFilePicker}
              onRemove={onRemoveSample}
            />
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, ref or value"
                  aria-label="Search source fields"
                  className="h-8 pl-8 text-xs"
                />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleToggleAll}
                    disabled={isSearching}
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
            data-wire-viewport="source"
            className="min-h-0 flex-1 overflow-y-auto px-2 pb-3"
          >
            {visibleTree.length === 0 && visibleManual.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                <SearchX aria-hidden className="size-5 text-muted-foreground" />
                <p className="text-sm text-foreground">
                  No fields match “{query.trim()}”
                </p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => setQuery('')}
                  className="h-auto p-0 text-xs"
                >
                  Clear search
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <SourceTree nodes={visibleTree} {...treeProps} />
                {visibleManual.length > 0 && (
                  <SourceTree
                    nodes={visibleManual}
                    {...treeProps}
                    onRemoveField={handleRemoveRef}
                  />
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t p-3">
            <ManualRefInput onAdd={handleAddRef} />
          </div>
        </>
      ) : (
        <SampleEmptyState
          title="Add a sample message"
          description={`Upload a ${sourceLabel} message to see its fields. Its values are used only for the preview and are never saved.`}
          onUpload={openFilePicker}
        />
      )}
    </section>
  );
}
