import QRCode from 'qrcode';
import type { QRMatrix, QRSettings, LogoSettings } from '../types/qr.types';

// Canvas API のroundRect ポリフィル
declare global {
  interface CanvasRenderingContext2D {
    roundRect(x: number, y: number, width: number, height: number, radius: number): void;
  }
}

// roundRect ポリフィル
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
  };
}

/**
 * QRコードのデータマトリックスを生成
 */
export const generateQRMatrix = async (
  text: string,
  options: Pick<QRSettings, 'errorCorrection'> = { errorCorrection: 'H' }
): Promise<QRMatrix> => {
  try {
    const qrOptions = {
      errorCorrectionLevel: options.errorCorrection,
      margin: 0,
      scale: 1,
    };

    // QRCodeインスタンスを作成
    const qr = QRCode.create(text, qrOptions);
    const modules = qr.modules;
    
    // Uint8Arrayをboolean[][]に変換
    const size = modules.size;
    const matrix: boolean[][] = [];
    
    for (let i = 0; i < size; i++) {
      matrix[i] = [];
      for (let j = 0; j < size; j++) {
        matrix[i][j] = modules.get(i, j) === 1;
      }
    }
    
    return {
      modules: matrix,
      size: size,
    };
  } catch (error) {
    console.error('QR generation failed:', error);
    throw new Error('QRコードの生成に失敗しました');
  }
};

/**
 * Canvas要素にQRコードを描画
 */
export const generateQRCode = async (
  text: string,
  options: QRSettings & {
    logoFile?: File | null;
    logoSettings?: LogoSettings;
  },
  canvas: HTMLCanvasElement
): Promise<HTMLCanvasElement> => {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context が取得できませんでした');
    }

    // QRマトリックスを生成
    const qrMatrix = await generateQRMatrix(text, {
      errorCorrection: options.errorCorrection,
    });

    const { modules, size } = qrMatrix;
    const { boxSize, border, fgColor, bgColor, dotStyle } = options;

    // キャンバスサイズを計算
    const totalSize = (size + border * 2) * boxSize;
    canvas.width = totalSize;
    canvas.height = totalSize;

    // 背景を塗りつぶし
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, totalSize, totalSize);

    // QRコードを描画
    ctx.fillStyle = fgColor;

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (modules[row][col]) {
          const x = (col + border) * boxSize;
          const y = (row + border) * boxSize;

          switch (dotStyle) {
            case 'circle':
              ctx.beginPath();
              ctx.arc(
                x + boxSize / 2,
                y + boxSize / 2,
                boxSize / 2,
                0,
                2 * Math.PI
              );
              ctx.fill();
              break;
            case 'rounded':
              const radius = boxSize * 0.2;
              ctx.beginPath();
              ctx.roundRect(x, y, boxSize, boxSize, radius);
              ctx.fill();
              break;
            default: // square
              ctx.fillRect(x, y, boxSize, boxSize);
              break;
          }
        }
      }
    }

    // ロゴを描画
    if (options.logoFile && options.logoSettings) {
      await drawLogo(ctx, options.logoFile, options.logoSettings, totalSize);
    }

    return canvas;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('QRコードの生成に失敗しました');
  }
};

/**
 * ロゴを描画
 */
const drawLogo = async (
  ctx: CanvasRenderingContext2D,
  logoFile: File,
  logoSettings: LogoSettings,
  canvasSize: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const logoSize = (canvasSize * logoSettings.size) / 100;
        const x = (canvasSize - logoSize) / 2;
        const y = (canvasSize - logoSize) / 2;

        // ロゴ背景（パディング付き）
        const bgSize = logoSize + logoSettings.padding * 2;
        const bgX = x - logoSettings.padding;
        const bgY = y - logoSettings.padding;

        ctx.save();

        // 背景を白で塗りつぶし
        ctx.fillStyle = '#ffffff';
        if (logoSettings.radius > 0) {
          const radius = (bgSize * logoSettings.radius) / 100;
          ctx.beginPath();
          ctx.roundRect(bgX, bgY, bgSize, bgSize, radius);
          ctx.fill();
          ctx.clip();
        } else {
          ctx.fillRect(bgX, bgY, bgSize, bgSize);
        }

        // ロゴを描画
        if (logoSettings.radius > 0) {
          const logoRadius = (logoSize * logoSettings.radius) / 100;
          ctx.beginPath();
          ctx.roundRect(x, y, logoSize, logoSize, logoRadius);
          ctx.clip();
        }

        ctx.drawImage(img, x, y, logoSize, logoSize);
        ctx.restore();

        resolve();
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('ロゴ画像の読み込みに失敗しました'));
    };

    // FileからDataURLを作成
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('ロゴファイルの読み込みに失敗しました'));
    };
    reader.readAsDataURL(logoFile);
  });
};

/**
 * QRコードを標準的な方法で生成（デバッグ用）
 */
export const generateStandardQR = async (
  text: string,
  options: {
    errorCorrectionLevel?: QRSettings['errorCorrection'];
    width?: number;
    margin?: number;
    color?: {
      dark: string;
      light: string;
    };
  } = {}
): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: options.errorCorrectionLevel || 'H',
      width: options.width || 400,
      margin: options.margin || 4,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#ffffff',
      },
    });
  } catch (error) {
    console.error('Standard QR generation failed:', error);
    throw new Error('標準QRコードの生成に失敗しました');
  }
};
