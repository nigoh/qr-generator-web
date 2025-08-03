# QRコード生成ツール React + Tailwind CSS 実装計画

## 📋 プロジェクト概要

現在のPython/Tkinter版QRコード生成ツールをReact + Tailwind CSSでWeb版として再実装する計画書です。
すべての既存機能を維持しつつ、モダンなWebアプリケーションとして提供します。

## 🎯 機能要件

### 現在のPython版機能

- [x] URL/テキスト入力によるQRコード生成
- [x] ロゴ画像の中央埋め込み（サイズ・パディング・ラディウス調整）
- [x] RGB/16進数カラーコードによる色カスタマイズ
- [x] ドット形状選択（四角・円形・角丸）
- [x] QRコード構造パターンの保持（ファインダー・タイミング・フォーマット情報）
- [x] エラー訂正レベル設定
- [x] ボックスサイズ・ボーダー調整
- [x] PNG画像の保存・ダウンロード
- [x] 設定セクションの開閉機能

### Web版追加機能
- [ ] リアルタイムプレビュー
- [ ] レスポンシブデザイン（モバイル対応）
- [ ] ドラッグ&ドロップでのロゴアップロード
- [ ] PWA対応（オフライン使用可能）
- [ ] 設定の永続化（LocalStorage）
- [ ] QRコードテンプレート保存

## 🏗️ 技術スタック

### フロントエンド
```json
{
  "framework": "React 18 + TypeScript",
  "styling": "Tailwind CSS 3.3+",
  "build": "Vite 4.4+",
  "form": "React Hook Form 7.45+",
  "state": "Zustand 4.4+",
  "qr": "qrcode 1.5.3",
  "canvas": "Fabric.js 5.3+ or Konva.js",
  "download": "downloadjs 1.4.7"
}
```

### 開発環境
```json
{
  "node": "18.0.0+",
  "package_manager": "npm or yarn",
  "editor": "VS Code",
  "extensions": [
    "ES7+ React/Redux/React-Native snippets",
    "Tailwind CSS IntelliSense",
    "TypeScript Importer"
  ]
}
```

## 📁 プロジェクト構造

```
qr-generator-web/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Container.tsx
│   │   ├── forms/
│   │   │   ├── UrlInput.tsx
│   │   │   ├── LogoUpload.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── StyleSettings.tsx
│   │   │   └── QRSettings.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Slider.tsx
│   │   │   └── CollapsibleSection.tsx
│   │   ├── qr/
│   │   │   ├── QRPreview.tsx
│   │   │   ├── QRCanvas.tsx
│   │   │   └── DownloadButton.tsx
│   │   └── QRGeneratorApp.tsx
│   ├── hooks/
│   │   ├── useQRGeneration.ts
│   │   ├── useImageProcessing.ts
│   │   ├── useCanvasDrawing.ts
│   │   ├── useFileUpload.ts
│   │   └── useLocalStorage.ts
│   ├── utils/
│   │   ├── qr/
│   │   │   ├── qrGenerator.ts
│   │   │   ├── structureDetector.ts
│   │   │   └── customRenderer.ts
│   │   ├── image/
│   │   │   ├── logoProcessor.ts
│   │   │   ├── canvasUtils.ts
│   │   │   └── imageFilters.ts
│   │   ├── color/
│   │   │   ├── colorConverter.ts
│   │   │   └── colorValidator.ts
│   │   └── download/
│   │       └── fileExporter.ts
│   ├── types/
│   │   ├── qr.types.ts
│   │   ├── image.types.ts
│   │   └── ui.types.ts
│   ├── store/
│   │   ├── qrStore.ts
│   │   ├── uiStore.ts
│   │   └── settingsStore.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── components.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🎨 UI/UX設計

### デザインシステム

#### カラーパレット（Tailwind CSS）
```css
/* Primary Colors */
.bg-primary-50    /* #f0f9ff */
.bg-primary-500   /* #3b82f6 */
.bg-primary-600   /* #2563eb */

/* Secondary Colors */
.bg-gray-50       /* #f9fafb */
.bg-gray-100      /* #f3f4f6 */
.bg-gray-800      /* #1f2937 */

/* Status Colors */
.bg-green-500     /* Success */
.bg-red-500       /* Error */
.bg-yellow-500    /* Warning */
```

#### タイポグラフィ
```css
/* Headings */
.text-3xl font-bold        /* Main Title */
.text-xl font-semibold     /* Section Title */
.text-lg font-medium       /* Subsection */

