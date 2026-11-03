import type { MappingTemplateApiDto } from '../@types';
import { MOCK_MAPPING_PROJECTS } from './mappingProjects';

/**
 * MOCK templates for each mapping project, served (and changed) by
 * service/api.ts until the real endpoints exist. Delete this file then.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

type TemplateSeed = Omit<
  MappingTemplateApiDto,
  'id' | 'projectId' | 'updatedAt'
>;

/** Projects draw from this pool so each one gets a believable set. */
const TEMPLATE_POOL: TemplateSeed[] = [
  {
    name: 'Feeding order (ORM^O01)',
    description:
      'Used for every ORM^O01 (new order, order set, cancel, discontinue). It only reads the fields the order needs.',
    inputType: 'hl7',
    outputType: 'fhir-json',
    messageType: 'ORM_O01',
    messageVersion: '2.5.1',
    status: 'ready',
    fieldCount: 14,
  },
  {
    name: 'Admit (ADT^A01)',
    description:
      'Patient, visit and unit from an admit, mapped onto the MilkTracker patient body.',
    inputType: 'hl7',
    outputType: 'fhir-json',
    messageType: 'ADT_A01',
    messageVersion: '2.5.1',
    status: 'ready',
    fieldCount: 22,
  },
  {
    name: 'Discharge (ADT^A03)',
    description:
      'Discharge date and disposition, mapped onto the same patient body as the admit.',
    inputType: 'hl7',
    outputType: 'fhir-json',
    messageType: 'ADT_A03',
    messageVersion: null,
    status: 'ready',
    fieldCount: 9,
  },
  {
    name: 'Transfer (ADT^A02)',
    description: 'The new unit and bed after a transfer.',
    inputType: 'hl7',
    outputType: 'fhir-json',
    messageType: 'ADT_A02',
    messageVersion: null,
    status: 'draft',
    fieldCount: 7,
  },
  {
    name: 'Feed record to ORU^R01',
    description:
      'One OBX per measurement, with the volume, the feed type and who recorded it.',
    inputType: 'custom-json',
    outputType: 'hl7v2',
    messageType: null,
    messageVersion: null,
    status: 'ready',
    fieldCount: 18,
  },
  {
    name: 'Vital signs observation',
    description:
      'FHIR Observation resources for heart rate, SpO2 and temperature, flattened into one reading.',
    inputType: 'custom-json',
    outputType: 'fhir-json',
    messageType: null,
    messageVersion: null,
    status: 'ready',
    fieldCount: 11,
  },
  {
    name: 'Patient summary (CCD)',
    description:
      'Demographics, problems and allergies from a Continuity of Care Document.',
    inputType: 'ccda',
    outputType: 'fhir-json',
    messageType: 'CCD',
    messageVersion: 'R2.1',
    status: 'ready',
    fieldCount: 16,
  },
  {
    name: 'Lab result (ORU^R01)',
    description:
      'Each OBX becomes one result with its value, units and reference range.',
    inputType: 'hl7',
    outputType: 'fhir-json',
    messageType: 'ORU_R01',
    messageVersion: '2.3',
    status: 'ready',
    fieldCount: 25,
  },
  {
    name: 'Appointment (SIU^S12)',
    description: 'Start time, duration, provider and location of a booking.',
    inputType: 'hl7',
    outputType: 'fhir-json',
    messageType: 'SIU_S12',
    messageVersion: null,
    status: 'draft',
    fieldCount: 12,
  },
  {
    name: 'Eligibility response (271)',
    description:
      'Coverage, plan dates and benefits from the payer’s 271 reply.',
    inputType: 'x12',
    outputType: 'fhir-json',
    messageType: '271',
    messageVersion: '005010',
    status: 'ready',
    fieldCount: 20,
  },
];

/** Templates by project id; the mock API reads and writes this in place. */
export const MOCK_TEMPLATES_BY_PROJECT = new Map<
  string,
  MappingTemplateApiDto[]
>(
  MOCK_MAPPING_PROJECTS.map((project, projectIndex) => {
    const projectUpdatedAt = new Date(project.updatedAt).getTime();
    const templates = Array.from(
      { length: project.templateCount },
      (_, index) => ({
        ...TEMPLATE_POOL[(projectIndex + index) % TEMPLATE_POOL.length],
        id: `${project.id}-tpl-${index + 1}`,
        projectId: project.id,
        // The newest template matches the project's own "updated" time.
        updatedAt: new Date(projectUpdatedAt - index * DAY_MS).toISOString(),
      }),
    );
    return [project.id, templates];
  }),
);
