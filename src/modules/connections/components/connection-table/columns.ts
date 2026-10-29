/**
 * Shared column layout so the header, data rows and skeleton rows line up.
 * The table uses a fixed layout, so every column gets an equal share of the width.
 */
export const CONNECTION_COLUMNS: Array<{
  key: string;
  label: string;
  headClassName: string;
  skeletonClassName: string;
}> = [
  {
    key: 'id',
    label: 'Connection ID',
    headClassName: '',
    skeletonClassName: 'w-36',
  },
  {
    key: 'source',
    label: 'Source',
    headClassName: '',
    skeletonClassName: 'w-24',
  },
  {
    key: 'name',
    label: 'Connection name',
    headClassName: '',
    skeletonClassName: 'w-40',
  },
  {
    key: 'type',
    label: 'Type',
    headClassName: '',
    skeletonClassName: 'w-20',
  },
  {
    key: 'status',
    label: 'Status',
    headClassName: '',
    skeletonClassName: 'w-16',
  },
  {
    key: 'actions',
    label: 'Actions',
    headClassName: '',
    skeletonClassName: 'w-16',
  },
];

export const CELL_CLASS_NAME = 'px-4 py-2.5';
