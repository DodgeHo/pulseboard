import { createHash } from 'node:crypto';

export const LOCAL_DEVELOPMENT_API_KEY_HASH_SALT = 'local-development-only';
export const MIN_PRODUCTION_API_KEY_HASH_SALT_LENGTH = 32;

export interface ApiKeyHashEnvironment {
  API_KEY_HASH_SALT?: string;
  NODE_ENV?: string;
}

export function resolveApiKeyHashSalt(environment: ApiKeyHashEnvironment = process.env) {
  const configuredSalt = environment.API_KEY_HASH_SALT?.trim();

  if (environment.NODE_ENV === 'production') {
    if (!configuredSalt) {
      throw new Error('API_KEY_HASH_SALT is required when NODE_ENV=production.');
    }
    if (configuredSalt === LOCAL_DEVELOPMENT_API_KEY_HASH_SALT) {
      throw new Error('API_KEY_HASH_SALT must not use the local development value in production.');
    }
    if (configuredSalt.length < MIN_PRODUCTION_API_KEY_HASH_SALT_LENGTH) {
      throw new Error(
        `API_KEY_HASH_SALT must contain at least ${MIN_PRODUCTION_API_KEY_HASH_SALT_LENGTH} characters in production.`,
      );
    }
  }

  return configuredSalt || LOCAL_DEVELOPMENT_API_KEY_HASH_SALT;
}

export function assertApiKeyHashConfiguration(environment: ApiKeyHashEnvironment = process.env) {
  resolveApiKeyHashSalt(environment);
}

export function hashApiKey(key: string, environment: ApiKeyHashEnvironment = process.env) {
  const salt = resolveApiKeyHashSalt(environment);
  return createHash('sha256').update(`${salt}:${key}`).digest('hex');
}
