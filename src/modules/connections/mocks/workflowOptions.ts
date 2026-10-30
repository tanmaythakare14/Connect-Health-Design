import type { WorkflowOptionDto } from '../@types';

/**
 * MOCK workflows an embedded connection can run, for the "Workflow"
 * picker. This module keeps its own minimal list rather than importing the
 * workflows module (see .claude/rules/modules.md). Delete once
 * listWorkflowOptions() calls GET /workflows.
 */
export const MOCK_WORKFLOW_OPTIONS: WorkflowOptionDto[] = [
  { id: 'wf-elation-fhir-demo', name: 'Elation FHIR Demo' },
  {
    id: 'wf-angeleye-ch-demo',
    name: 'AngelEye | CH demo (SQS & Websocket supported)',
  },
  { id: 'wf-001', name: 'QA_COH737_AIGuides_Retest' },
  { id: 'wf-002', name: 'AngelEye demos' },
  { id: 'wf-003', name: 'Test rvd' },
  { id: 'wf-004', name: 'bulk export test' },
  { id: 'wf-005', name: 'QA_COH937_TutorialCopy_Test' },
  { id: 'wf-006', name: 'Simple: Admit and discharge (WITH SQS)' },
  { id: 'wf-007', name: 'EPIC FHIR Mapping' },
  { id: 'wf-008', name: 'AE: Flow 1 - Admit (ADT A01)' },
  { id: 'wf-009', name: 'Simple: Admit' },
  { id: 'wf-010', name: 'QA_COH694_RunInspector_Partial' },
  { id: 'wf-011', name: 'QA_COH694_RunInspector_Test' },
  { id: 'wf-012', name: 'AngelEye - Hospital settings' },
  { id: 'wf-angeleye-feed-records', name: 'AngelEye - Feed records (ORU)' },
  { id: 'wf-angeleye-mock-apis', name: 'AngelEye - Mock APIs (TEST ONLY)' },
  { id: 'wf-angeleye-feeding-orders', name: 'AngelEye - Feeding orders (ORM)' },
  { id: 'wf-angeleye-patient-events', name: 'AngelEye - Patient events (ADT)' },
  { id: 'wf-cds-hook-testing', name: 'cds hook testing new' },
];
