# QRコード生成ツール React + Tailwind CSS 実装ドキュメント

## 📋 プロジェクト概要

現在のPython/Tkinter版QRコード生成ツールをReact + Tailwind CSSでWeb版として再実装する計画書です。

## 🎯 実装する機能

### 既存機能の移行

- URL/テキスト入力によるQRコード生成
- ロゴ画像の中央埋め込み（サイズ・パディング・ラディウス調整）
- RGB/16進数カラーコードによる色カスタマイズ
- ドット形状選択（四角・円形・角丸）
- QRコード構造パターンの保持
- エラー訂正レベル設定
- PNG画像のダウンロード
- 設定セクションの開閉機能

### Web版追加機能

- リアルタイムプレビュー
- レスポンシブデザイン
- ドラッグ&ドロップでのロゴアップロード
- 設定の永続化（LocalStorage）

## 🏗️ 技術スタック

### フロントエンド

```json
{
  "framework": "React 18 + TypeScript",
  "styling": "Tailwind CSS 3.3+",
  "build": "Vite 4.4+",
  "form": "React Hook Form",
  "state": "Zustand",
  "qr": "qrcode.js",
  "canvas": "Fabric.js"
}
```

## 📁 プロジェクト構造

```text
qr-generator-web/
├── src/
│   ├── components/
│   │   ├── forms/
│   │   │   ├── UrlInput.tsx
│   │   │   ├── LogoUpload.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   └── StyleSettings.tsx
│   │   ├── qr/
│   │   │   ├── QRPreview.tsx
│   │   │   └── DownloadButton.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── CollapsibleSection.tsx
│   ├── hooks/
│   │   ├── useQRGeneration.ts
│   │   ├── useImageProcessing.ts
│   │   └── useCanvasDrawing.ts
│   ├── utils/
│   │   ├── qrGenerator.ts
│   │   ├── structureDetector.ts
│   │   └── colorUtils.ts
│   ├── store/
│   │   └── qrStore.ts
│   └── types/
│       └── qr.types.ts
```

## 🎨 UI設計（Tailwind CSS）

### レスポンシブレイアウト

```tsx
// デスクトップ: 2カラム
<div className="grid lg:grid-cols-2 gap-8">
  <div className="space-y-6">
    {/* 設定パネル */}
  </div>
  <div className="sticky top-4">
    {/* プレビューエリア */}
  </div>
</div>

// モバイル: 1カラム
<div className="space-y-4 px-4">
  {/* 設定とプレビューが縦並び */}
</div>
```

### カラーパレット

```css
/* Primary Colors */
.bg-blue-500    /* メインカラー */
.bg-gray-50     /* 背景 */
.bg-gray-800    /* テキスト */

/* Status Colors */
.bg-green-500   /* 成功 */
.bg-red-500     /* エラー */
```

## 🔧 主要コンポーネント

### 1. メインアプリケーション

