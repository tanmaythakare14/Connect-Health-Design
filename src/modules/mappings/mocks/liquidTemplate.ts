import type { LiquidRepeatSection } from '../@types';

/**
 * MOCK compiled Liquid for the feeding order template, until it's compiled
 * from the template's mappings.
 */

export const MOCK_LIQUID_BASE = [
  '{% assign firstSegments = hl7v2Data | get_first_segments: "MSH|PID|ORC|PV1" %}',
  '{',
  '  "type": "{{ firstSegments.MSH[9][1].Value }}",',
  '  "event": "{{ firstSegments.MSH[9][2].Value }}",',
  '  "mrn": "{{ firstSegments.PID[3][1].Value | chc_trim }}",',
  `  "orderId": "{% assign chcSrc0x0 = '' %}{% assign chcSrc0x0 = firstSegments.ORC[2][1].Value | chc_trim %}{% assign chcSrc0x1 = '' %}{% assign chcSrc0x1 = firstSegments.ORC[8][1].Value | chc_trim %}{{ chcSrc0x0 | chc_combine: 'first', ' ', chcSrc0x1 }}",`,
  '  "control": "{{ firstSegments.ORC[1].Value | chc_trim | chc_uppercase }}",',
  '  "quantity": "{{ firstSegments.ORC[7][1].Value | chc_trim }}",',
  '  "startDate": "{{ firstSegments.ORC[7][4].Value | as_datetime }}",',
  '  "endDate": "{{ firstSegments.ORC[7][5].Value | as_datetime }}",',
  '  "priority": "{{ firstSegments.ORC[7][6].Value | chc_trim }}",',
  '  "standingStatus": "{{ firstSegments.ORC[7][8].Value | chc_trim }}",',
  `  "orderTime": "{% assign chcSrc1x0 = '' %}{% assign chcSrc1x0 = firstSegments.ORC[9].Value | as_datetime %}{% assign chcSrc1x1 = '' %}{% assign chcSrc1x1 = firstSegments.MSH[7].Value | as_datetime %}{{ chcSrc1x0 | chc_combine: 'first', ' ', chcSrc1x1 }}",`,
  '  "department": "{{ firstSegments.PV1[3][1].Value }}"',
  '}',
].join('\n');

export const MOCK_LIQUID_REPEAT_SECTIONS: LiquidRepeatSection[] = [
  {
    sourceSegment: 'NTE',
    targetPath: 'notes',
    code: [
      '{% assign repeatGroups = hl7v2Data | get_segment_lists: "NTE" %}',
      '{',
      '  "notes": [{% for item in repeatGroups.NTE %}{% unless forloop.first %},{% endunless %}',
      '{',
      '  "label": "{{ item[3].Value }}",',
      '  "value": "{{ item[3].Value }}",',
      '  "kind": "{{ item[4].Value }}",',
      '  "text": "{{ item[3].Value }}"',
      '}',
      '{% endfor %}]',
      '}',
    ].join('\n'),
  },
];
