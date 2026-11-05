import type { MappingTableGroup, MappingTableRow } from '../@types';

/**
 * MOCK table rows for the feeding order template, until the Table view is
 * built from the template's mappings.
 */

const TRIM = 'Trim spaces';
const ISO_DATETIME = 'Date & time, ISO (FHIR)';

const refRow = (
  id: string,
  source: [ref: string, label: string],
  target: [path: string, label: string],
  options: Partial<MappingTableRow> = {},
): MappingTableRow => ({
  id,
  mode: 'ref',
  sourceRef: source[0],
  sourceLabel: source[1],
  expression: '',
  targetPath: target[0],
  targetLabel: target[1],
  occurrence: null,
  occurrenceIndex: 1,
  rules: [],
  ...options,
});

/** ORC can repeat, so its rows pick which occurrence they read. */
const ORC_FIRST: Partial<MappingTableRow> = {
  occurrence: 'specific',
  occurrenceIndex: 1,
};

export const MOCK_TABLE_ROWS: MappingTableRow[] = [
  refRow('type', ['MSH.9.1', 'Message Type'], ['type', 'Type']),
  refRow('event', ['MSH.9.2', 'Trigger Event'], ['event', 'Event']),
  refRow('mrn', ['PID.3.1', 'Patient ID'], ['mrn', 'Mrn'], { rules: [TRIM] }),
  refRow(
    'order-id-1',
    ['ORC.2.1', 'Entity Identifier'],
    ['orderId', 'Order Id'],
    { ...ORC_FIRST, rules: [TRIM], multiSource: { position: 1, total: 2 } },
  ),
  refRow(
    'order-id-2',
    ['ORC.8.1', 'Placer Assigned Identifier'],
    ['orderId', 'Order Id'],
    { ...ORC_FIRST, rules: [TRIM], multiSource: { position: 2, total: 2 } },
  ),
  refRow('control', ['ORC.1', 'Order Control'], ['control', 'Control'], {
    ...ORC_FIRST,
    rules: [TRIM, 'UPPERCASE'],
  }),
  refRow('quantity', ['ORC.7.1', 'Quantity'], ['quantity', 'Quantity'], {
    ...ORC_FIRST,
    rules: [TRIM],
  }),
  refRow(
    'start-date',
    ['ORC.7.4', 'Start Date/Time'],
    ['startDate', 'Start Date'],
    { ...ORC_FIRST, rules: [ISO_DATETIME] },
  ),
  refRow('end-date', ['ORC.7.5', 'End Date/Time'], ['endDate', 'End Date'], {
    ...ORC_FIRST,
    rules: [ISO_DATETIME],
  }),
  refRow('priority', ['ORC.7.6', 'Priority'], ['priority', 'Priority'], {
    ...ORC_FIRST,
    rules: [TRIM],
  }),
  refRow(
    'standing-status',
    ['ORC.7.8', 'Text'],
    ['standingStatus', 'Standing Status'],
    { ...ORC_FIRST, rules: [TRIM] },
  ),
  refRow(
    'order-time-1',
    ['ORC.9', 'Date/Time of Transaction'],
    ['orderTime', 'Order Time'],
    {
      ...ORC_FIRST,
      rules: [ISO_DATETIME],
      multiSource: { position: 1, total: 2 },
    },
  ),
  refRow(
    'order-time-2',
    ['MSH.7', 'Date/Time of Message'],
    ['orderTime', 'Order Time'],
    { rules: [ISO_DATETIME], multiSource: { position: 2, total: 2 } },
  ),
  refRow(
    'department',
    ['PV1.3.1', 'Point of Care'],
    ['department', 'Department'],
  ),
  // A row still being filled in, and an expression with a mistake in it.
  refRow('draft-ref', ['', ''], ['', '']),
  {
    ...refRow('draft-expression', ['', ''], ['', '']),
    mode: 'expression',
    expression: '{{ "" }}',
  },
];

const SPLIT = 'Split it into entries first';

export const MOCK_TABLE_GROUPS: MappingTableGroup[] = [
  {
    id: 'nte-notes',
    sourceSegment: 'NTE',
    targetPath: 'notes',
    rows: [
      refRow('note-text', ['NTE.3', 'Comment'], ['text', 'Text'], {
        occurrence: 'all',
        rules: [TRIM],
      }),
      refRow('note-label', ['NTE.3', 'Comment'], ['label', 'Label'], {
        occurrence: 'all',
        rules: [SPLIT, 'First entry of a list', TRIM],
      }),
      refRow('note-value', ['NTE.3', 'Comment'], ['value', 'Value'], {
        occurrence: 'all',
        rules: [SPLIT, 'Last entry of a list', TRIM],
      }),
      refRow('note-kind', ['NTE.4', 'Comment Type'], ['kind', 'Kind'], {
        occurrence: 'all',
        rules: [TRIM],
      }),
    ],
  },
];
