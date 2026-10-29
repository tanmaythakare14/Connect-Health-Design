export const PRODUCT_NAME = 'ConnectHealth';

export const SUPPORTED_STANDARDS: Array<{
  label: string;
  isCompliance: boolean;
}> = [
  { label: 'HIPAA Ready', isCompliance: true },
  { label: 'SMART on FHIR', isCompliance: false },
  { label: 'HL7v2', isCompliance: false },
];