/* Body Text */
.text-base                 /* Default */
.text-sm text-gray-600     /* Helper text */
.font-mono                 /* Hex codes */
```

### レスポンシブレイアウト

#### デスクトップ（lg: 1024px+）
```tsx
<div className="grid lg:grid-cols-2 gap-8">
  <div className="space-y-6">
    {/* 設定パネル */}
  </div>
  <div className="sticky top-4">
    {/* プレビューエリア */}
  </div>
</div>
```

#### タブレット（md: 768px - 1023px）
```tsx
<div className="grid md:grid-cols-1 gap-6">
  {/* 設定とプレビューが縦並び */}
</div>
```

#### モバイル（sm: 640px以下）
```tsx
<div className="space-y-4 px-4">
  {/* シングルカラム、コンパクト表示 */}
</div>
```

## 🔧 主要コンポーネント実装

### 1. メインアプリケーション

```tsx
// src/components/QRGeneratorApp.tsx
import React from 'react';
import { Container } from './layout/Container';
import { UrlInput } from './forms/UrlInput';
import { LogoUpload } from './forms/LogoUpload';
import { ColorPicker } from './forms/ColorPicker';
import { StyleSettings } from './forms/StyleSettings';
import { QRPreview } from './qr/QRPreview';
import { DownloadButton } from './qr/DownloadButton';
import { CollapsibleSection } from './ui/CollapsibleSection';

export const QRGeneratorApp: React.FC = () => {
  return (
    <Container>
      <header className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-800">
          QRコード生成ツール
        </h1>
        <p className="text-gray-600 mt-2">
          ロゴ埋め込み・カスタムスタイル対応
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 設定パネル */}
        <div className="space-y-6">
          <UrlInput />
          
          <CollapsibleSection 
            title="ロゴ画像設定（オプション）"
            defaultOpen={false}
          >
            <LogoUpload />
          </CollapsibleSection>

          <CollapsibleSection 
            title="QRコード設定"
            defaultOpen={false}
          >
            <div className="space-y-4">
              <ColorPicker />
              <StyleSettings />
            </div>
          </CollapsibleSection>
        </div>

        {/* プレビューエリア */}
        <div className="sticky top-4 space-y-4">
          <QRPreview />
          <DownloadButton />
        </div>
      </div>
    </Container>
  );
};
```

### 2. カラーピッカー

```tsx
// src/components/forms/ColorPicker.tsx
import React from 'react';
import { useQRStore } from '../../store/qrStore';
import { Input } from '../ui/Input';
import { isValidHexColor } from '../../utils/color/colorValidator';

