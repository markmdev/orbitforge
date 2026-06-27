import { describe, expect, it } from 'vitest';
import { parseGeminiHealth } from './geminiHealth';

describe('Gemini runtime health parsing', () => {
  it('accepts configured health responses', () => {
    expect(
      parseGeminiHealth(
        {
          status: 'configured',
          model: 'gemini-3.5-flash',
          cacheEntries: 3,
          liveCallRequired: false,
        },
        true,
      ),
    ).toEqual({
      status: 'configured',
      model: 'gemini-3.5-flash',
      cacheEntries: 3,
      liveCallRequired: false,
    });
  });

  it('keeps blocked health actionable', () => {
    expect(parseGeminiHealth({ status: 'blocked', error: 'Missing GEMINI_API_KEY' }, false)).toMatchObject({
      status: 'blocked',
      error: 'Missing GEMINI_API_KEY',
    });
  });

  it('blocks malformed health responses instead of silently passing', () => {
    expect(parseGeminiHealth(null, true)).toMatchObject({
      status: 'blocked',
      error: 'Malformed Gemini health response',
    });
  });
});
