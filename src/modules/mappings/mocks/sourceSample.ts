import type {
  SourceRepeat,
  SourceSample,
  SourceTreeNode,
  SourceValueType,
} from '../@types';

/**
 * MOCK parsed HL7 sample (ORM^O01), until the editor reads a real sample.
 */

const field = (
  ref: string,
  label: string,
  value: string,
  valueType: SourceValueType = 'text',
): SourceTreeNode => ({ ref, label, value, valueType });

const composite = (
  ref: string,
  label: string,
  value: string,
  children: SourceTreeNode[],
): SourceTreeNode => ({ ref, label, value, children });

const segment = (
  ref: string,
  label: string,
  children: SourceTreeNode[],
  repeat?: SourceRepeat,
): SourceTreeNode => ({ ref, label, children, repeat });

const ORM_O01_TREE: SourceTreeNode[] = [
  segment('MSH', 'Message Header', [
    field('MSH.3', 'Sending Application', 'EHR'),
    field('MSH.4', 'Sending Facility', 'FACILITY'),
    field('MSH.5', 'Receiving Application', 'MIRTH'),
    field('MSH.6', 'Receiving Facility', 'ANGELEYE'),
    field('MSH.7', 'Date/Time of Message', '20260610121329', 'datetime'),
    field('MSH.8', 'Security', 'USER01'),
    composite('MSH.9', 'Message Type', 'ORM^O01', [
      field('MSH.9.1', 'Message Type', 'ORM'),
      field('MSH.9.2', 'Trigger Event', 'O01'),
    ]),
    field('MSH.10', 'Message Control ID', '970'),
    field('MSH.11', 'Processing ID', 'T'),
    field('MSH.12', 'Version ID', '2.3.1'),
  ]),
  segment('PID', 'Patient Identification', [
    field('PID.1', 'Set ID - PID', '1', 'number'),
    composite('PID.3', 'Patient Identifier List', '000012345678^^^FAC01^MR', [
      field('PID.3.1', 'Patient ID', '000012345678'),
      field('PID.3.4', 'Assigning Authority', 'FAC01'),
      field('PID.3.5', 'Identifier Type Code', 'MR'),
    ]),
    composite('PID.5', 'Patient Name', 'TEST^BABYGIRL^^^^^D', [
      field('PID.5.1', 'Family Name', 'TEST'),
      field('PID.5.2', 'Given Name', 'BABYGIRL'),
      field('PID.5.7', 'Name Type Code', 'D'),
    ]),
    field('PID.7', 'Date/Time of Birth', '20260511', 'datetime'),
    field('PID.8', 'Gender', 'F'),
    composite(
      'PID.11',
      'Patient Address',
      '123 MAIN ST^^ANYTOWN^ST^00000^^HOME',
      [
        field('PID.11.1', 'Street Address', '123 MAIN ST'),
        field('PID.11.3', 'City', 'ANYTOWN'),
        field('PID.11.4', 'State', 'ST'),
        field('PID.11.5', 'Postal Code', '00000'),
        field('PID.11.7', 'Address Type', 'HOME'),
      ],
    ),
    composite('PID.13', 'Phone Number - Home', '(555)555-0100^^7', [
      field('PID.13.1', 'Telephone Number', '(555)555-0100'),
      field('PID.13.3', 'Telecommunication Equipment Type', '7'),
    ]),
    field('PID.18', 'Patient Account Number', '000000001'),
    field('PID.30', 'Patient Death Indicator', 'N', 'boolean'),
  ]),
  segment('PV1', 'Patient Visit', [
    field('PV1.1', 'Set ID - PV1', '1', 'number'),
    field('PV1.2', 'Patient Class', 'I'),
    composite(
      'PV1.3',
      'Assigned Patient Location',
      'NICU^08^A^GeneralHospital^D',
      [
        field('PV1.3.1', 'Point of Care', 'NICU'),
        field('PV1.3.2', 'Room', '08'),
        field('PV1.3.3', 'Bed', 'A'),
        field('PV1.3.4', 'Facility', 'GeneralHospital'),
        field('PV1.3.5', 'Location Status', 'D'),
      ],
    ),
    field('PV1.10', 'Hospital Service', 'NE'),
    composite(
      'PV1.17',
      'Admitting Doctor',
      '1000001^PROVIDER^ADMITTING^^^^^^FAC01^^^^PRN',
      [
        field('PV1.17.1', 'ID Number', '1000001'),
        field('PV1.17.2', 'Family Name', 'PROVIDER'),
        field('PV1.17.3', 'Given Name', 'ADMITTING'),
        field('PV1.17.9', 'Assigning Authority', 'FAC01'),
        field('PV1.17.13', 'Identifier Type Code', 'PRN'),
      ],
    ),
    field('PV1.19', 'Visit Number', '972661'),
    field('PV1.44', 'Admit Date/Time', '20260518115600', 'datetime'),
  ]),
  segment('PV2', 'Patient Visit - Additional Information', [
    field('PV2.40', 'Admission Level of Care Code', 'NICU'),
  ]),
  segment(
    'ORC',
    'Common Order',
    [
      field('ORC.1', 'Order Control', 'NW'),
      composite('ORC.2', 'Placer Order Number', '624655^EPC', [
        field('ORC.2.1', 'Entity Identifier', '624655'),
        field('ORC.2.2', 'Namespace ID', 'EPC'),
      ]),
      composite(
        'ORC.7',
        'Quantity/Timing',
        '30^EVERY 3 HOURS^^20260610121500^20260612075500^R^^Standing^^1',
        [
          field('ORC.7.1', 'Quantity', '30'),
          field('ORC.7.2', 'Interval', 'EVERY 3 HOURS'),
          field('ORC.7.4', 'Start Date/Time', '20260610121500', 'datetime'),
          field('ORC.7.5', 'End Date/Time', '20260612075500', 'datetime'),
          field('ORC.7.6', 'Priority', 'R'),
          field('ORC.7.8', 'Text', 'Standing'),
          field('ORC.7.12', 'Total Occurrences', '1'),
        ],
      ),
      composite('ORC.8', 'Parent Order', 'PARENT1^Parent', [
        field('ORC.8.1', 'Placer Assigned Identifier', 'PARENT1'),
        field('ORC.8.2', 'Filler Assigned Identifier', 'Parent'),
      ]),
      field('ORC.9', 'Date/Time of Transaction', '20260610121328', 'datetime'),
      composite('ORC.10', 'Entered By', '^NURSE^TEST^^', [
        field('ORC.10.2', 'Family Name', 'NURSE'),
        field('ORC.10.3', 'Given Name', 'TEST'),
      ]),
      composite(
        'ORC.12',
        'Ordering Provider',
        '1000002^PROVIDER^ORDERING^^^^^^FAC01^^^^PRN',
        [
          field('ORC.12.1', 'ID Number', '1000002'),
          field('ORC.12.2', 'Family Name', 'PROVIDER'),
          field('ORC.12.3', 'Given Name', 'ORDERING'),
          field('ORC.12.9', 'Assigning Authority', 'FAC01'),
          field('ORC.12.13', 'Identifier Type Code', 'PRN'),
        ],
      ),
      composite(
        'ORC.13',
        'Enterer’s Location',
        'NICU^^^100000^^^^^MAIN HOSPITAL',
        [
          field('ORC.13.1', 'Point of Care', 'NICU'),
          field('ORC.13.4', 'Facility', '100000'),
          field('ORC.13.9', 'Location Description', 'MAIN HOSPITAL'),
        ],
      ),
      field('ORC.14', 'Call Back Phone Number', '(555)555-0101'),
      composite('ORC.18', 'Entering Device', 'GENERICID^GENERICID', [
        field('ORC.18.1', 'Identifier', 'GENERICID'),
        field('ORC.18.2', 'Text', 'GENERICID'),
      ]),
      field('ORC.30', 'Enterer Authorization Mode', 'I'),
    ],
    { kind: 'may-repeat' },
  ),
  segment('ODS', 'Dietary Orders, Supplements, and Preferences', [
    field('ODS.1', 'Type', 'D'),
    field('ODS.3', 'Diet, Supplement, or Preference Code', 'NEONATAL'),
  ]),
  segment(
    'NTE',
    'Notes and Comments',
    [
      field('NTE.1', 'Set ID - NTE', '1', 'number'),
      field('NTE.3', 'Comment', 'Diet->Neonatal Diet'),
      field('NTE.4', 'Comment Type', 'Diet Comments'),
    ],
    { kind: 'count', count: 18 },
  ),
  segment(
    'DG1',
    'Diagnosis',
    [
      field('DG1.1', 'Set ID - DG1', '1', 'number'),
      field('DG1.3', 'Diagnosis Code', '^Test diagnosis'),
      field('DG1.4', 'Diagnosis Description', 'Test diagnosis'),
      field('DG1.6', 'Diagnosis Type', 'A'),
    ],
    { kind: 'may-repeat' },
  ),
];

export const MOCK_SOURCE_SAMPLE: SourceSample = {
  fileName: 'orm_o01_feeding_order.hl7',
  tree: ORM_O01_TREE,
};
