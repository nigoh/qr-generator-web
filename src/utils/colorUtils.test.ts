import { describe, expect, it } from 'vitest';
import { extractQRColorsFromImage, selectReadableBackground, getContrastRatio } from './colorUtils';

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

describe('extractQRColorsFromImage', () => {
  it('returns default palette when image has no visible pixels', async () => {
    const originalCreateElement = document.createElement.bind(document);
    const originalFileReader = globalThis.FileReader;
    const originalImage = globalThis.Image;

    class MockFileReader {
      result = 'data:image/png;base64,mock';
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
      onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
      readAsDataURL(): void {
        this.onload?.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
      }
    }

    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) {
        this.onload?.();
      }
    }

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: () => ({
        drawImage: () => {},
        getImageData: () => ({
          data: new Uint8ClampedArray(32 * 32 * 4),
        }),
      }),
    };

    document.createElement = ((tagName: string) => {
      if (tagName === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
      return originalCreateElement(tagName as keyof HTMLElementTagNameMap);
    }) as typeof document.createElement;
    globalThis.FileReader = MockFileReader as unknown as typeof FileReader;
    globalThis.Image = MockImage as unknown as typeof Image;

    try {
      const file = new File(['mock'], 'logo.png', { type: 'image/png' });
      const result = await extractQRColorsFromImage(file);
      expect(result).toEqual({ fgColor: '#111827', bgColor: '#F9FAFB' });
    } finally {
      document.createElement = originalCreateElement as typeof document.createElement;
      globalThis.FileReader = originalFileReader;
      globalThis.Image = originalImage;
    }
  });

  it('extracts average visible color from image pixels', async () => {
    const originalCreateElement = document.createElement.bind(document);
    const originalFileReader = globalThis.FileReader;
    const originalImage = globalThis.Image;

    class MockFileReader {
      result = 'data:image/png;base64,mock';
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
      onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
      readAsDataURL(): void {
        this.onload?.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
      }
    }

    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) {
        this.onload?.();
      }
    }

    const pixelData = new Uint8ClampedArray(32 * 32 * 4);
    pixelData.set([
      255, 0, 0, 255,
      0, 255, 0, 255,
    ]);

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: () => ({
        drawImage: () => {},
        getImageData: () => ({ data: pixelData }),
      }),
    };

    document.createElement = ((tagName: string) => {
      if (tagName === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
      return originalCreateElement(tagName as keyof HTMLElementTagNameMap);
    }) as typeof document.createElement;
    globalThis.FileReader = MockFileReader as unknown as typeof FileReader;
    globalThis.Image = MockImage as unknown as typeof Image;

    try {
      const file = new File(['mock'], 'logo.png', { type: 'image/png' });
      const result = await extractQRColorsFromImage(file);
      expect(result.fgColor).toBe('#808000');
      expect(result.bgColor).toBe(selectReadableBackground(result.fgColor));
    } finally {
      document.createElement = originalCreateElement as typeof document.createElement;
      globalThis.FileReader = originalFileReader;
      globalThis.Image = originalImage;
    }
  });

  it('rejects when file reader fails', async () => {
    const originalFileReader = globalThis.FileReader;

    class MockFileReader {
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
      onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
      readAsDataURL(): void {
        this.onerror?.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
      }
    }

    globalThis.FileReader = MockFileReader as unknown as typeof FileReader;

    try {
      const file = new File(['mock'], 'logo.png', { type: 'image/png' });
      await expect(extractQRColorsFromImage(file)).rejects.toThrow('画像ファイルの読み込みに失敗しました');
    } finally {
      globalThis.FileReader = originalFileReader;
    }
  });

  it('rejects when image analysis fails', async () => {
    const originalFileReader = globalThis.FileReader;
    const originalImage = globalThis.Image;

    class MockFileReader {
      result = 'data:image/png;base64,mock';
      onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
      onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
      readAsDataURL(): void {
        this.onload?.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
      }
    }

    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) {
        this.onerror?.();
      }
    }

    globalThis.FileReader = MockFileReader as unknown as typeof FileReader;
    globalThis.Image = MockImage as unknown as typeof Image;

    try {
      const file = new File(['mock'], 'logo.png', { type: 'image/png' });
      await expect(extractQRColorsFromImage(file)).rejects.toThrow('画像の解析に失敗しました');
    } finally {
      globalThis.FileReader = originalFileReader;
      globalThis.Image = originalImage;
    }
  });
});
