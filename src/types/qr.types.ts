export interface QRSettings {
  url: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  fgColor: string;
  bgColor: string;
  dotStyle: 'square' | 'circle' | 'rounded';
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
