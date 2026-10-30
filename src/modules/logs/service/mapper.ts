import type {
  RawEvent,
  RawEventApiDto,
  Run,
  RunApiDto,
  RunDetail,
  RunDetailApiDto,
  RunStats,
  RunStatsApiDto,
  RunWorkflowOption,
  RunWorkflowOptionDto,
} from '../@types';

export function apiDtoToRun(dto: RunApiDto): Run {
  return {
    id: dto.id,
    correlationId: dto.correlationId,
    status: dto.status,
    startedAt: dto.startedAt,
    trigger: dto.trigger,
    workflowId: dto.workflowId,
    workflowName: dto.workflowName,
    stepsCompleted: dto.stepsCompleted,
    stepsTotal: dto.stepsTotal,
    durationMs: dto.durationMs,
    failedAt: dto.failedAt,
  };
}

export function apiDtoToRunDetail(dto: RunDetailApiDto): RunDetail {
  return {
    id: dto.id,
    workflowId: dto.workflowId,
    workflowName: dto.workflowName,
    trigger: dto.trigger,
    startedAt: dto.startedAt,
    durationMs: dto.durationMs,
    steps: dto.steps.map((step) => ({
      id: step.id,
      name: step.name,
      nodeType: step.nodeType,
      status: step.status,
      offsetMs: step.offsetMs,
      durationMs: step.durationMs,
      error: step.error
        ? {
            errorClass: step.error.errorClass,
            code: step.error.code,
            httpStatus: step.error.httpStatus,
            detail: step.error.detail,
          }
        : null,
    })),
  };
}

export function apiDtoToRunStats(dto: RunStatsApiDto): RunStats {
  return {
    runsLast24h: dto.runsLast24h,
    needAttentionCount: dto.needAttentionCount,
    byWorkflow: new Map(
      dto.workflows.map((item) => [
        item.workflowId,
        {
          workflowId: item.workflowId,
          runsLast24h: item.runsLast24h,
          p95DurationMs: item.p95DurationMs,
        },
      ]),
    ),
  };
}

export function apiDtoToRunWorkflowOption(
  dto: RunWorkflowOptionDto,
): RunWorkflowOption {
  return { id: dto.id, name: dto.name };
}

export function apiDtoToRawEvent(dto: RawEventApiDto): RawEvent {
  return {
    id: dto.id,
    occurredAt: dto.occurredAt,
    level: dto.level,
    status: dto.status,
    source: dto.source,
    message: dto.message,
    correlationId: dto.correlationId,
  };
}
