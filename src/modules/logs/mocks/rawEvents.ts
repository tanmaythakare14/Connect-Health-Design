import type { RawEventApiDto } from '../@types';
import { RAW_EVENT_LEVEL, RAW_EVENT_STATUS } from '../constants';

type MockTemplate = Pick<RawEventApiDto, 'level' | 'status' | 'message'> & {
  /** Background jobs log without a correlation ID */
  hasCorrelationId: boolean;
};

const MOCK_TEMPLATES: MockTemplate[] = [
  {
    level: RAW_EVENT_LEVEL.WARN,
    status: RAW_EVENT_STATUS.WARNING,
    message: 'CDS Hooks: JWKS refresh failed; keeping previously cached keys',
    hasCorrelationId: false,
  },
  {
    level: RAW_EVENT_LEVEL.INFO,
    status: RAW_EVENT_STATUS.SUCCESS,
    message:
      '[Licensing] The license server heartbeat gave no license; the marketplace covers usage',
    hasCorrelationId: false,
  },
  {
    level: RAW_EVENT_LEVEL.WARN,
    status: RAW_EVENT_STATUS.WARNING,
    message:
      '[ConnectionIdentity] Athena URL did not match expected site-specific pattern',
    hasCorrelationId: true,
  },
  {
    level: RAW_EVENT_LEVEL.INFO,
    status: RAW_EVENT_STATUS.SUCCESS,
    message: '[Scheduler] Nightly backend sync finished for 3 connections',
    hasCorrelationId: true,
  },
  {
    level: RAW_EVENT_LEVEL.WARN,
    status: RAW_EVENT_STATUS.SERIOUS_FAILURE,
    message:
      '[FHIR] Epic token refresh failed after 3 retries; connection paused',
    hasCorrelationId: true,
  },
  {
    level: RAW_EVENT_LEVEL.WARN,
    status: RAW_EVENT_STATUS.MAJOR_FAILURE,
    message:
      '[Database] Primary database unreachable; failed over to the read replica',
    hasCorrelationId: false,
  },
  {
    level: RAW_EVENT_LEVEL.INFO,
    status: RAW_EVENT_STATUS.SUCCESS,
    message: '[Workflows] “SOAP Note Draft Generator” published (version 14)',
    hasCorrelationId: true,
  },
  {
    level: RAW_EVENT_LEVEL.WARN,
    status: RAW_EVENT_STATUS.WARNING,
    message:
      '[Webhooks] Delivery to hooks.northwind.example retried 5 times before succeeding',
    hasCorrelationId: true,
  },
];

/** The ConnectHealth instances that write to the log (host-process). */
const MOCK_SOURCES = [
  'healthconnect-ip-10-0-2-58.ec2.internal-34',
  'healthconnect-ip-10-0-2-58.ec2.internal-35',
  'healthconnect-ip-10-0-3-117.ec2.internal-12',
];

const MOCK_EVENT_COUNT = 160;
/** The newest events arrive minutes apart, like a busy console */
const RECENT_EVENT_COUNT = 40;
const RECENT_GAP_MS = 97 * 1000;
/** Older events spread across the last two weeks */
const OLDER_GAP_MS =
  (14 * 24 * 60 * 60 * 1000) / (MOCK_EVENT_COUNT - RECENT_EVENT_COUNT);

const hex = (seed: number, length: number): string =>
  ((seed * 2654435761) >>> 0).toString(16).padStart(8, '0').slice(0, length);

/** Weighted so routine events dominate and major failures are rare. */
const TEMPLATE_PATTERN = [0, 0, 1, 0, 2, 3, 0, 1, 6, 7, 0, 2, 4, 0, 1, 3, 0, 5];

const now = Date.now();

/** MOCK application log, newest first. */
const MOCK_RAW_EVENTS: RawEventApiDto[] = Array.from(
  { length: MOCK_EVENT_COUNT },
  (_, index) => {
    const { hasCorrelationId, ...template } =
      MOCK_TEMPLATES[TEMPLATE_PATTERN[index % TEMPLATE_PATTERN.length]];
    const ageMs =
      index < RECENT_EVENT_COUNT
        ? index * RECENT_GAP_MS
        : RECENT_EVENT_COUNT * RECENT_GAP_MS +
          (index - RECENT_EVENT_COUNT) * OLDER_GAP_MS;

    return {
      ...template,
      id: `evt_${hex(index + 501, 8)}${hex(index + 9, 4)}`,
      occurredAt: new Date(now - ageMs).toISOString(),
      source: MOCK_SOURCES[index % MOCK_SOURCES.length],
      correlationId: hasCorrelationId ? `corr_${hex(index + 9001, 8)}` : null,
    };
  },
);

export function getMockRawEvents(): RawEventApiDto[] {
  return MOCK_RAW_EVENTS;
}
