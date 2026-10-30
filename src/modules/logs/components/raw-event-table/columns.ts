/**
 * Shared column layout so the header, data rows and skeleton rows line up.
 * Description is capped so short messages don't leave a wide gap before
 * Status; Status takes whatever width is left.
 */
export const RAW_EVENT_COLUMNS: Array<{
  key: string;
  label: string;
  headClassName: string;
  skeletonClassName: string;
}> = [
  {
    key: 'expand',
    label: '',
    headClassName: 'w-12',
    skeletonClassName: 'w-4',
  },
  {
    key: 'when',
    label: 'When',
    headClassName: 'w-52',
    skeletonClassName: 'w-28',
  },
  {
    key: 'event',
    label: 'Event',
    headClassName: 'w-40',
    skeletonClassName: 'w-16',
  },
  {
    key: 'description',
    label: 'Description',
    headClassName: 'w-1/2',
    skeletonClassName: 'w-80',
  },
  {
    key: 'status',
    label: 'Status',
    headClassName: '',
    skeletonClassName: 'w-20',
  },
];

export const RAW_EVENT_CELL_CLASS_NAME = 'px-4 py-3';