```tsx
export const QRGeneratorApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-800">
            QRコード生成ツール
          </h1>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 設定パネル */}
          <div className="space-y-6">
            <UrlInput />
            <CollapsibleSection title="ロゴ設定">
              <LogoUpload />
            </CollapsibleSection>
            <CollapsibleSection title="スタイル設定">
              <ColorPicker />
              <StyleSettings />
            </CollapsibleSection>
          </div>

          {/* プレビューエリア */}
          <div className="space-y-4">
            <QRPreview />
            <DownloadButton />
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 2. カラーピッカー

```tsx
export const ColorPicker: React.FC = () => {
  const { fgColor, bgColor, setFgColor, setBgColor } = useQRStore();

  return (
    <div className="space-y-4">
      {/* 前景色 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">前景色（QRコード）</label>
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded border-2"
            style={{ backgroundColor: fgColor }}
          />
          <input
            type="color"
            value={fgColor}
            onChange={(e) => setFgColor(e.target.value)}
            className="w-12 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={fgColor}
            onChange={(e) => setFgColor(e.target.value)}
            className="font-mono text-sm px-2 py-1 border rounded w-24"
            pattern="^#[0-9A-Fa-f]{6}$"
          />
        </div>
      </div>

      {/* 背景色 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">背景色</label>
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded border-2"
            style={{ backgroundColor: bgColor }}
          />
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-12 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="font-mono text-sm px-2 py-1 border rounded w-24"
            pattern="^#[0-9A-Fa-f]{6}$"
          />
        </div>
      </div>
    </div>
  );
};
```

### 3. QRプレビュー

```tsx
export const QRPreview: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrSettings = useQRStore();
  const { generateQR } = useQRGeneration();

  useEffect(() => {
    if (!canvasRef.current) return;
    generateQR(canvasRef.current, qrSettings);
  }, [qrSettings]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">プレビュー</h3>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="max-w-full border rounded"
          width={400}
          height={400}
        />
      </div>
    </div>
  );
};
```

## 🔄 状態管理（Zustand）

```tsx
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
  
  // アクション
  setUrl: (url: string) => void;
  setFgColor: (color: string) => void;
  setBgColor: (color: string) => void;
  setDotStyle: (style: QRState['dotStyle']) => void;
  setLogoFile: (file: File | null) => void;
}

export const useQRStore = create<QRState>()(
  persist(
    (set) => ({
      // 初期値
      url: 'https://example.com',
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

      // アクション
      setUrl: (url) => set({ url }),
      setFgColor: (fgColor) => set({ fgColor }),
      setBgColor: (bgColor) => set({ bgColor }),
      setDotStyle: (dotStyle) => set({ dotStyle }),
      setLogoFile: (logoFile) => set({ logoFile }),
    }),
    {
      name: 'qr-generator-settings',
    }
  )
);
```

## 🎛️ QR生成ロジック

```tsx
// QRマトリックス生成
export const generateQRMatrix = async (
  text: string,
  options: {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  } = {}
): Promise<{ modules: boolean[][]; size: number }> => {
  const qr = await QRCode.create(text, {
    errorCorrectionLevel: options.errorCorrectionLevel || 'H',
    margin: 0,
  });
  
  return {
    modules: qr.modules.data,
    size: qr.modules.size,
  };
};

// 構造パターン判定
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
  if (row === 6 && col >= 8 && col <= size - 9) return true;
  if (col === 6 && row >= 8 && row <= size - 9) return true;
  return false;
};

export const isStructuralPattern = (row: number, col: number, size: number): boolean => {
  return isFinderPattern(row, col, size) || isTimingPattern(row, col, size);
};
```

## 📱 モバイル最適化

### Tailwindブレークポイント

```css
sm: 640px   /* スマートフォン */
md: 768px   /* タブレット */
lg: 1024px  /* デスクトップ */
```

### タッチ対応

```tsx
// タッチフレンドリーなボタンサイズ
<button className="min-h-[44px] min-w-[44px] touch-manipulation">

// スワイプ対応
<div className="overflow-x-auto snap-x">
```

## 🔧 開発設定

### package.json

```json
{
  "name": "qr-generator-web",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "qrcode": "^1.5.3",
    "fabric": "^5.3.0",
    "react-hook-form": "^7.45.0",
    "zustand": "^4.4.0",
    "downloadjs": "^1.4.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/qrcode": "^1.5.2",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
```

### Tailwind設定

```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#3b82f6',
          600: '#2563eb',
        }
      },
      fontFamily: {
        mono: ['Consolas', 'monospace'],
      }
    },
  },
}
```

## 🚀 実装フェーズ

### Phase 1: 基本機能（1-2週間）

- プロジェクトセットアップ
- 基本UI構築
- URL入力・基本QR生成
- 色選択機能

### Phase 2: 高度な機能（2-3週間）

- ロゴアップロード・埋め込み
- カスタムドット形状
- 構造パターン保持
- 画像ダウンロード

### Phase 3: 最適化（1-2週間）

- モバイル最適化
- パフォーマンス改善
- PWA対応

## 📝 追加機能の可能性

### 将来的な拡張

- SVG出力対応
- バッチ生成機能
- テンプレート保存
- QRコード読み取り機能
- API連携

### 技術的改善

- WebAssembly活用
- Service Worker対応
- WebGL描画

## 🎯 まとめ

この実装計画により、現在のPython版のすべての機能をWeb版で再現し、さらにWebならではの機能を追加した現代的なQRコード生成ツールを構築できます。

React + Tailwind CSSの組み合わせにより、保守性が高く、レスポンシブで美しいUIを実現できます。
