/**
 * MOCK raw HL7 the sample tree (sourceSample.ts) was parsed from — the
 * feeding order ORM^O01 — until samples come from the template's API.
 * String.raw keeps the MSH encoding characters (^~\&) as typed.
 */
export const MOCK_SOURCE_PAYLOAD = String.raw`MSH|^~\&|EHR|FACILITY|MIRTH|ANGELEYE|20260610121329|USER01|ORM^O01|970|T|2.3.1|||||||||||
PID|1||000012345678^^^FAC01^MR||TEST^BABYGIRL^^^^^D||20260511|F|||123 MAIN ST^^ANYTOWN^ST^00000^^HOME||(555)555-0100^^7|||||000000001||||||||||||N||
PV1|1|I|NICU^08^A^GeneralHospital^D^^^^^^|||||||NE|||||||1000001^PROVIDER^ADMITTING^^^^^^FAC01^^^^PRN||972661|||||||||||||||||||||||||20260518115600||||||
PV2||||||||||||||||||||||||||||||||||||||||NICU
ORC|NW|624655^EPC|||||30^EVERY 3 HOURS^^20260610121500^20260612075500^R^^Standing^^^^1|PARENT1^Parent|20260610121328|^NURSE^TEST^^||1000002^PROVIDER^ORDERING^^^^^^FAC01^^^^PRN|NICU^^^100000^^^^^MAIN HOSPITAL|(555)555-0101||||GENERICID^GENERICID||||||||||||I||||
ODS|D||NEONATAL|
NTE|1||Diet->Neonatal Diet|Diet Comments|
NTE|2||Feeding Frequency->Q3H||
NTE|3||Desired Volume Per Feeding in mL->30||
NTE|4||Route->NG Nasogastric||
NTE|5||Feeding Type 1->Breast Milk + Donor Milk||
NTE|6||Feeding Type 1 Calorie Concentration (kcal/oz)->24 kcal/oz||
NTE|7||Feeding Type 1 Fortifiers->Prolact+4||
NTE|8||Feeding Type 2->Prolact CR||
NTE|9||Feeding Type 2 Prolact CR Bolus Volume (mL)->1||
NTE|10||Feeding Type 2 Prolact CR Frequency->Q3H||
NTE|11||Feeding Type 3->Expressed Breast Milk||
NTE|12||Feeding Type 3 Calorie Concentration (kcal/oz)->24 kcal/oz||
NTE|13||Feeding Type 3 Fortifiers->Enfamil Liquid HMF||
NTE|14||Feeding Type 3 Modular->Liquigen||
NTE|15||Feeding Type 3 Liquigen Volume (mL)->2||
NTE|16||Feeding Type 3 Liquigen Frequency (free text)->per 100 ml feed||
NTE|17||Feeding Type 1 as primary order as directed by physician|Diet Comments|
NTE|18||Feeding Type 2 Prolact CR Administration Instructions (free text)->Cream at 1 mL for first feed then .5 mL/Kg for each feeding after that
DG1|1||^Test diagnosis|Test diagnosis||A`;
