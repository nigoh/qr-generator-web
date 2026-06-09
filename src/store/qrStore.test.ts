import { describe, it, expect, beforeEach } from 'vitest';
import { useQRStore } from './qrStore';

describe('qrStore.resetSettings', () => {
  beforeEach(() => {
    useQRStore.getState().resetSettings();
  });

  it('変更した入力・設定をすべて初期値へ戻す', () => {
    const store = useQRStore.getState();
    store.setUrl('https://example.com/changed');
    store.setErrorCorrection('L');
    store.setFgColor('#ff0000');
    store.setBgColor('#00ff00');
    store.setDotStyle('circle');
    store.setBoxSize(20);
    store.setBorder(10);
    store.updateLogoSettings({ size: 40, padding: 12, radius: 0 });

    useQRStore.getState().resetSettings();

    const reset = useQRStore.getState();
    expect(reset.url).toBe('');
    expect(reset.errorCorrection).toBe('H');
    expect(reset.fgColor).toBe('#111827');
    expect(reset.bgColor).toBe('#F9FAFB');
    expect(reset.dotStyle).toBe('square');
    expect(reset.boxSize).toBe(10);
    expect(reset.border).toBe(4);
    expect(reset.logoSettings).toEqual({ size: 20, padding: 4, radius: 100 });
  });

  it('ロゴファイルもクリアする', () => {
    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    useQRStore.getState().setLogoFile(file);
    expect(useQRStore.getState().logoFile).toBe(file);

    useQRStore.getState().resetSettings();
    expect(useQRStore.getState().logoFile).toBeNull();
  });
});
