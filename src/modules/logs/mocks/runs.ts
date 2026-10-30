import type {
  RunApiDto,
  RunDetailApiDto,
  RunStepApiDto,
  RunStatsApiDto,
  RunStepErrorApiDto,
  RunWorkflowOptionDto,
} from '../@types';
import { RUN_STATUS, RUN_STEP_STATUS } from '../constants';

interface MockStep {
  name: string;
  nodeType: string;
  /** Share of the run's time; 0 = an instant step (0–1ms) */
  weight: number;
  /** Exact [offsetMs, durationMs] — for parallel branches and catch paths */
  fixed?: [number, number];
  /** Set on the node that errors when a run of this workflow has errors */
  error?: RunStepErrorApiDto;
}

/**
 * One way a workflow runs. A workflow can have several triggers with
 * different node graphs, so variants share the workflow id and name.
 */
interface MockWorkflowVariant extends RunWorkflowOptionDto {
  trigger: string;
  steps: MockStep[];
  /** Typical run time, so durations look plausible per workflow */
  baseDurationMs: number;
  /** QA flows wired with fake credentials finish with errors every time */
  alwaysHasErrors?: boolean;
}

const step = (
  name: string,
  nodeType: string,
  weight = 0,
  extra: Pick<MockStep, 'fixed' | 'error'> = {},
): MockStep => ({ name, nodeType, weight, ...extra });

const QA_WORKFLOW = {
  id: 'wf-qa-coh829-vertex-docs',
  name: 'QA_COH829_Retest2_Vertex_Docs',
};

/** Agent with a catch branch: the agent errors and the catch path logs it. */
const qaAgentSteps = (
  prefix: string,
  timings: Array<[number, number]>,
  error: RunStepErrorApiDto,
): MockStep[] =>
  [
    step(prefix, 'inject'),
    step(`${prefix} model`, 'ai-model'),
    step(`${prefix} agent`, 'ai-agent'),
    step(`${prefix} | MODEL OUTPUT`, 'debug'),
    step(`${prefix} | AGENT OUTPUT`, 'debug'),
    step('catch all', 'catch'),
    step(`${prefix} agent`, 'ai-agent', 0, { error }),
    step('CATCH | full msg', 'debug'),
    step('catch all', 'catch'),
    step('CATCH | full msg', 'debug'),
  ].map((item, index) => ({ ...item, fixed: timings[index] }));

