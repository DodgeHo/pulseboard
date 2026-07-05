import { describe, expect, it } from 'vitest';
import { getCopy, localeOrder, type Locale } from '../src/i18n.js';

describe('web i18n contract', () => {
  it('keeps English first and Simplified Chinese last', () => {
    expect(localeOrder).toHaveLength(10);
    expect(localeOrder[0]).toBe('en');
    expect(localeOrder.at(-1)).toBe('zh-CN');
    expect(new Set(localeOrder).size).toBe(localeOrder.length);
  });

  it('includes the required Chinese locales', () => {
    expect(localeOrder).toContain('zh-TW');
    expect(localeOrder).toContain('zh-CN');
    expect(getCopy('zh-TW').languageName).toBe(String.fromCodePoint(0x7e41, 0x9ad4, 0x4e2d, 0x6587));
    expect(getCopy('zh-CN').languageName).toBe(String.fromCodePoint(0x7b80, 0x4f53, 0x4e2d, 0x6587));
  });

  it('keeps every locale usable for the frontend/backend cockpit', () => {
    const requiredKeys = [
      'languageName',
      'titleA',
      'titleB',
      'frontendLabel',
      'backendLabel',
      'liveEndpoint',
      'readyEndpoint',
      'openapiEndpoint',
      'docsEndpoint',
    ] as const;

    for (const locale of localeOrder) {
      const copy = getCopy(locale as Locale);
      for (const key of requiredKeys) {
        expect(copy[key], `${locale}.${key}`).toEqual(expect.any(String));
        expect(copy[key].trim(), `${locale}.${key}`).not.toBe('');
      }
    }
  });
});
