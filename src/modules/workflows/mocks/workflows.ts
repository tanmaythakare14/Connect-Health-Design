import type { WorkflowApiDto, WorkflowConnectionSummaryDto } from '../@types';

/**
 * MOCK data for the Workflows grid, served by service/api.ts until the real
 * endpoint exists. Delete this file once listWorkflows() calls the API.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Timestamps are relative to "now" so "Today" / "2d ago" labels stay meaningful. */
const daysAgo = (days: number): string =>
  new Date(Date.now() - days * DAY_MS).toISOString();

const CONNECTIONS = {
  epicTestBackend: { id: 'epic-test-backend', name: 'Epic Test Backend' },
  opendental: { id: 'opendental', name: 'Opendental' },
  cdsHookTest2: { id: 'cds-hook-test2', name: 'CDS Hook test2' },
  advancedmdBackend: { id: 'advancedmd-backend', name: 'Advancedmd backend' },
  ecwSandbox: { id: 'ecw-sandbox', name: 'ECW Sandbox' },
  cernerSandbox: { id: 'cerner-sandbox', name: 'Cerner Sandbox' },
  athenaProd: { id: 'athena-prod', name: 'Athena Health Prod' },
  stediClaims: { id: 'stedi-claims', name: 'Stedi Claims' },
  veradigmUnity: { id: 'veradigm-unity', name: 'Veradigm Unity' },
} satisfies Record<string, WorkflowConnectionSummaryDto>;

