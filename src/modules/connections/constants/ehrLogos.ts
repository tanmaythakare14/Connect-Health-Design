import athenaLogo from '@/assets/ehr-logos/athena.png';
import cernerLogo from '@/assets/ehr-logos/cerner.png';
import eclinicalworksLogo from '@/assets/ehr-logos/eclinicalworks.png';
import epicLogo from '@/assets/ehr-logos/epic.png';
import healthieLogo from '@/assets/ehr-logos/healthie.png';
import meditechLogo from '@/assets/ehr-logos/meditech.png';
import opendentalLogo from '@/assets/ehr-logos/opendental.png';
import stediLogo from '@/assets/ehr-logos/stedi.png';
import veradigmLogo from '@/assets/ehr-logos/veradigm.png';

/**
 * Vendor wordmarks keyed by EHR id (also the connection source ids). EHRs
 * missing here fall back to their monogram tile.
 */
export const EHR_LOGOS: Partial<Record<string, string>> = {
  athena: athenaLogo,
  cerner: cernerLogo,
  eclinicalworks: eclinicalworksLogo,
  epic: epicLogo,
  healthie: healthieLogo,
  meditech: meditechLogo,
  opendental: opendentalLogo,
  stedi: stediLogo,
  veradigm: veradigmLogo,
};
