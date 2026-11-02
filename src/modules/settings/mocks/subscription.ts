import type { SubscriptionApiDto } from '../@types';
import { LICENSE_SOURCE_TYPE } from '../constants';

/** MOCK AWS Marketplace subscription. Delete once getSubscription() calls the API. */
export const MOCK_SUBSCRIPTION: SubscriptionApiDto = {
  plan: {
    name: '10 Integrations Plan',
    integrationsLimit: 35,
    integrationsUsed: 20,
    expiresAt: '2027-02-17T00:00:00.000Z',
  },
  sources: [
    {
      id: 'src-aws',
      type: LICENSE_SOURCE_TYPE.AWS_MARKETPLACE,
      name: 'AWS Marketplace',
      connections: 30,
      inUse: 20,
      isActive: true,
    },
    {
      id: 'src-connecthealth',
      type: LICENSE_SOURCE_TYPE.CONNECTHEALTH,
      name: 'ConnectHealth License',
      connections: 5,
      inUse: 0,
      isActive: true,
    },
  ],
  details: {
    customerId:
      'arn:aws:license-manager::294406891311:license:l-b06dc56ac32340dd856e1cae19730827',
    awsAccountId: '305448253911',
    productCode: 'prod-byg4adjg3rd76',
    setupFeePaid: true,
    isActive: true,
  },
};
