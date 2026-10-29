import type { WorkflowTemplateApiDto } from '../@types';

/**
 * MOCK workflow library for the Import dialog's "Library" tab, served by
 * service/api.ts until the real endpoint exists. Delete once
 * listWorkflowTemplates() calls the API.
 */
export const MOCK_WORKFLOW_TEMPLATES: WorkflowTemplateApiDto[] = [
  {
    id: 'tpl-rpm-epic',
    name: 'Real-Time Remote Patient Monitoring in Epic',
    description:
      "Stream vitals from remote monitoring devices straight into the patient's Epic chart — the visit is created and every reading filed automatically.",
    category: 'hl7',
    nodeCount: 14,
  },
  {
    id: 'tpl-spirometry-epic',
    name: 'Automated Spirometry Results in Epic',
    description:
      'Send spirometry readings from the device into Epic as filed results — no manual charting, mapped to standard LOINC codes.',
    category: 'hl7',
    nodeCount: 9,
  },
  {
    id: 'tpl-healthkit-epic',
    name: 'Apple HealthKit Vitals, Straight Into Epic',
    description:
      "Turn an Apple Watch or wearable reading into a coded FHIR Observation in the patient's Epic chart — authenticated, encounter-linked, automatic.",
    category: 'fhir',
    nodeCount: 11,
  },
  {
    id: 'tpl-vitals-fhir',
    name: 'Patient Vitals Into Epic as FHIR',
    description:
      'Write blood-pressure vitals into Epic as a standards-based FHIR Observation — the simplest data-in → Observation-out pattern.',
    category: 'fhir',
    nodeCount: 7,
  },
  {
    id: 'tpl-eligibility-benefits',
    name: 'Real-Time Insurance Eligibility & Benefits Checks',
    description:
      "Check a patient's insurance eligibility and benefits in real time the moment an appointment is booked — and hand back a clear coverage report.",
    category: 'insurance',
    nodeCount: 12,
  },
  {
    id: 'tpl-ai-intake-eligibility',
    name: 'AI Patient Intake with Built-In Eligibility Check',
    description:
      'An AI agent collects patient intake details in plain language, then runs a real-time insurance eligibility check through Stedi before check-in.',
    category: 'insurance',
    nodeCount: 18,
  },
  {
    id: 'tpl-ai-discharge-calls',
    name: 'AI Voice Agent for Patient Discharge Calls',
    description:
      'An AI voice agent that calls discharged patients, runs a check-in questionnaire in natural conversation, and escalates red flags to a nurse.',
    category: 'agentic',
    nodeCount: 16,
  },
  {
    id: 'tpl-ai-clinical-assistant',
    name: 'AI Clinical Assistant, Powered by Live FHIR',
    description:
      'An AI agent that answers plain-English questions from live FHIR data — with allow-list and PHI-redaction guardrails built in.',
    category: 'agentic',
    nodeCount: 13,
  },
];
