/**
 * MOCK JSON the target tree (targetSample.ts) was built from — the feeding
 * order body — until target samples come from the template's API.
 */
export const MOCK_TARGET_PAYLOAD = JSON.stringify(
  {
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
      {
        text: 'Feeding Type 1->Breast Milk + Donor Milk',
        label: 'Feeding Type 1',
        value: 'Breast Milk + Donor Milk',
        kind: '',
      },
    ],
    text: '',
    label: '',
    value: '',
    kind: '',
  },
  null,
  2,
);