export const ColorPicker: React.FC = () => {
  const { fgColor, bgColor, setFgColor, setBgColor } = useQRStore();

  const handleFgColorChange = (color: string) => {
    if (isValidHexColor(color)) {
      setFgColor(color);
    }
  };

  const handleBgColorChange = (color: string) => {
    if (isValidHexColor(color)) {
      setBgColor(color);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-800">色設定</h3>
      
      {/* 前景色 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          前景色（QRコード）
        </label>
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-md border-2 border-gray-300 shadow-sm"
            style={{ backgroundColor: fgColor }}
          />
          <input
            type="color"
            value={fgColor}
            onChange={(e) => handleFgColorChange(e.target.value)}
            className="w-12 h-10 rounded-md cursor-pointer border-0"
          />
          <Input
            type="text"
            value={fgColor}
            onChange={(e) => handleFgColorChange(e.target.value)}
            className="font-mono text-sm w-24"
            pattern="^#[0-9A-Fa-f]{6}$"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* 背景色 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          背景色
        </label>
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-md border-2 border-gray-300 shadow-sm"
            style={{ backgroundColor: bgColor }}
          />
          <input
            type="color"
            value={bgColor}
            onChange={(e) => handleBgColorChange(e.target.value)}
            className="w-12 h-10 rounded-md cursor-pointer border-0"
          />
          <Input
            type="text"
            value={bgColor}
            onChange={(e) => handleBgColorChange(e.target.value)}
            className="font-mono text-sm w-24"
            pattern="^#[0-9A-Fa-f]{6}$"
            placeholder="#ffffff"
          />
        </div>
      </div>
    </div>
  );
};
```

### 3. QRプレビュー

```tsx
// src/components/qr/QRPreview.tsx
import React, { useRef, useEffect } from 'react';
import { useQRStore } from '../../store/qrStore';
import { useQRGeneration } from '../../hooks/useQRGeneration';
import { useCanvasDrawing } from '../../hooks/useCanvasDrawing';

export const QRPreview: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    url, 
    fgColor, 
    bgColor, 
    dotStyle, 
    logoFile, 
    logoSettings 
  } = useQRStore();
  
  const { generateQRMatrix } = useQRGeneration();
  const { drawCustomQR } = useCanvasDrawing();

  useEffect(() => {
    if (!canvasRef.current || !url) return;

    const generate = async () => {
      try {
        const matrix = await generateQRMatrix(url);
        await drawCustomQR(
          canvasRef.current!,
          matrix,
          {
            fgColor,
            bgColor,
            dotStyle,
            logoFile,
            logoSettings
          }
        );
      } catch (error) {
        console.error('QR generation failed:', error);
      }
    };

    generate();
  }, [url, fgColor, bgColor, dotStyle, logoFile, logoSettings]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">
        プレビュー
      </h3>
      
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto border border-gray-300 rounded"
          width={400}
          height={400}
        />
      </div>
      
      {!url && (
        <div className="text-center text-gray-500 mt-4">
          <p>URLまたはテキストを入力してください</p>
        </div>
      )}
    </div>
  );
};
```

## 🔄 状態管理（Zustand）

```tsx
// src/store/qrStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface QRState {
  // 基本設定
  url: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  
  // 色設定
  fgColor: string;
  bgColor: string;
  
  // スタイル設定
  dotStyle: 'square' | 'circle' | 'rounded';
  boxSize: number;
  border: number;
  
  // ロゴ設定
  logoFile: File | null;
  logoSettings: {
    size: number;
    padding: number;
    radius: number;
  };
  
  // UI状態
  logoSectionOpen: boolean;
  settingsSectionOpen: boolean;
  
  // アクション
  setUrl: (url: string) => void;
  setFgColor: (color: string) => void;
  setBgColor: (color: string) => void;
  setDotStyle: (style: 'square' | 'circle' | 'rounded') => void;
  setLogoFile: (file: File | null) => void;
  updateLogoSettings: (settings: Partial<QRState['logoSettings']>) => void;
  toggleLogoSection: () => void;
  toggleSettingsSection: () => void;
}

export const useQRStore = create<QRState>()(
  persist(
    (set, get) => ({
      // 初期値
      url: 'https://forms.gle/kPV52yrysGV9QaHb9',
      errorCorrection: 'H',
      fgColor: '#000000',
      bgColor: '#ffffff',
      dotStyle: 'square',
      boxSize: 10,
      border: 4,
      logoFile: null,
      logoSettings: {
        size: 20,
        padding: 4,
        radius: 100,
      },
      logoSectionOpen: false,
      settingsSectionOpen: false,

      // アクション
      setUrl: (url) => set({ url }),
      setFgColor: (fgColor) => set({ fgColor }),
      setBgColor: (bgColor) => set({ bgColor }),
      setDotStyle: (dotStyle) => set({ dotStyle }),
      setLogoFile: (logoFile) => set({ logoFile }),
      updateLogoSettings: (settings) => 
        set((state) => ({
          logoSettings: { ...state.logoSettings, ...settings }
        })),
      toggleLogoSection: () => 
        set((state) => ({ logoSectionOpen: !state.logoSectionOpen })),
      toggleSettingsSection: () => 
        set((state) => ({ settingsSectionOpen: !state.settingsSectionOpen })),
    }),
    {
      name: 'qr-generator-settings',
      partialize: (state) => ({
        errorCorrection: state.errorCorrection,
        fgColor: state.fgColor,
        bgColor: state.bgColor,
        dotStyle: state.dotStyle,
        boxSize: state.boxSize,
        border: state.border,
        logoSettings: state.logoSettings,
      }),
    }
  )
);
```

## 🎛️ QR生成ロジック

```tsx
// src/utils/qr/qrGenerator.ts
import QRCode from 'qrcode';

interface QRMatrix {
  modules: boolean[][];
  size: number;
}

export const generateQRMatrix = async (
  text: string,
  options: {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    version?: number;
  } = {}
): Promise<QRMatrix> => {
  const qrOptions = {
    errorCorrectionLevel: options.errorCorrectionLevel || 'H',
    version: options.version,
    margin: 0,
  };

  // QRコードのデータマトリックスを生成
  const qr = await QRCode.create(text, qrOptions);
  const modules = qr.modules;
  
  return {
    modules: modules.data,
    size: modules.size,
  };
};

// src/utils/qr/structureDetector.ts
export const isFinderPattern = (row: number, col: number, size: number): boolean => {
  // 左上 (0-8, 0-8)
  if (row <= 8 && col <= 8) return true;
  // 右上 (0-8, size-9 to size-1)
  if (row <= 8 && col >= size - 9) return true;
  // 左下 (size-9 to size-1, 0-8)
  if (row >= size - 9 && col <= 8) return true;
  return false;
};

export const isTimingPattern = (row: number, col: number, size: number): boolean => {
  // 水平タイミングパターン (row 6, columns 8 to size-9)
  if (row === 6 && col >= 8 && col <= size - 9) return true;
  // 垂直タイミングパターン (column 6, rows 8 to size-9)
  if (col === 6 && row >= 8 && row <= size - 9) return true;
  return false;
};

export const isFormatInformation = (row: number, col: number, size: number): boolean => {
  // フォーマット情報領域の判定
  if ((row === 8 && col <= 8) || (col === 8 && row <= 8)) return true;
  if (row === 8 && col >= size - 8) return true;
  if (col === 8 && row >= size - 7) return true;
  return false;
};

export const isStructuralPattern = (row: number, col: number, size: number): boolean => {
  return (
    isFinderPattern(row, col, size) ||
    isTimingPattern(row, col, size) ||
    isFormatInformation(row, col, size)
  );
};
```

## 📱 モバイル最適化

### レスポンシブブレークポイント
```css
/* Tailwind CSS ブレークポイント */
sm: 640px   /* スマートフォン */
md: 768px   /* タブレット縦 */
lg: 1024px  /* タブレット横・小型ノートPC */
xl: 1280px  /* デスクトップ */
2xl: 1536px /* 大型ディスプレイ */
```

### タッチ操作対応
```tsx
// タッチフレンドリーなボタンサイズ
<button className="min-h-[44px] min-w-[44px] touch-manipulation">
  
// スワイプジェスチャー対応
<div className="overflow-x-auto snap-x snap-mandatory">
  <div className="flex space-x-4 snap-start">
```

## 🔧 開発・ビルド設定

### package.json
```json
{
  "name": "qr-generator-web",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "qrcode": "^1.5.3",
    "fabric": "^5.3.0",
    "react-hook-form": "^7.45.0",
    "zustand": "^4.4.0",
    "clsx": "^2.0.0",
    "downloadjs": "^1.4.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/qrcode": "^1.5.2",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.45.0",
    "postcss": "^8.4.24",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
```

### Tailwind設定
```js
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
```

## 🚀 実装フェーズ

### Phase 1: 基本機能（1-2週間）
- [x] プロジェクトセットアップ
- [ ] 基本UI構築（Tailwind CSS）
- [ ] URL入力・基本QR生成
- [ ] 色選択機能
- [ ] プレビュー表示

### Phase 2: 高度な機能（2-3週間）
- [ ] ロゴアップロード・埋め込み
- [ ] カスタムドット形状
- [ ] 構造パターン保持
- [ ] 画像ダウンロード

### Phase 3: 最適化・追加機能（1-2週間）
- [ ] モバイル最適化
- [ ] パフォーマンス改善
- [ ] PWA対応
- [ ] テスト実装

## 📝 今後の拡張可能性

### 追加機能候補
- [ ] **SVG出力対応** - ベクター形式での出力
- [ ] **バッチ生成** - 複数QRコードの一括生成
- [ ] **テンプレート機能** - よく使う設定の保存
- [ ] **API連携** - 外部サービスとの連携
- [ ] **統計機能** - 生成回数・人気設定の分析
- [ ] **共有機能** - SNS・メール共有
- [ ] **QRコード読み取り** - カメラ読み取り機能

### 技術的改善
- [ ] **WebAssembly** - 高速な画像処理
- [ ] **Service Worker** - 完全オフライン対応
- [ ] **WebGL** - GPU活用した高速描画
- [ ] **Web Components** - 再利用可能なコンポーネント

この実装計画により、現在のPython版の機能をすべてWeb版で再現し、さらなる拡張も可能な基盤を構築できます。
