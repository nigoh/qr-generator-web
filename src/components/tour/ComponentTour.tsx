import React from 'react';
import { useTourStore } from '../../store/tourStore';
import { ComponentTourStep } from './ComponentTourStep';
import { UrlInput } from '../forms/UrlInput';
import { QRPreview } from '../qr/QRPreview';
import { LogoUpload } from '../forms/LogoUpload';
import { DownloadButton } from '../qr/DownloadButton';
import { ColorPicker } from '../forms/ColorPicker';
import { useQRStore } from '../../store/qrStore';

// 各ステップで表示するコンポーネントの定義
const tourStepsWithComponents = [
  {
    id: 'url-input',
    title: 'ステップ 1: URL・テキスト入力',
    content: 'QRコードに変換したいURL・テキスト・連絡先情報などを入力してください。サンプルボタンで例を試すこともできます。',
    component: <UrlInput />,
    tips: [
      'URLは「https://」から始めると読み取り時にブラウザで開けます',
      'テキストは日本語でも対応しています',
      'サンプルボタンで例を確認できます'
    ],
    features: ['URL入力', 'テキスト入力', 'サンプル生成', 'リアルタイム変換']
  },
  {
    id: 'qr-preview',
    title: 'ステップ 2: QRコードプレビュー',
    content: '入力した内容がリアルタイムでQRコードに変換されます。スマートフォンなどで読み取りテストを行ってください。',
    component: <QRPreviewDemo />,
    tips: [
      'スマートフォンのカメラアプリで読み取りテストができます',
      '設定変更はリアルタイムで反映されます',
      'エラー訂正レベルが高いほど読み取りやすくなります'
    ],
    features: ['リアルタイム生成', '読み取りテスト', 'プレビュー表示']
  },
  {
    id: 'style-settings',
    title: 'ステップ 3: スタイル設定',
    content: 'QRコードの色や形状をカスタマイズして、ブランドに合わせたデザインにできます。',
    component: <StyleSettingsDemo />,
    tips: [
      'コントラストの高い色の組み合わせを推奨します',
      '読み取りテストを必ず行ってください',
      '印刷時の色再現も考慮しましょう'
    ],
    features: ['色のカスタマイズ', 'デザイン調整', 'リアルタイムプレビュー']
  },
  {
    id: 'logo-settings',
    title: 'ステップ 4: ロゴ埋め込み',
    content: '企業ロゴや画像をQRコードの中央に埋め込むことができます。透明背景のPNGファイルがおすすめです。',
    component: <LogoUploadDemo />,
    tips: [
      '透明背景のPNGファイルが最適です',
      'ロゴサイズは読み取り性能に影響します',
      'エラー訂正レベル「H（最高）」を推奨します'
    ],
    features: ['画像アップロード', 'サイズ調整', '透明背景対応']
  },
  {
    id: 'download',
    title: 'ステップ 5: ダウンロード・共有',
    content: '完成したQRコードをPNG・JPG形式でダウンロードするか、クリップボードにコピーして使用してください。',
    component: <DownloadDemo />,
    tips: [
      'PNG形式は透明背景に対応しています',
      'JPG形式はファイルサイズが小さくなります',
      'クリップボードコピーで他のアプリに貼り付け可能です'
    ],
    features: ['PNG/JPGダウンロード', 'クリップボードコピー', '高解像度出力']
  }
];

// デモ用のコンポーネント（実際のコンポーネントを簡易版で）
function QRPreviewDemo() {
  const { errorCorrection, boxSize } = useQRStore();
  
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="p-4 bg-white border rounded-lg">
        <QRPreview />
      </div>
      <p className="text-sm text-gray-600 text-center">
        現在の設定: エラー訂正レベル {errorCorrection}、サイズ {boxSize}px
      </p>
    </div>
  );
}

function StyleSettingsDemo() {
  return (
    <div className="space-y-4">
      <ColorPicker />
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <p className="font-medium mb-1">スタイル設定のポイント:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>前景色と背景色のコントラストを十分に確保してください</li>
          <li>読み取りテストを必ず行ってください</li>
          <li>印刷時の色再現も考慮しましょう</li>
        </ul>
      </div>
    </div>
  );
}

function LogoUploadDemo() {
  return (
    <div className="space-y-4">
      <LogoUpload />
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <p className="font-medium mb-1">推奨設定:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>ファイル形式: PNG（透明背景）</li>
          <li>推奨サイズ: 200x200px以下</li>
          <li>エラー訂正レベル: H（最高）</li>
        </ul>
      </div>
    </div>
  );
}

function DownloadDemo() {
  return (
    <div className="space-y-4 text-center">
      <DownloadButton />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="font-medium text-green-800">PNG形式</p>
          <p className="text-green-600">透明背景対応、高品質</p>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="font-medium text-blue-800">JPG形式</p>
          <p className="text-blue-600">小サイズ、Web用途に最適</p>
        </div>
      </div>
    </div>
  );
}

export const ComponentTour: React.FC = () => {
  const { isActive, currentStep, endTour, nextStep, prevStep } = useTourStore();

  if (!isActive) {
    return null;
  }

  const currentStepData = tourStepsWithComponents[currentStep];
  
  if (!currentStepData) {
    return null;
  }

  return (
    <ComponentTourStep
      step={currentStepData}
      currentStepIndex={currentStep}
      totalSteps={tourStepsWithComponents.length}
      onNext={nextStep}
      onPrev={prevStep}
      onSkip={endTour}
      onClose={endTour}
    />
  );
};
