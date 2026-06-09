export interface QRSettings {
  url: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  fgColor: string;
  bgColor: string;
  /** グラデーション終端色。空文字またはundefinedの場合はグラデーションなし */
  fgGradientEnd?: string;
  dotStyle: 'square' | 'circle' | 'rounded' | 'diamond';
  boxSize: number;
  border: number;
}

export interface LogoSettings {
  size: number; // パーセンテージ
  padding: number; // ピクセル
  radius: number; // 0-100 (0=四角, 100=円)
}

export interface QRMatrix {
  modules: boolean[][];
  size: number;
}

/**
 * ローカルDB（IndexedDB）に保存されるQRコードの1レコード。
 * settings.url に対象URL/テキストを含むため、これ1つで完全に再現できる。
 */
export interface SavedQR {
  id: string;
  /** ユーザーが付けた名前 */
  name: string;
  createdAt: number;
  updatedAt: number;
  /** url を含む再現可能なQR設定一式 */
  settings: QRSettings;
  logoSettings: LogoSettings;
  /** ロゴ画像（File は Blob のサブタイプ。IndexedDB は Blob をそのまま保存できる） */
  logoBlob: Blob | null;
  /** 読み込み時に File を復元するための元ファイル名 */
  logoName: string | null;
  /** 読み込み時に File を復元するための元MIMEタイプ */
  logoType: string | null;
  /** 一覧表示用のPNGサムネイル */
  thumbnail: Blob;
}

export interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export interface QRGenerationOptions {
  text: string;
  settings: QRSettings;
  logoFile?: File | null;
  logoSettings?: LogoSettings;
}
