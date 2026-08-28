import { describe, expect, it } from 'vitest';

import {
  hashApiKey,
  LOCAL_DEVELOPMENT_API_KEY_HASH_SALT,
  MIN_PRODUCTION_API_KEY_HASH_SALT_LENGTH,
  resolveApiKeyHashSalt,
} from '../src/api-key.js';

describe('API key hash configuration', () => {
  it('keeps the explicit local fallback outside production', () => {
    expect(resolveApiKeyHashSalt({ NODE_ENV: 'test', API_KEY_HASH_SALT: undefined })).toBe(
      LOCAL_DEVELOPMENT_API_KEY_HASH_SALT,
    );
  });

  it.each([
    { label: 'missing', salt: undefined },
    { label: 'the local default', salt: LOCAL_DEVELOPMENT_API_KEY_HASH_SALT },
    { label: 'too short', salt: 'short-production-salt' },
  ])('rejects $label API key salt in production', ({ salt }) => {
    expect(() => resolveApiKeyHashSalt({ NODE_ENV: 'production', API_KEY_HASH_SALT: salt })).toThrow(
      /API_KEY_HASH_SALT/,
    );
  });

  it('accepts and uses a sufficiently long production salt', () => {
    const environment = {
      NODE_ENV: 'production',
      API_KEY_HASH_SALT: 's'.repeat(MIN_PRODUCTION_API_KEY_HASH_SALT_LENGTH),
    };

    expect(hashApiKey('pb_test_key', environment)).toBe(hashApiKey('pb_test_key', environment));
    expect(hashApiKey('pb_test_key', environment)).not.toBe(
      hashApiKey('pb_test_key', { NODE_ENV: 'test', API_KEY_HASH_SALT: 'different-salt' }),
    );
  });
});
