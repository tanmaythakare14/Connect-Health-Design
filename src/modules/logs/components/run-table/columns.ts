/**
 * Shared column layout so the header, data rows and skeleton rows line up.
 * Fixed widths for the short columns; Trigger and Workflow share the rest.
 */
export const RUN_COLUMNS: Array<{
  key: string;
  label: string;
  headClassName: string;
  skeletonClassName: string;
}> = [
  {
    key: 'status',
    label: 'Status',
    headClassName: 'w-32',
    skeletonClassName: 'w-20',
  },
  {
    key: 'started',
    label: 'Started',
    headClassName: 'w-28',
    skeletonClassName: 'w-16',
  },
  {
    key: 'trigger',
    label: 'Trigger',
    headClassName: 'w-1/5',
    skeletonClassName: 'w-32',
  },
  {
    key: 'workflow',
    label: 'Workflow',
    headClassName: '',
    skeletonClassName: 'w-48',
  },
  {
    key: 'steps',
    label: 'Steps',
    headClassName: 'w-24',
    skeletonClassName: 'w-10',
  },
  {
    key: 'duration',
    label: 'Duration',
    headClassName: 'w-28',
    skeletonClassName: 'w-12',
  },
  {
    key: 'failedAt',
    label: 'Failed at',
    headClassName: 'w-1/6',
    skeletonClassName: 'w-24',
  },
  {
    key: 'actions',
    label: '',
    headClassName: 'w-14',
    skeletonClassName: 'w-4',
  },
];

export const RUN_CELL_CLASS_NAME = 'px-4 py-2.5';
