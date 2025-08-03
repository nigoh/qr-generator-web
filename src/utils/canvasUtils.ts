import type { QRMatrix, QRSettings, LogoSettings } from '../types/qr.types';
import { isStructuralPattern } from './structureDetector';

/**
 * Canvas用の描画ユーティリティ関数
 */

/**
 * 角丸四角形を描画
 */
export const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string
): void => {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
};

/**
 * 円形を描画
 */
export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  fillStyle: string
): void => {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fill();
};

/**
 * QRコードマトリックスをCanvasに描画
 */
export const drawQRMatrix = (
  canvas: HTMLCanvasElement,
  matrix: QRMatrix,
  settings: QRSettings
): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { boxSize, border, fgColor, bgColor, dotStyle } = settings;
  const { modules, size } = matrix;
  
  // Canvasサイズを設定
  const canvasSize = (size + border * 2) * boxSize;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  
  // 背景を描画
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  
  // 各セルを描画
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (modules[row][col]) { // 黒いセル（QRコードのドット）
        const x = (col + border) * boxSize;
        const y = (row + border) * boxSize;
        
        // 重要な構造パターンは標準の四角形を維持
        if (isStructuralPattern(row, col, size)) {
          ctx.fillStyle = fgColor;
          ctx.fillRect(x, y, boxSize, boxSize);
        } else {
          // データ部分はカスタム形状
          drawCustomDot(ctx, x, y, boxSize, fgColor, dotStyle);
        }
      }
    }
  }
};

/**
 * カスタム形状のドットを描画
 */
const drawCustomDot = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  style: QRSettings['dotStyle']
): void => {
  switch (style) {
    case 'circle':
      {
        const margin = size / 8;
        const radius = (size - margin * 2) / 2;
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        drawCircle(ctx, centerX, centerY, radius, color);
      }
      break;
      
    case 'rounded':
      {
        const margin = size / 10;
        const radius = size / 4;
        drawRoundedRect(
          ctx,
          x + margin,
          y + margin,
          size - margin * 2,
          size - margin * 2,
          radius,
          color
        );
      }
      break;
      
    case 'square':
    default:
      ctx.fillStyle = color;
      ctx.fillRect(x, y, size, size);
      break;
  }
};

/**
 * ロゴ画像をQRコードに合成
 */
export const embedLogo = async (
  canvas: HTMLCanvasElement,
  logoFile: File,
  logoSettings: LogoSettings
): Promise<void> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvasSize = Math.min(canvas.width, canvas.height);
        const logoSize = Math.floor(canvasSize * logoSettings.size / 100);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // 白い背景のパディング
        const paddingSize = logoSize + logoSettings.padding * 2;
        const bgX = centerX - paddingSize / 2;
        const bgY = centerY - paddingSize / 2;
        
        // ラディウス計算（0-100の範囲で、100が完全な円）
        const maxRadius = paddingSize / 2;
        const radius = (logoSettings.radius / 100) * maxRadius;
        
        // 白い背景を描画
        if (logoSettings.radius === 100) {
          // 完全な円
          drawCircle(ctx, centerX, centerY, maxRadius, '#ffffff');
        } else if (logoSettings.radius > 0) {
          // 角丸四角形
          drawRoundedRect(ctx, bgX, bgY, paddingSize, paddingSize, radius, '#ffffff');
        } else {
          // 四角形
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bgX, bgY, paddingSize, paddingSize);
        }
        
        // ロゴ画像を描画
        const logoX = centerX - logoSize / 2;
        const logoY = centerY - logoSize / 2;
        
        // 画像をクリップして描画
        ctx.save();
        
        if (logoSettings.radius === 100) {
          // 円形クリップ
          ctx.beginPath();
          ctx.arc(centerX, centerY, logoSize / 2, 0, 2 * Math.PI);
          ctx.clip();
        } else if (logoSettings.radius > 0) {
          // 角丸クリップ
          const logoRadius = (logoSettings.radius / 100) * (logoSize / 2);
          ctx.beginPath();
          ctx.roundRect(logoX, logoY, logoSize, logoSize, logoRadius);
          ctx.clip();
        }
        
        ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
        ctx.restore();
        
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('ロゴ画像の読み込みに失敗しました'));
    };
    
    img.src = URL.createObjectURL(logoFile);
  });
};

/**
 * CanvasをPNG画像としてダウンロード
 */
export const downloadCanvasAsPNG = (canvas: HTMLCanvasElement, filename: string = 'qrcode.png'): void => {
  canvas.toBlob((blob) => {
    if (!blob) return;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 'image/png');
};