const MOCK_WORKFLOW_VARIANTS: MockWorkflowVariant[] = [
  {
    id: 'wf-soap-notes',
    name: 'SOAP Note Draft Generator',
    trigger: 'POST /soap-notes/draft',
    steps: [
      step('Build LLM Prompt (all fields optional)', 'function'),
      step('SOAP LLM (OpenRouter)', 'ai-model'),
      step('SOAP Note Generator', 'ai-agent', 1, {
        error: {
          errorClass: 'AIProviderError',
          code: 'RATE_LIMITED',
          httpStatus: 429,
          detail: 'OpenRouter rate limit reached for this API key',
        },
      }),
      step('Raw LLM Output', 'debug'),
      step('Format Success Response', 'function'),
      step('Send Response', 'http_response'),
    ],
    baseDurationMs: 2650,
  },
  {
    ...QA_WORKFLOW,
    trigger: 'G Bedrock fakeKey strON',
    steps: qaAgentSteps(
      'G Bedrock fakeKey strON',
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 5],
        [1, 6],
        [27, 0],
        [27, 0],
        [28, 0],
        [28, 0],
        [27, 1],
      ],
      {
        errorClass: 'AIProviderError',
        code: 'AUTH_ERROR',
        httpStatus: 403,
        detail: null,
      },
    ),
    baseDurationMs: 28,
    alwaysHasErrors: true,
  },
  {
    id: 'wf-charm-sync',
    name: 'CharmHealth - Encounter & Patient Sync (Sorelle)',
    trigger: 'GET /charmhealth/encounters',
    steps: [
      step('Receive Request', 'http_request'),
      step('CharmHealth Auth', 'connection', 2),
      step('List Encounters', 'connection', 4, {
        error: {
          errorClass: 'ConnectionError',
          code: 'UPSTREAM_TIMEOUT',
          httpStatus: 504,
          detail: 'CharmHealth did not respond within 30s',
        },
      }),
      step('Fetch Patients', 'connection', 3),
      step('Map Patients', 'mapping'),
      step('Map Encounters', 'mapping'),
      step('Upsert Records', 'database', 1),
      step('Update Sync Cursor', 'function'),
      step('Send Response', 'http_response'),
    ],
    baseDurationMs: 180,
  },
  {
    ...QA_WORKFLOW,
    trigger: 'B Vertex fakeSA strON',
    steps: qaAgentSteps(
      'B Vertex fakeSA strON',
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 2],
        [1, 3],
        [5, 0],
        [5, 0],
        [6, 0],
        [6, 0],
        [5, 1],
      ],
      {
        errorClass: 'AIProviderError',
        code: 'INVALID_SERVICE_ACCOUNT',
        httpStatus: 401,
        detail: null,
      },
    ),
    baseDurationMs: 6,
    alwaysHasErrors: true,
  },
  {
    id: 'wf-elation-demo',
    name: 'Elation FHIR Demo',
    trigger: 'Start demo',
    steps: [
      step('Start Demo', 'manual_trigger'),
      step('Elation backend token', 'connection', 2, {
        error: {
          errorClass: 'ConnectionError',
          code: 'TOKEN_REJECTED',
          httpStatus: 401,
          detail: 'invalid_client: client authentication failed',
        },
      }),
      step('Search Patients', 'fhir', 3),
      step('Read Patient', 'fhir', 1),
      step('Read Encounters', 'fhir', 2),
      step('Read Observations', 'fhir', 2),
      step('Map to Canonical', 'mapping'),
      step('Store Snapshot', 'database', 1),
      step('Log Summary', 'debug'),
    ],
    baseDurationMs: 551,
  },
  {
    id: 'wf-nexus-letter',
    name: 'Nexus Letter AI Drafting (Sorelle - live)',
    trigger: 'Nexus Letter Generation',
    steps: [
      step('Receive Request', 'event'),
      step('Fetch Patient', 'connection', 1),
      step('Fetch Encounters', 'connection', 1),
      step('Fetch Conditions', 'connection', 1),
      step('Build Context', 'function'),
      step('Draft Letter', 'ai-agent', 12, {
        error: {
          errorClass: 'AIProviderError',
          code: 'CONTEXT_TOO_LONG',
          httpStatus: 400,
          detail: 'Prompt exceeds the model’s 128k token context window',
        },
      }),
      step('Review Citations', 'ai-model', 4),
      step('Format Letter', 'function'),
      step('Generate PDF', 'function', 1),
      step('Upload to Chart', 'connection', 1),
    ],
    baseDurationMs: 31180,
  },
];

const MOCK_RUN_COUNT = 48;
const SECONDS_BETWEEN_RUNS = 37;

const hex = (seed: number, length: number): string =>
  ((seed * 2654435761) >>> 0).toString(16).padStart(8, '0').slice(0, length);

/** Deterministic variation (±40%) so durations aren't all identical. */
const vary = (base: number, seed: number): number =>
  Math.max(1, Math.round(base * (0.6 + ((seed * 37) % 80) / 100)));

const isFixedTiming = (variant: MockWorkflowVariant): boolean =>
  variant.steps.every((item) => item.fixed);

/** Fixed-timing runs last exactly as long as their latest-ending step. */
const fixedTotalMs = (variant: MockWorkflowVariant): number =>
  Math.max(
    ...variant.steps.map(({ fixed }) => (fixed ? fixed[0] + fixed[1] : 0)),
  );

const findVariant = (run: RunApiDto): MockWorkflowVariant =>
  MOCK_WORKFLOW_VARIANTS.find(
    ({ id, trigger }) => id === run.workflowId && trigger === run.trigger,
  ) ?? MOCK_WORKFLOW_VARIANTS[0];