export const MOCK_WORKFLOWS: WorkflowApiDto[] = [
  {
    id: 'wf-001',
    name: 'QA_COH737_AIGuides_Retest',
    description:
      'QA test workflow for COH-737 AI node guides retest. Synthetic only. Safe to delete.',
    connections: [],
    nodeCount: 28,
    updatedAt: daysAgo(0),
    status: 'active',
  },
  {
    id: 'wf-002',
    name: 'AngelEye demos',
    description:
      'The AngelEye demos: admit and feeding order through a queue (SQS), the feed record also from the relay agent over a WebSocket, and the FHIR daily update.',
    connections: [CONNECTIONS.epicTestBackend],
    nodeCount: 155,
    updatedAt: daysAgo(0),
    status: 'active',
  },
  {
    id: 'wf-003',
    name: 'Test rvd',
    description: null,
    connections: [CONNECTIONS.opendental, CONNECTIONS.cdsHookTest2],
    nodeCount: 5,
    updatedAt: daysAgo(0),
    status: 'active',
  },
  {
    id: 'wf-004',
    name: 'bulk export test',
    description: null,
    connections: [
      CONNECTIONS.epicTestBackend,
      CONNECTIONS.advancedmdBackend,
      CONNECTIONS.ecwSandbox,
    ],
    nodeCount: 18,
    updatedAt: daysAgo(0),
    status: 'active',
  },
  {
    id: 'wf-005',
    name: 'QA_COH937_TutorialCopy_Test',
    description:
      'QA test workflow for COH-937 tutorial copy check. Synthetic only. Safe to delete.',
    connections: [],
    nodeCount: 0,
    updatedAt: daysAgo(1),
    status: 'active',
  },
  {
    id: 'wf-006',
    name: 'Simple: Admit and discharge (WITH SQS)',
    description:
      'HL7 admit or discharge, checked, queued (one SQS queue per product), answered with AA / AR / AE; part 2 delivers from the queue.',
    connections: [],
    nodeCount: 67,
    updatedAt: daysAgo(1),
    status: 'active',
  },
  {
    id: 'wf-007',
    name: 'EPIC FHIR Mapping',
    description: 'FHIR Mapping for the CARES Fields',
    connections: [CONNECTIONS.epicTestBackend],
    nodeCount: 25,
    updatedAt: daysAgo(2),
    status: 'active',
  },
  {
    id: 'wf-008',
    name: 'AE: Flow 1 - Admit (ADT A01)',
    description:
      "AngelEye admit: one HL7 ADT^A01 from the hospital EHR → CameraSystem JSON + MilkTracker JSON, posted in parallel with that hospital's own API keys → ONE HL7 ACK.",
    connections: [],
    nodeCount: 47,
    updatedAt: daysAgo(2),
    status: 'active',
  },
  {
    id: 'wf-009',
    name: 'Simple: Admit',
    description:
      'HL7 admit: what is it, is it a NICU admit, then one lane per product (CameraSystem, MilkTracker), answered with AA / AR / AE. Runs on its own.',
    connections: [],
    nodeCount: 47,
    updatedAt: daysAgo(2),
    status: 'active',
  },
  {
    id: 'wf-010',
    name: 'QA_COH694_RunInspector_Partial',
    description:
      'QA test workflow for COH-692/694 partial status. Safe to delete.',
    connections: [],
    nodeCount: 4,
    updatedAt: daysAgo(3),
    status: 'inactive',
  },
  {
    id: 'wf-011',
    name: 'QA_COH694_RunInspector_Test',
    description:
      'QA test workflow for COH-692/693/694/697 Run Inspector. Safe to delete.',
    connections: [],
    nodeCount: 7,
    updatedAt: daysAgo(3),
    status: 'inactive',
  },
  {
    id: 'wf-012',
    name: 'AngelEye - Hospital settings',
    description:
      'Per-hospital AngelEye keys, time zone, NICU units, milk-name translations and flowsheet (ORU) settings, read by the other AngelEye flows.',
    connections: [],
    nodeCount: 11,
    updatedAt: daysAgo(3),
    status: 'active',
  },
  {
    id: 'wf-013',
    name: 'AE: Flow 2 - Feeding order (ORM)',
    description:
      'Feeding orders from the EHR routed to MilkTracker, acknowledged per order.',
    connections: [CONNECTIONS.epicTestBackend],
    nodeCount: 38,
    updatedAt: daysAgo(4),
    status: 'active',
  },
  {
    id: 'wf-014',
    name: 'AE: Flow 3 - Discharge (ADT A03)',
    description:
      'Discharge events close the CameraSystem session and archive MilkTracker records.',
    connections: [CONNECTIONS.epicTestBackend],
    nodeCount: 29,
    updatedAt: daysAgo(4),
    status: 'active',
  },
  {
    id: 'wf-015',
    name: 'Lab results to FHIR Observation',
    description:
      'Converts inbound HL7 ORU^R01 lab results into FHIR Observation resources.',
    connections: [CONNECTIONS.cernerSandbox],
    nodeCount: 52,
    updatedAt: daysAgo(5),
    status: 'active',
  },
  {
    id: 'wf-016',
    name: 'Appointment sync',
    description:
      'Nightly sync of scheduled appointments from Athena into the downstream scheduling system.',
    connections: [CONNECTIONS.athenaProd],
    nodeCount: 33,
    updatedAt: daysAgo(6),
    status: 'active',
  },
  {
    id: 'wf-017',
    name: 'Eligibility check on admit',
    description:
      'Runs a realtime eligibility check whenever a new admit arrives.',
    connections: [CONNECTIONS.epicTestBackend, CONNECTIONS.stediClaims],
    nodeCount: 21,
    updatedAt: daysAgo(7),
    status: 'active',
  },
  {
    id: 'wf-018',
    name: 'Dental recall reminders',
    description:
      'Pulls overdue recall patients from Open Dental and queues reminder messages.',
    connections: [CONNECTIONS.opendental],
    nodeCount: 16,
    updatedAt: daysAgo(7),
    status: 'active',
  },
  {
    id: 'wf-019',
    name: 'CDS Hooks patient-view demo',
    description: null,
    connections: [CONNECTIONS.cdsHookTest2],
    nodeCount: 9,
    updatedAt: daysAgo(8),
    status: 'inactive',
  },
  {
    id: 'wf-020',
    name: 'Medication history pull',
    description:
      'Fetches medication history from Veradigm Unity for newly admitted patients.',
    connections: [CONNECTIONS.veradigmUnity],
    nodeCount: 24,
    updatedAt: daysAgo(9),
    status: 'active',
  },
  {
    id: 'wf-021',
    name: 'QA_COH712_ErrorBranch_Test',
    description:
      'QA test workflow for COH-712 error branch handling. Safe to delete.',
    connections: [],
    nodeCount: 6,
    updatedAt: daysAgo(10),
    status: 'inactive',
  },
  {
    id: 'wf-022',
    name: 'Bulk export to data lake',
    description: 'Weekly FHIR bulk export pushed to the analytics data lake.',
    connections: [CONNECTIONS.epicTestBackend],
    nodeCount: 19,
    updatedAt: daysAgo(12),
    status: 'active',
  },
  {
    id: 'wf-023',
    name: 'Referral intake',
    description:
      'Inbound referral documents parsed and filed against the patient chart.',
    connections: [CONNECTIONS.ecwSandbox],
    nodeCount: 41,
    updatedAt: daysAgo(14),
    status: 'active',
  },
  {
    id: 'wf-024',
    name: 'Prior auth submission',
    description:
      'Submits prior authorization requests and tracks their status.',
    connections: [CONNECTIONS.stediClaims],
    nodeCount: 27,
    updatedAt: daysAgo(15),
    status: 'active',
  },
  {
    id: 'wf-025',
    name: 'ADT fan-out',
    description:
      'Fans out every ADT event to the registered downstream subscribers.',
    connections: [CONNECTIONS.epicTestBackend, CONNECTIONS.cernerSandbox],
    nodeCount: 13,
    updatedAt: daysAgo(18),
    status: 'active',
  },
  {
    id: 'wf-026',
    name: 'Patient demographics update',
    description:
      'Keeps patient demographics in sync when the EHR sends an ADT^A08.',
    connections: [CONNECTIONS.advancedmdBackend],
    nodeCount: 22,
    updatedAt: daysAgo(20),
    status: 'active',
  },
  {
    id: 'wf-027',
    name: 'Claims status poller',
    description: 'Polls claim status every hour and flags denials.',
    connections: [CONNECTIONS.stediClaims],
    nodeCount: 17,
    updatedAt: daysAgo(21),
    status: 'inactive',
  },
  {
    id: 'wf-028',
    name: 'Sandbox smoke test',
    description: null,
    connections: [],
    nodeCount: 3,
    updatedAt: daysAgo(25),
    status: 'inactive',
  },
  {
    id: 'wf-029',
    name: 'Immunization registry feed',
    description: 'Sends VXU immunization messages to the state registry.',
    connections: [CONNECTIONS.ecwSandbox],
    nodeCount: 31,
    updatedAt: daysAgo(30),
    status: 'active',
  },
  {
    id: 'wf-030',
    name: 'Legacy HL7 bridge',
    description:
      'Bridges the legacy HL7 v2 interface engine to FHIR endpoints during migration.',
    connections: [CONNECTIONS.cernerSandbox],
    nodeCount: 58,
    updatedAt: daysAgo(45),
    status: 'active',
  },
];
