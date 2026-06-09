import { describe, expect, it } from 'vitest';
import { selectReadableBackground, getContrastRatio, hasGoodContrast } from './colorUtils';

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

describe('hasGoodContrast', () => {
  it('WCAG AA基準(4.5:1)を満たす組み合わせは true', () => {
    expect(hasGoodContrast('#000000', '#FFFFFF')).toBe(true);
    expect(hasGoodContrast('#111827', '#F9FAFB')).toBe(true);
  });

  it('コントラストが不足する組み合わせは false', () => {
    expect(hasGoodContrast('#777777', '#888888')).toBe(false);
    // 黄色背景に白文字（コントラスト不足）
    expect(hasGoodContrast('#FFFF00', '#FFFFFF')).toBe(false);
  });
});
