import type { AuditEventApiDto } from '../@types';
import { AUDIT_ACTION, AUDIT_ACTOR_TYPE, AUDIT_STATUS } from '../constants';

type MockTemplate = Pick<
  AuditEventApiDto,
  'eventType' | 'action' | 'display' | 'resource' | 'status' | 'connection'
> & {
  requestPath: string;
  requestMethod: string;
};

const MOCK_TEMPLATES: MockTemplate[] = [
  {
    eventType: 'workflow.list',
    action: AUDIT_ACTION.READ,
    display: 'All workflows listed',
    resource: { name: 'All workflows', type: 'Workflow' },
    status: AUDIT_STATUS.SUCCESS,
    connection: null,
    requestPath: '/api/workflows?page=1&limit=100',
    requestMethod: 'GET',
  },
  {
    eventType: 'connection.get',
    action: AUDIT_ACTION.READ,
    display: 'Connection retrieved',
    resource: { name: 'Cds hook test2', type: 'Connection' },
    status: AUDIT_STATUS.SUCCESS,
    connection: { name: 'epic', type: 'Backend' },
    requestPath: '/api/connections/conn-epic-1042',
    requestMethod: 'GET',
  },
  {
    eventType: 'connection.list',
    action: AUDIT_ACTION.READ,
    display: 'Connections listed',
    resource: { name: 'All integrations', type: 'Connection' },
    status: AUDIT_STATUS.SUCCESS,
    connection: null,
    requestPath: '/api/connections?page=1&limit=50',
    requestMethod: 'GET',
  },
  {
    eventType: 'connection.update',
    action: AUDIT_ACTION.UPDATE,
    display: 'Connection updated',
    resource: { name: 'Riverside Health backend sync', type: 'Connection' },
    status: AUDIT_STATUS.SUCCESS,
    connection: { name: 'cerner', type: 'Backend' },
    requestPath: '/api/connections/conn-cerner-2207',
    requestMethod: 'PUT',
  },
  {
    eventType: 'workflow.create',
    action: AUDIT_ACTION.CREATE,
    display: 'Workflow created',
    resource: { name: 'SOAP Note Draft Generator', type: 'Workflow' },
    status: AUDIT_STATUS.SUCCESS,
    connection: null,
    requestPath: '/api/workflows',
    requestMethod: 'POST',
  },
  {
    eventType: 'connection.test',
    action: AUDIT_ACTION.READ,
    display: 'Connection test run',
    resource: { name: 'Claims backend pipeline', type: 'Connection' },
    status: AUDIT_STATUS.FAILED,
    connection: { name: 'stedi', type: 'Backend' },
    requestPath: '/api/connections/conn-stedi-3301/test',
    requestMethod: 'POST',
  },
  {
    eventType: 'workflow.delete',
    action: AUDIT_ACTION.DELETE,
    display: 'Workflow deleted',
    resource: { name: 'QA_COH829_Retest1', type: 'Workflow' },
    status: AUDIT_STATUS.DENIED,
    connection: null,
    requestPath: '/api/workflows/wf-qa-coh829-retest1',
    requestMethod: 'DELETE',
  },
  {
    eventType: 'apikey.revoke',
    action: AUDIT_ACTION.DELETE,
    display: 'API key revoked',
    resource: { name: 'delete-auth-1787828392091', type: 'API key' },
    status: AUDIT_STATUS.SUCCESS,
    connection: null,
    requestPath: '/api/api-keys/delete-auth-1787828392091',
    requestMethod: 'DELETE',
  },
];

const MOCK_ACTORS: Array<AuditEventApiDto['actor'] & { ipAddress: string }> = [
  {
    id: 'ch-design',
    name: 'ch-design',
    type: AUDIT_ACTOR_TYPE.USER,
    ipAddress: '::ffff:10.0.11.10',
  },
  {
    id: 'admin',
    name: 'Administrator',
    type: AUDIT_ACTOR_TYPE.USER,
    ipAddress: '::ffff:10.0.4.22',
  },
  {
    id: 'tanmay',
    name: 'tanmay',
    type: AUDIT_ACTOR_TYPE.USER,
    ipAddress: '::ffff:10.0.11.37',
  },
  {
    id: 'svc-scheduler',
    name: 'Scheduler',
    type: AUDIT_ACTOR_TYPE.SERVICE,
    ipAddress: '10.0.2.58',
  },
];

const MOCK_SOURCES = [
  'healthconnect-ip-10-0-1-167.ec2.internal-34',
  'healthconnect-ip-10-0-2-58.ec2.internal-35',
];

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36';

const MOCK_EVENT_COUNT = 120;
/** The newest events arrive seconds apart, like an active console session */
const RECENT_EVENT_COUNT = 30;
const RECENT_GAP_MS = 2.5 * 1000;
/** Older events spread across the last two weeks */
const OLDER_GAP_MS =
  (14 * 24 * 60 * 60 * 1000) / (MOCK_EVENT_COUNT - RECENT_EVENT_COUNT);

const hex = (seed: number, length: number): string =>
  ((seed * 2654435761) >>> 0).toString(16).padStart(8, '0').slice(0, length);

/** Weighted so reads dominate, like a real console audit trail. */
const TEMPLATE_PATTERN = [0, 1, 2, 2, 2, 0, 2, 3, 2, 4, 2, 0, 5, 2, 6, 2, 7];
const ACTOR_PATTERN = [0, 1, 1, 1, 1, 1, 2, 1, 3];

const now = Date.now();

/** MOCK audit trail, newest first. */
const MOCK_AUDIT_EVENTS: AuditEventApiDto[] = Array.from(
  { length: MOCK_EVENT_COUNT },
  (_, index) => {
    const { requestPath, requestMethod, ...template } =
      MOCK_TEMPLATES[TEMPLATE_PATTERN[index % TEMPLATE_PATTERN.length]];
    const { ipAddress, ...actor } =
      MOCK_ACTORS[ACTOR_PATTERN[index % ACTOR_PATTERN.length]];
    const ageMs =
      index < RECENT_EVENT_COUNT
        ? index * RECENT_GAP_MS
        : RECENT_EVENT_COUNT * RECENT_GAP_MS +
          (index - RECENT_EVENT_COUNT) * OLDER_GAP_MS;
    const occurredAt = new Date(now - ageMs).toISOString();
    const correlationId = `Root=1-${hex(index + 7, 8)}-${hex(index + 31, 8)}${hex(index + 3, 8)}${hex(index + 5, 8)}`;

    return {
      ...template,
      actor,
      ipAddress,
      id: `${occurredAt.replace(/[:.]/g, '_')}_${template.eventType.replace('.', '_')}_${actor.id}_${correlationId.replace('=', '_')}__0`,
      occurredAt,
      source: MOCK_SOURCES[index % MOCK_SOURCES.length],
      metadata: {
        requestPath,
        requestMethod,
        userAgent: USER_AGENT,
        correlationId,
      },
    };
  },
);

export function getMockAuditEvents(): AuditEventApiDto[] {
  return MOCK_AUDIT_EVENTS;
}
