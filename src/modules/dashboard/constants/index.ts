import type { ActivityStatus } from '../@types';

export const KPI_ID = {
  CONNECTIONS: 'connections',
  WORKFLOWS: 'workflows',
  LICENSES: 'licenses',
} as const;

export const ACTIVITY_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  success: 'Success',
  failed: 'Failed',
};

/** Standards the platform supports, shown beside the page title. */
export const PLATFORM_STANDARDS = [
  'HIPAA Ready',
  'SMART on FHIR',
  'HL7v2',
] as const;

export const RECENT_ACTIVITY_LIMIT = 10;
export const SKELETON_KPI_COUNT = 3;
export const SKELETON_ACTIVITY_ROWS = 8;
