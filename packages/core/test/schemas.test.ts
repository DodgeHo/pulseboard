import { describe, expect, it } from 'vitest';

import { uptimeCheckInputSchema } from '../src/schemas.js';

describe('uptimeCheckInputSchema', () => {
  it('accepts an optional operator description', () => {
    const parsed = uptimeCheckInputSchema.parse({
      name: 'Public homepage',
      description: 'Customer-facing landing page monitored from the public internet.',
      url: 'https://example.com',
    });

    expect(parsed.description).toBe('Customer-facing landing page monitored from the public internet.');
  });

  it('bounds the operator description', () => {
    expect(() =>
      uptimeCheckInputSchema.parse({
        name: 'Public homepage',
        description: 'x'.repeat(501),
        url: 'https://example.com',
      }),
    ).toThrow();
  });
});