const errorStepIndex = (variant: MockWorkflowVariant): number =>
  Math.max(
    0,
    variant.steps.findIndex((item) => item.error),
  );

/** Numeric seed recovered from a run id, so step timings stay stable. */
const seedOf = (runId: string): number =>
  [...runId].reduce((sum, char) => sum + char.charCodeAt(0), 0);

const buildRun = (
  index: number,
  variant: MockWorkflowVariant,
  startedAt: Date,
  status: RunApiDto['status'],
): RunApiDto => {
  const stepsTotal = variant.steps.length;

  return {
    id: `r-${hex(index + 1, 8)}-${hex(index + 77, 4)}`,
    correlationId: `corr_${hex(index + 9001, 8)}`,
    status,
    startedAt: startedAt.toISOString(),
    trigger: variant.trigger,
    workflowId: variant.id,
    workflowName: variant.name,
    stepsCompleted:
      status === RUN_STATUS.SUCCESS
        ? stepsTotal
        : status === RUN_STATUS.FAILED
          ? stepsTotal - 1
          : Math.ceil(stepsTotal / 3),
    stepsTotal,
    durationMs:
      status === RUN_STATUS.RUNNING
        ? null
        : isFixedTiming(variant)
          ? fixedTotalMs(variant)
          : vary(variant.baseDurationMs, index),
    failedAt:
      status === RUN_STATUS.FAILED
        ? variant.steps[errorStepIndex(variant)].name
        : null,
  };
};

/**
 * MOCK run history, newest first. Row 2 is still running, the QA workflow
 * always has errors, and every 7th other run has errors too — so the first
 * page shows all three statuses. Mutable: refreshes add live runs to the
 * front and later mark them finished.
 */
const MOCK_RUNS: RunApiDto[] = Array.from(
  { length: MOCK_RUN_COUNT },
  (_, index) => {
    const variant =
      MOCK_WORKFLOW_VARIANTS[index % MOCK_WORKFLOW_VARIANTS.length];
    const startedAt = new Date(
      Date.now() - (index + 1) * SECONDS_BETWEEN_RUNS * 1000,
    );
    const status =
      variant.alwaysHasErrors || index % 7 === 3
        ? RUN_STATUS.FAILED
        : index === 2
          ? RUN_STATUS.RUNNING
          : RUN_STATUS.SUCCESS;
    return buildRun(index, variant, startedAt, status);
  },
);

let liveRunSeed = MOCK_RUN_COUNT;

/** Older runs from the last 24h that aren't in the mock list. */
const MOCK_EARLIER_RUNS_24H: Record<string, number> = {
  'wf-soap-notes': 11,
  'wf-qa-coh829-vertex-docs': 8,
  'wf-charm-sync': 9911,
  'wf-elation-demo': 14,
  'wf-nexus-letter': 8,
};

const P95 = 0.95;

/** Nearest-rank 95th percentile; null when nothing has finished. */
const p95 = (durations: number[]): number | null => {
  if (durations.length === 0) return null;
  const sorted = [...durations].sort((a, b) => a - b);
  return sorted[Math.max(0, Math.ceil(P95 * sorted.length) - 1)];
};

export function getMockRuns(): RunApiDto[] {
  return MOCK_RUNS;
}

export function getMockRunStats(): RunStatsApiDto {
  const workflows = getMockRunWorkflows().map(({ id }) => {
    const runs = MOCK_RUNS.filter((run) => run.workflowId === id);
    return {
      workflowId: id,
      runsLast24h: (MOCK_EARLIER_RUNS_24H[id] ?? 0) + runs.length,
      p95DurationMs: p95(
        runs.flatMap((run) => (run.durationMs === null ? [] : run.durationMs)),
      ),
    };
  });

  return {
    runsLast24h: workflows.reduce((sum, item) => sum + item.runsLast24h, 0),
    needAttentionCount: MOCK_RUNS.filter(
      (run) => run.status === RUN_STATUS.FAILED,
    ).length,
    workflows,
  };
}

