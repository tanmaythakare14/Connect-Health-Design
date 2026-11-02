import type { ConnectionUsageApiDto, UsageConnectionDto } from '../@types';
import { LICENSE_SOURCE_TYPE } from '../constants';

const AWS = LICENSE_SOURCE_TYPE.AWS_MARKETPLACE;

let connectionSeq = 0;
const conn = (name: string, ehr: string, type: string): UsageConnectionDto => {
  connectionSeq += 1;
  return { id: `uc-${connectionSeq}`, name, ehr, type };
};

/** [ehr, organization (null = FHIR URL not set), connections] */
const MOCK_SLOTS: Array<[string, string | null, UsageConnectionDto[]]> = [
  [
    'Epic',
    'sunrise-fhir-r4.adpsandbox.ahcentral.com',
    [conn('Touchworks BE', 'Epic', 'backend')],
  ],
  ['Stedi', null, [conn('Stedi Sandbox', 'Stedi', 'stedi')]],
  [
    'eClinicalWorks',
    'FFBJCD',
    [
      conn('ECW Sandbox', 'eClinicalWorks', 'backend'),
      conn('ECW Test Standalone', 'eClinicalWorks', 'standalone'),
    ],
  ],
  [
    'Epic',
    'fhir.fhirpoint.open.allscripts.com',
    [
      conn('Varadigm Test', 'Epic', 'standalone'),
      conn('Varadigm B2B Test', 'Epic', 'backend'),
    ],
  ],
  [
    'Touchworks EHR',
    'sunrise-fhir-r4.adpsandbox.ahcentral.com/r4/fhir-prod',
    [conn('Touchworks Sandbox B2B', 'Touchworks EHR', 'backend')],
  ],
  [
    'MEDITECH',
    'greenfield-prod-apis.meditech.com',
    [conn('test meditech standalone', 'MEDITECH', 'standalone')],
  ],
  [
    'Allscripts (Veradigm)',
    null,
    [conn('Veradigm Unity Test', 'Allscripts (Veradigm)', 'unity')],
  ],
  [
    'Athena Health',
    'launch.smarthealthit.org/v/r4/fhir',
    [conn('Athena Embed Test QA', 'Athena Health', 'embed')],
  ],
  [
    'Allscripts (Veradigm)',
    'launch.smarthealthit.org',
    [
      conn('veradigm embed qa', 'Allscripts (Veradigm)', 'embed'),
      conn('COH272 Happy Path', 'Allscripts (Veradigm)', 'embed'),
      conn('COH272 Happy Path 2', 'Allscripts (Veradigm)', 'embed'),
      conn('COH272 Happy Path 3', 'Allscripts (Veradigm)', 'embed'),
    ],
  ],
  [
    'Epic',
    'providerapi.advancedmd.com',
    [
      conn('Advanced MD support', 'Epic', 'backend'),
      conn('CDS Hook test2', 'Epic', 'backend'),
    ],
  ],
  [
    'Cerner (Oracle Health)',
    'fhir-ehr-code.cerner.com',
    [
      conn(
        'Riverside Health backend sync',
        'Cerner (Oracle Health)',
        'backend',
      ),
    ],
  ],
  [
    'Cerner (Oracle Health)',
    'fhir-myrecord.cerner.com',
    [conn('Mercy patient import', 'Cerner (Oracle Health)', 'backend')],
  ],
  [
    'Epic',
    'fhir.epic.com/interconnect-fhir-oauth',
    [
      conn('Northwind Epic launch', 'Epic', 'standalone'),
      conn('Northwind Epic embed', 'Epic', 'embed'),
    ],
  ],
  [
    'Open Dental',
    'api.opendental.com',
    [conn('Bright Smile Dental sync', 'Open Dental', 'opendental')],
  ],
  [
    'Elation',
    'sandbox.elationemr.com',
    [conn('Elation FHIR Demo', 'Elation', 'backend')],
  ],
  [
    'Healthie',
    'api.gethealthie.com',
    [conn('Healthie coaching sync', 'Healthie', 'healthie')],
  ],
  [
    'CharmHealth',
    'ehr2.charmtracker.com',
    [conn('CharmHealth encounter sync', 'CharmHealth', 'backend')],
  ],
  [
    'Athena Health',
    'api.platform.athenahealth.com',
    [conn('Athena patient intake', 'Athena Health', 'backend')],
  ],
  [
    'NextGen',
    'fhir.nextgen.com/nge/prod',
    [conn('NextGen appointments', 'NextGen', 'standalone')],
  ],
  [
    'eClinicalWorks',
    'fhir4.healow.com',
    [conn('Healow scheduling', 'eClinicalWorks', 'standalone')],
  ],
];

/**
 * MOCK connection usage for the Subscription screen: 20 slots in use.
 * Delete once getConnectionUsage() calls the API.
 */
export const MOCK_CONNECTION_USAGE: ConnectionUsageApiDto = {
  usedSlots: MOCK_SLOTS.length,
  planSlots: 35,
  activeConnections: 67,
  totalConnections: 97,
  slots: MOCK_SLOTS.map(([ehr, organization, connections], index) => ({
    id: `slot-${index + 1}`,
    ehr,
    organization,
    source: AWS,
    connections,
  })),
};
