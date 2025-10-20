import type { TourStep } from "@/features/tour-guide/types"

export const defaultTourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "ようこそ！",
    description:
      "このツアーでは、カスタムQRコードを作成するためのステップを順番にご案内します。数分で完走できるので、気軽に進めてみましょう。",
    allowSkip: false,
  },
  {
    id: "url-input",
    title: "リンクやテキストを入力",
    description:
      "まずはQRコード化したいURLやテキストを入力します。リンクがない場合は任意のテキストでも問題ありません。",
    targetSelector: '[data-tour="url-input"]',
  },
  {
    id: "basic-settings",
    title: "基本設定を整える",
    description:
      "用途に合わせてエラー訂正やサイズ、余白などを調整できます。印刷用途の場合は余白を少し広めにするのが安心です。",
    targetSelector: '[data-tour="basic-settings"]',
    tips: [
      "エラー訂正レベルを高くするとロゴを埋め込んでも読み取りやすくなります",
    ],
  },
  {
    id: "style-settings",
    title: "ブランドに合わせてスタイル調整",
    description:
      "配色やドット形状を変更してブランドイメージに合わせましょう。背景とのコントラストを確保すると読み取り精度が高まります。",
    targetSelector: '[data-tour="style-settings"]',
  },
  {
    id: "logo-settings",
    title: "ロゴを埋め込む",
    description:
      "ロゴ画像をアップロードして中央に配置できます。使うロゴは背景透過PNGがおすすめです。",
    targetSelector: '[data-tour="logo-settings"]',
    tips: [
      "ロゴサイズを大きくするほど読み取りに影響するため、余白を十分に確保しましょう",
    ],
  },
  {
    id: "qr-preview",
    title: "プレビューで確認",
    description:
      "設定が完了したらプレビューで仕上がりを確認できます。細部を調整したい場合は前のステップに戻って再編集しましょう。",
    targetSelector: '[data-tour="qr-preview"]',
  },
  {
    id: "download",
    title: "ダウンロードで活用",
    description:
      "PNG形式でダウンロードしてポスターや資料に活用できます。ベクター形式が必要な場合はSVG出力のロードマップもチェックしてください。",
    targetSelector: '[data-tour="download-button"]',
    ctaLabel: "完了する",
  },
  {
    id: "completion",
    title: "準備完了",
    description:
      "ツアー完走お疲れさまでした！実際にQRコードを作成してみたり、気になる設定を改めて確認してみましょう。",
    allowSkip: false,
  },
]