export function getMockRunWorkflows(): RunWorkflowOptionDto[] {
  const workflows = new Map(
    MOCK_WORKFLOW_VARIANTS.map(({ id, name }) => [id, { id, name }]),
  );
  return [...workflows.values()];
}

/**
 * Step-by-step timings for a run. Fixed steps use their exact timings;
 * otherwise instant steps take 0–1ms and weighted steps share the rest of
 * the run's duration, so offsets add up to the total.
 */
const buildMockRunSteps = (run: RunApiDto): RunStepApiDto[] => {
  const variant = findVariant(run);
  const seed = seedOf(run.id);
  const hasErrors = run.status === RUN_STATUS.FAILED;
  const failedIndex = errorStepIndex(variant);
  const instantMs = variant.steps.map((item, index) =>
    item.weight === 0 ? (seed + index) % 2 : 0,
  );
  const totalWeight = variant.steps.reduce((sum, item) => sum + item.weight, 0);
  const weightedBudget = Math.max(
    0,
    (run.durationMs ?? 0) - instantMs.reduce((sum, ms) => sum + ms, 0),
  );

  let offsetMs = 0;
  return variant.steps.map((item, index) => {
    const base = { id: `${run.id}-s${index + 1}`, ...item };
    const isErrorStep = hasErrors && index === failedIndex;

    if (run.status === RUN_STATUS.RUNNING && index >= run.stepsCompleted) {
      return {
        id: base.id,
        name: item.name,
        nodeType: item.nodeType,
        status: RUN_STEP_STATUS.PENDING,
        offsetMs: null,
        durationMs: null,
        error: null,
      };
    }

    const [stepOffset, durationMs] = item.fixed ?? [
      offsetMs,
      item.weight === 0
        ? instantMs[index]
        : Math.round((weightedBudget * item.weight) / (totalWeight || 1)),
    ];
    offsetMs = stepOffset + durationMs;

    return {
      id: base.id,
      name: item.name,
      nodeType: item.nodeType,
      status: isErrorStep ? RUN_STEP_STATUS.ERROR : RUN_STEP_STATUS.SUCCESS,
      offsetMs: stepOffset,
      durationMs,
      error: isErrorStep ? (item.error ?? null) : null,
    };
  });
};

export function getMockRunDetail(runId: string): RunDetailApiDto | null {
  const run = MOCK_RUNS.find(({ id }) => id === runId);
  return run ? { ...run, steps: buildMockRunSteps(run) } : null;
}

/** Simulates 1–2 workflows being triggered since the last refresh. */
export function spawnMockLiveRuns(): RunApiDto[] {
  const healthyVariants = MOCK_WORKFLOW_VARIANTS.filter(
    (variant) => !variant.alwaysHasErrors,
  );
  const count = 1 + (liveRunSeed % 2);
  const runs = Array.from({ length: count }, (_, offset) => {
    liveRunSeed += 1;
    const variant = healthyVariants[liveRunSeed % healthyVariants.length];
    return buildRun(
      liveRunSeed,
      variant,
      new Date(Date.now() - offset * 1000),
      RUN_STATUS.RUNNING,
    );
  });
  MOCK_RUNS.unshift(...runs);
  return runs;
}

/**
 * Simulates every running run finishing successfully (including ones hidden
 * by the current filters), then returns the requested ones.
 */
export function completeMockRuns(ids: string[]): RunApiDto[] {
  for (const run of MOCK_RUNS) {
    if (run.status === RUN_STATUS.RUNNING) {
      run.status = RUN_STATUS.SUCCESS;
      run.stepsCompleted = run.stepsTotal;
      run.durationMs = vary(findVariant(run).baseDurationMs, Date.now() % 1000);
    }
  }
  return MOCK_RUNS.filter((run) => ids.includes(run.id)).map((run) => ({
    ...run,
  }));
}
