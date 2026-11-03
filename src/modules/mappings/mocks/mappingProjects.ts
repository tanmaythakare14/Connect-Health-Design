import type { MappingProjectApiDto } from '../@types';

/**
 * MOCK data for the Mapping Projects grid, served by service/api.ts until the
 * real endpoint exists. Delete this file once listMappingProjects() calls the API.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Timestamps are relative to "now" so "Today" / "4d ago" labels stay meaningful. */
const daysAgo = (days: number): string =>
  new Date(Date.now() - days * DAY_MS).toISOString();

/** [name, description, format, templateCount, days since update] */
const MOCK_ROWS: Array<
  [string, string | null, MappingProjectApiDto['format'], number, number]
> = [
  [
    'ADT: to MilkTracker',
    'The same HL7 ADT event turned into the JSON body MilkTracker expects (AngelEye spec 4.7).',
    'hl7',
    1,
    0,
  ],
  [
    'ADT: to CameraSystem',
    'Any HL7 ADT event (admit, transfer, discharge, update and the cancels) turned into the JSON body CameraSystem expects (AngelEye spec 4.4).',
    'hl7',
    1,
    0,
  ],
  [
    'Demo: FHIR read to daily update',
    'Three FHIR answers from the hospital EHR (the patient, the vital signs, the vaccinations) turned into one clean JSON for the daily family update.',
    'json',
    1,
    4,
  ],
  [
    'Demo: Feed record to ORU',
    'MilkTracker’s feed record (JSON from the relay agent) turned into the HL7 ORU^R01 the hospital’s chart receives (AngelEye spec 6.5).',
    'json',
    1,
    4,
  ],
  [
    'Demo: Feeding order, header and notes',
    'One HL7 feeding order (ORM^O01) read into its header fields and EVERY note (NTE) as { text, label, value, kind }. The notes keep their order.',
    'hl7',
    1,
    4,
  ],
  [
    'Demo: Admit to MilkTracker',
    'The same HL7 admit or discharge turned into the JSON body MilkTracker expects (AngelEye spec 4.7).',
    'hl7',
    1,
    4,
  ],
  [
    'Demo: Admit to CameraSystem',
    'An HL7 admit (ADT^A01), or discharge (ADT^A03), turned into the JSON body CameraSystem expects (AngelEye spec 4.4 and 4.5).',
    'hl7',
    1,
    4,
  ],
  [
    'Demo: Admit, what is it?',
    'Reads two things from an HL7 admit and joins them into one value, for example “A01 NICU”: the event (A01, A08 …) and the unit.',
    'hl7',
    1,
    4,
  ],
  [
    'QA_COH937_TutorialCopy_Test',
    'QA test project for COH-937. Synthetic only. Safe to delete.',
    'hl7',
    1,
    6,
  ],
  [
    'Demo: Feeding order to MilkTracker',
    'One HL7 feeding order (ORM^O01) holds up to several feeding types. MilkTracker wants one order per type, so this project splits them.',
    'hl7',
    1,
    7,
  ],
  [
    'AngelEye ADT to MilkTracker',
    'HL7 ADT to the MilkTracker /api/v1/hl7/patient JSON body (AngelEye spec 4.7). Times without an offset get the facility’s time zone.',
    'hl7',
    3,
    9,
  ],
  [
    'AngelEye feeding record to ORU^R01',
    'A MilkTracker feeding record (prepared by the workflow) to the HL7 ORU^R01 flowsheet message (AngelEye spec 6.5). One OBX per measurement.',
    'json',
    2,
    9,
  ],
  [
    'Epic patient to FHIR bundle',
    'Epic patient demographics and allergies combined into a single FHIR R4 transaction bundle.',
    'json',
    4,
    12,
  ],
  [
    'Lab results ORU to JSON',
    'HL7 ORU^R01 lab results flattened into one JSON object per observation, with units and reference ranges.',
    'hl7',
    2,
    15,
  ],
  [
    'Scheduling SIU to calendar event',
    'HL7 SIU^S12 appointment messages turned into calendar events for the clinic scheduler.',
    'hl7',
    1,
    21,
  ],
  [
    'Claims eligibility request',
    'Patient and coverage JSON turned into the eligibility request body the clearinghouse expects.',
    'json',
    5,
    28,
  ],
  ['Untitled project', null, 'json', 0, 35],
];

export const MOCK_MAPPING_PROJECTS: MappingProjectApiDto[] = MOCK_ROWS.map(
  ([name, description, format, templateCount, age], index) => ({
    id: `map-${String(index + 1).padStart(3, '0')}`,
    name,
    description,
    format,
    templateCount,
    updatedAt: daysAgo(age),
  }),
);
