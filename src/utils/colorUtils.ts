/**
 * 色変換ユーティリティ関数
 */
const DEFAULT_QR_FOREGROUND = '#111827';
const DEFAULT_QR_BACKGROUND = '#F9FAFB';
const CONTRAST_LIGHT_BACKGROUND = '#FFFFFF';
const CONTRAST_DARK_BACKGROUND = '#111827';

/**
 * RGB値を16進数文字列に変換
 */
export const rgbToHex = (rgb: [number, number, number]): string => {
  return `#${rgb.map((x) => x.toString(16).padStart(2, '0')).join('')}`;
};

/**
 * 16進数文字列をRGB値に変換
 */
export const hexToRgb = (hex: string): [number, number, number] | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : null;
};

/**
 * 16進数カラーコードの有効性をチェック
 */
export const isValidHexColor = (hex: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(hex);
};

/**
 * 色の明度を計算（0-1の範囲）
 */
export const getLuminance = (hex: string): number => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = rgb.map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * 2つの色のコントラスト比を計算
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * 16進数カラーコードを正規化（3桁を6桁に変換）
 */
export const normalizeHexColor = (color: string): string => {
  if (!color.startsWith('#')) {
    color = '#' + color;
  }

  if (color.length === 4) {
    // #RGB -> #RRGGBB
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }

  return color.toUpperCase();
};

/**
 * 2つの色のコントラストが十分かどうかを判定
 */
export const hasGoodContrast = (
  foreground: string,
  background: string
): boolean => {
  return getContrastRatio(foreground, background) >= 4.5; // WCAG AA基準
};

/**
 * 前景色に対して読み取りやすい背景色を選択
 */
export const selectReadableBackground = (foreground: string): string => {
  const lightContrast = getContrastRatio(foreground, CONTRAST_LIGHT_BACKGROUND);
  const darkContrast = getContrastRatio(foreground, CONTRAST_DARK_BACKGROUND);
  return lightContrast >= darkContrast
    ? CONTRAST_LIGHT_BACKGROUND
    : CONTRAST_DARK_BACKGROUND;
};

/**
 * 画像からQRコード用の配色を抽出
 */
export const extractQRColorsFromImage = async (
  file: File
): Promise<{ fgColor: string; bgColor: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const image = new Image();

    reader.onload = () => {
      image.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('画像ファイルの読み込みに失敗しました'));

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('画像解析に失敗しました'));
        return;
      }

      const sampleSize = 32;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      ctx.drawImage(image, 0, 0, sampleSize, sampleSize);
      const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);

      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha < 32) continue;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count += 1;
      }

      if (count === 0) {
        resolve({ fgColor: DEFAULT_QR_FOREGROUND, bgColor: DEFAULT_QR_BACKGROUND });
        return;
      }

      const fgColor = rgbToHex([
        Math.round(r / count),
        Math.round(g / count),
        Math.round(b / count),
      ]).toUpperCase();
      const bgColor = selectReadableBackground(fgColor);

      resolve({ fgColor, bgColor });
    };

    image.onerror = () => reject(new Error('画像の解析に失敗しました'));
    reader.readAsDataURL(file);
  });
};

/**
 * QRコード用の推奨カラーペア
 */
export const getQRColorPresets = () => [
  { name: 'クラシック', fg: '#000000', bg: '#FFFFFF' },
  { name: 'ブルー', fg: '#1E40AF', bg: '#FFFFFF' },
  { name: 'グリーン', fg: '#166534', bg: '#FFFFFF' },
  { name: 'レッド', fg: '#DC2626', bg: '#FFFFFF' },
  { name: 'パープル', fg: '#7C3AED', bg: '#FFFFFF' },
  { name: 'オレンジ', fg: '#EA580C', bg: '#FFFFFF' },
  { name: 'ダークモード', fg: '#FFFFFF', bg: '#111827' },
  { name: 'ネイビー', fg: '#1E3A8A', bg: '#EFF6FF' },
];
