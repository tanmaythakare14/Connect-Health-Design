import { useState, type JSX } from 'react';
import { ArrowRight, Plus, Repeat, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';
import type { MappingTableGroup, MappingTableRow } from '../../@types';
import { MOCK_TABLE_GROUPS, MOCK_TABLE_ROWS } from '../../mocks/mappingTable';
import { TableMappingRow } from './TableMappingRow';

const COLUMN_HEADING_CLASS_NAME =
  'text-[11px] font-semibold tracking-wider text-muted-foreground uppercase';

/** A blank row to fill in, added by "Add mapping". */
const createRow = (): MappingTableRow => ({
  id: crypto.randomUUID(),
  mode: 'ref',
  sourceRef: '',
  sourceLabel: '',
  expression: '',
  targetPath: '',
  targetLabel: '',
  occurrence: null,
  occurrenceIndex: 1,
  rules: [],
});

/**
 * The Target panel's Table tab: every mapping as a row — source (a ref or an
 * expression) → target, with its rules — then each repeating group's rows.
 */
export function TableView(): JSX.Element {
  // MOCK: built from the template's mappings once that's wired; changes here
  // stay in this view for now.
  const [rows, setRows] = useState<MappingTableRow[]>(MOCK_TABLE_ROWS);
  const [groups, setGroups] = useState<MappingTableGroup[]>(MOCK_TABLE_GROUPS);
  const total =
    rows.length + groups.reduce((sum, group) => sum + group.rows.length, 0);

  const updateRow = (id: string, patch: Partial<MappingTableRow>): void => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  const updateGroupRow = (
    groupId: string,
    rowId: string,
    patch: Partial<MappingTableRow>,
  ): void => {
    setGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? {
              ...group,
              rows: group.rows.map((row) =>
                row.id === rowId ? { ...row, ...patch } : row,
              ),
            }
          : group,
      ),
    );
  };

  const removeGroupRow = (groupId: string, rowId: string): void => {
    setGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? { ...group, rows: group.rows.filter((row) => row.id !== rowId) }
          : group,
      ),
    );
  };

  // MOCK: the rules editor isn't designed yet.
  const handleEditRules = (row: MappingTableRow): void => {
    logger.info('Edit table row rules requested', { rowId: row.id });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b px-3 py-2">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">
            {total}
          </span>{' '}
          {total === 1 ? 'mapping' : 'mappings'}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setRows((current) => [...current, createRow()])}
          className="h-7 px-2.5 text-xs"
        >
          <Plus aria-hidden className="size-3.5" />
          Add mapping
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Column headings line up with the row's source and target boxes */}
        <div
          aria-hidden
          className="sticky top-0 z-10 flex items-center gap-2 border-b bg-card/95 px-3 py-2 backdrop-blur"
        >
          <span className="w-16 shrink-0" />
          <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_1rem_minmax(0,1fr)] gap-2">
            <span className={COLUMN_HEADING_CLASS_NAME}>
              Source ref / expression
            </span>
            <span />
            <span className={COLUMN_HEADING_CLASS_NAME}>Target path</span>
          </div>
          <span className="w-15 shrink-0" />
        </div>

        <ul aria-label="Mappings">
          {rows.map((row) => (
            <TableMappingRow
              key={row.id}
              row={row}
              onChange={(patch) => updateRow(row.id, patch)}
              onRemove={() =>
                setRows((current) =>
                  current.filter((item) => item.id !== row.id),
                )
              }
              onEditRules={() => handleEditRules(row)}
            />
          ))}
        </ul>

        {groups.map((group) => (
          <section
            key={group.id}
            aria-label={`Repeating mapping ${group.sourceSegment} to ${group.targetPath}`}
            className="m-3 overflow-hidden rounded-lg border border-l-4 border-l-amber-400 bg-amber-50/30 dark:border-l-amber-500/70 dark:bg-amber-950/10"
          >
            <header className="flex items-center gap-2 border-b border-dashed px-3 py-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                <Repeat aria-hidden className="size-3" />
                {group.sourceSegment}
                <ArrowRight aria-hidden className="size-3" />
                {group.targetPath}[]
              </span>
              <span className="text-xs text-muted-foreground">
                one item per {group.sourceSegment} segment
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setGroups((current) =>
                    current.filter((item) => item.id !== group.id),
                  )
                }
                className="ml-auto h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <X aria-hidden className="size-3.5" />
                Remove mapping
              </Button>
            </header>
            <ul aria-label={`${group.targetPath} fields`} className="bg-card">
              {group.rows.map((row) => (
                <TableMappingRow
                  key={row.id}
                  row={row}
                  onChange={(patch) => updateGroupRow(group.id, row.id, patch)}
                  onRemove={() => removeGroupRow(group.id, row.id)}
                  onEditRules={() => handleEditRules(row)}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
