import { describe, expect, it } from 'vitest';
import { selectReadableBackground, getContrastRatio } from './colorUtils';

describe('selectReadableBackground', () => {
  it('returns white background for dark foreground colors', () => {
    const foreground = '#111827';
    const result = selectReadableBackground(foreground);
    expect(result).toBe('#FFFFFF');
    expect(getContrastRatio(foreground, result)).toBeGreaterThanOrEqual(4.5);
  });

  it('returns dark background for light foreground colors', () => {
    const foreground = '#F9FAFB';
    const result = selectReadableBackground(foreground);
    expect(result).toBe('#111827');
    expect(getContrastRatio(foreground, result)).toBeGreaterThanOrEqual(4.5);
  });
});
