/**
 * MOCK output of the Feeding order template run on its sample message,
 * until the preview is rendered from the real mappings.
 */

const note = (
  label: string,
  value: string,
  kind?: string,
): Record<string, string> => ({
  text: `${label}->${value}`,
  label,
  value,
  ...(kind ? { kind } : {}),
});

export const MOCK_LIVE_OUTPUT = {
  type: 'ORM',
  event: 'O01',
  mrn: '000012345678',
  orderId: '624655',
  control: 'NW',
  quantity: '30',
  startDate: '2026-06-10T12:15:00',
  endDate: '2026-06-12T07:55:00',
  priority: 'R',
  standingStatus: 'Standing',
  orderTime: '2026-06-10T12:13:28',
  department: 'NICU',
  notes: [
    note('Diet', 'Neonatal Diet', 'Diet Comments'),
    note('Feeding Frequency', 'Q3H'),
    note('Desired Volume Per Feeding in mL', '30'),
    note('Route', 'NG Nasogastric'),
    note('Feeding Type 1', 'Breast Milk + Donor Milk'),
    note('Feeding Type 1 Calorie Concentration (kcal/oz)', '24 kcal/oz'),
    note('Feeding Type 1 Fortifiers', 'Prolact+4'),
    note('Feeding Type 2', 'Prolact CR'),
    note('Feeding Type 2 Prolact CR Bolus Volume (mL)', '1'),
    note('Feeding Type 2 Prolact CR Frequency', 'Q3H'),
    note('Feeding Type 3', 'Expressed Breast Milk'),
    note('Feeding Type 3 Calorie Concentration (kcal/oz)', '24 kcal/oz'),
    note('Feeding Type 3 Fortifiers', 'Enfamil Liquid HMF'),
    note('Feeding Type 3 Modular', 'Liquigen'),
    note('Feeding Type 3 Liquigen Volume (mL)', '2'),
    note('Feeding Type 3 Liquigen Frequency (free text)', 'per 100 ml feed'),
    // This one has no "label->value" text in the source comment.
    {
      text: 'Feeding Type 1 as primary order as directed by physician',
      label: 'Feeding Type 1 as primary order as directed by physician',
      value: 'Feeding Type 1 as primary order as directed by physician',
      kind: 'Diet Comments',
    },
    note(
      'Feeding Type 2 Prolact CR Administration Instructions (free text)',
      'Cream at 1 mL for first feed then .5 mL/Kg for each feeding after that',
    ),
  ],
};
