import type { SourceValueType, TargetSample, TargetTreeNode } from '../@types';

/**
 * MOCK target sample (the order body the template produces) with the
 * template's saved mappings applied, until both come from the API.
 */

const mapped = (
  path: string,
  label: string,
  source: [ref: string, label: string],
  options: { valueType?: SourceValueType; hasRules?: boolean } = {},
): TargetTreeNode => ({
  path,
  label,
  valueType: options.valueType ?? 'text',
  source: { ref: source[0], label: source[1] },
  hasRules: options.hasRules ?? false,
});

const unmapped = (path: string, label: string): TargetTreeNode => ({
  path,
  label,
  valueType: 'text',
});

const ORDER_BODY_TREE: TargetTreeNode[] = [
  mapped('type', 'Type', ['MSH.9.1', 'Message Type']),
  mapped('event', 'Event', ['MSH.9.2', 'Trigger Event']),
  mapped('mrn', 'Mrn', ['PID.3.1', 'Patient ID'], { hasRules: true }),
  mapped('orderId', 'Order Id', ['ORC.2.1', 'Entity Identifier + Placer'], {
    hasRules: true,
  }),
  mapped('control', 'Control', ['ORC.1', 'Order Control'], { hasRules: true }),
  mapped('quantity', 'Quantity', ['ORC.7.1', 'Quantity'], { hasRules: true }),
  mapped('startDate', 'Start Date', ['ORC.7.4', 'Start Date/Time'], {
    valueType: 'datetime',
    hasRules: true,
  }),
  mapped('endDate', 'End Date', ['ORC.7.5', 'End Date/Time'], {
    valueType: 'datetime',
    hasRules: true,
  }),
  mapped('priority', 'Priority', ['ORC.7.6', 'Priority'], { hasRules: true }),
  mapped('standingStatus', 'Standing Status', ['ORC.7.8', 'Text'], {
    hasRules: true,
  }),
  mapped('orderTime', 'Order Time', ['ORC.9', 'Date/Time of Transaction'], {
    valueType: 'datetime',
    hasRules: true,
  }),
  mapped('department', 'Department', ['PV1.3.1', 'Point of Care']),
  {
    path: 'notes',
    label: 'Notes',
    repeatSource: 'NTE',
    children: [
      mapped('notes[0].text', 'Text', ['NTE.3', 'Comment'], {
        hasRules: true,
      }),
      mapped('notes[0].label', 'Label', ['NTE.3', 'Comment'], {
        hasRules: true,
      }),
      mapped('notes[0].value', 'Value', ['NTE.3', 'Comment'], {
        hasRules: true,
      }),
      mapped('notes[0].kind', 'Kind', ['NTE.4', 'Comment Type'], {
        hasRules: true,
      }),
    ],
  },
  unmapped('text', 'Text'),
  unmapped('label', 'Label'),
  unmapped('value', 'Value'),
  unmapped('kind', 'Kind'),
];

export const MOCK_TARGET_SAMPLE: TargetSample = {
  fileName: 'feeding_order_body.json',
  tree: ORDER_BODY_TREE,
};
