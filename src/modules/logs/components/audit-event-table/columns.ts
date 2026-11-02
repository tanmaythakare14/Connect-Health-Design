/**
 * Shared column layout so the header, data rows and skeleton rows line up.
 * What takes whatever width is left.
 */
export const AUDIT_EVENT_COLUMNS: Array<{
  key: string;
  label: string;
  headClassName: string;
  skeletonClassName: string;
}> = [
  { key: 'expand', label: '', headClassName: 'w-12', skeletonClassName: 'w-4' },
  {
    key: 'when',
    label: 'When',
    headClassName: 'w-44',
    skeletonClassName: 'w-28',
  },
  {
    key: 'who',
    label: 'Who',
    headClassName: 'w-40',
    skeletonClassName: 'w-24',
  },
  { key: 'what', label: 'What', headClassName: '', skeletonClassName: 'w-36' },
  {
    key: 'resource',
    label: 'Resource',
    headClassName: 'w-52',
    skeletonClassName: 'w-32',
  },
  {
    key: 'action',
    label: 'Action',
    headClassName: 'w-20',
    skeletonClassName: 'w-6',
  },
  {
    key: 'status',
    label: 'Status',
    headClassName: 'w-32',
    skeletonClassName: 'w-20',
  },
  {
    key: 'connection',
    label: 'Connection',
    headClassName: 'w-44',
    skeletonClassName: 'w-24',
  },
];

export const AUDIT_EVENT_CELL_CLASS_NAME = 'px-4 py-3';
