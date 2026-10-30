import type {
  BackendConfigApiDto,
  SigningAlgorithm,
  SigningKeyPairApiDto,
  SigningKeyType,
} from '../@types';

const MOCK_WELL_KNOWN_BASE_URL = 'https://qa.connecthealth.ai/api/well-known';

const EC_CURVE_BY_ALGORITHM: Partial<Record<SigningAlgorithm, string>> = {
  ES256: 'P-256',
  ES384: 'P-384',
  ES512: 'P-521',
};

/** Random base64url text, so each generated MOCK key looks different. */
const randomBase64Url = (length: number): string => {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
};

const wrapPem = (label: string, body: string): string =>
  [
    `-----BEGIN ${label}-----`,
    ...(body.match(/.{1,64}/g) ?? []),
    `-----END ${label}-----`,
  ].join('\n');

/**
 * MOCK signing key pair (not real keys). Shapes match what the API will
 * return: a PEM private key, a public JWKS and an X.509 certificate body.
 */
export function buildMockSigningKeys(
  keyType: SigningKeyType,
  algorithm: SigningAlgorithm,
): SigningKeyPairApiDto {
  const kid = `jwks-${crypto.randomUUID()}`;
  const publicKey =
    keyType === 'RSA'
      ? { kty: 'RSA', n: randomBase64Url(342), e: 'AQAB' }
      : {
          kty: 'EC',
          crv: EC_CURVE_BY_ALGORITHM[algorithm],
          x: randomBase64Url(64),
          y: randomBase64Url(64),
        };

  return {
    keyType,
    algorithm,
    privateKeyPem: wrapPem(
      'PRIVATE KEY',
      randomBase64Url(keyType === 'RSA' ? 1216 : 160),
    ),
    publicJwks: JSON.stringify(
      { keys: [{ ...publicKey, kid, use: 'sig', alg: algorithm }] },
      null,
      2,
    ),
    publicKeyCertificate: randomBase64Url(keyType === 'RSA' ? 392 : 160),
  };
}

/**
 * MOCK backend-services (Oracle Health) setup for a connection, served by
 * service/api.ts until the real endpoint exists. ConnectHealth generates the
 * signing key pair (RSA / RS384 by default), so the JWKS URL and keys are
 * always present; the "System app" question starts unanswered. Delete once
 * getBackendConfig() calls the API.
 */
export function buildMockBackendConfig(
  connectionId: string,
  name: string,
): BackendConfigApiDto {
  return {
    connectionId,
    name,
    ehrSystem: 'Cerner (Oracle Health)',
    appStatus: null,
    jwksUrl: `${MOCK_WELL_KNOWN_BASE_URL}/${connectionId}/.well-known/jwks.json`,
    signingKeys: buildMockSigningKeys('RSA', 'RS384'),
  };
}
