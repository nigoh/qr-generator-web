import { create } from 'zustand';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector or data-tour-id
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void; // Optional action to perform when step is shown
}

export const tourSteps: TourStep[] = [
  {
    id: 'url-input',
    title: 'ステップ 1: URL・テキスト入力',
    content: 'まず、QRコードに変換したいURL・テキスト・連絡先情報などを入力してください。サンプルボタンで例を試すこともできます。',
    target: '[data-tour="url-input"]',
    position: 'bottom',
    action: () => {
      // 基本設定セクションを開く
      const basicSettings = document.querySelector('[data-tour="basic-settings"]');
      if (basicSettings) {
        const button = basicSettings.querySelector('button');
        if (button && button.getAttribute('aria-expanded') === 'false') {
          button.click();
        }
      }
    },
  },
  {
    id: 'qr-preview',
    title: 'ステップ 2: QRコードプレビュー',
    content: '入力した内容がリアルタイムでQRコードに変換されます。スマートフォンなどで読み取りテストを行ってください。',
    target: '[data-tour="qr-preview"]',
    position: 'right',
  },
  {
    id: 'basic-settings',
    title: 'ステップ 3: 基本設定',
    content: 'エラー訂正レベルやQRコードサイズを調整できます。ロゴを埋め込む場合は「H（最高）」を推奨します。',
    target: '[data-tour="basic-settings"]',
    position: 'top',
    action: () => {
      // 基本設定セクションを開く
      const basicSettings = document.querySelector('[data-tour="basic-settings"]');
      if (basicSettings) {
        const button = basicSettings.querySelector('button');
        if (button && button.getAttribute('aria-expanded') === 'false') {
          button.click();
        }
        
        // より確実なスクロール（中央配置）
        setTimeout(() => {
          basicSettings.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
          });
        }, 300);
      }
    },
  },
  {
    id: 'style-settings',
    title: 'ステップ 4: スタイル設定',
    content: 'QRコードの色や形状をカスタマイズして、ブランドに合わせたデザインにできます。',
    target: '[data-tour="style-settings"]',
    position: 'top',
    action: () => {
      // スタイル設定セクションを開く
      const styleSettings = document.querySelector('[data-tour="style-settings"]');
      if (styleSettings) {
        const button = styleSettings.querySelector('button');
        if (button && button.getAttribute('aria-expanded') === 'false') {
          button.click();
        }
        
        // より確実なスクロール（中央配置）
        setTimeout(() => {
          styleSettings.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
          });
        }, 300);
      }
    },
  },
  {
    id: 'logo-settings',
    title: 'ステップ 5: ロゴ埋め込み',
    content: '企業ロゴや画像をQRコードの中央に埋め込むことができます。透明背景のPNGファイルがおすすめです。',
    target: '[data-tour="logo-settings"]',
    position: 'top',
    action: () => {
      // ロゴ設定セクションを開く
      const logoSettings = document.querySelector('[data-tour="logo-settings"]');
      if (logoSettings) {
        const button = logoSettings.querySelector('button');
        if (button && button.getAttribute('aria-expanded') === 'false') {
          button.click();
        }
        
        // より確実なスクロール（中央配置）
        setTimeout(() => {
          logoSettings.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
          });
        }, 300);
      }
    },
  },
  {
    id: 'download',
    title: 'ステップ 6: ダウンロード・共有',
    content: '完成したQRコードをPNG・JPG形式でダウンロードするか、クリップボードにコピーして使用してください。',
    target: '[data-tour="download-button"]',
    position: 'top',
    action: () => {
      // ダウンロードセクションにスクロール
      const downloadButton = document.querySelector('[data-tour="download-button"]');
      if (downloadButton) {
        setTimeout(() => {
          downloadButton.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }, 200);
      }
    },
  },
];

interface TourState {
  isActive: boolean;
  currentStep: number;
  
  // Actions
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepIndex: number) => void;
  
  // Getters
  getCurrentStepData: () => TourStep | null;
  getTotalSteps: () => number;
}

export const useTourStore = create<TourState>((set, get) => ({
  isActive: false,
  currentStep: 0,
  
  startTour: () => {
    set({ isActive: true, currentStep: 0 });
    
    // Execute action for the first step with longer delay
    const firstStep = tourSteps[0];
    if (firstStep.action) {
      setTimeout(() => {
        firstStep.action?.();
      }, 300);
    }
  },
  
  endTour: () => {
    set({ isActive: false, currentStep: 0 });
  },
  
  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < tourSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      set({ currentStep: nextStepIndex });
      
      // Execute action for the new step with longer delay
      const stepData = tourSteps[nextStepIndex];
      if (stepData.action) {
        setTimeout(() => {
          stepData.action?.();
        }, 300);
      }
    } else {
      get().endTour();
    }
  },
  
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      set({ currentStep: prevStepIndex });
      
      // Execute action for the previous step with longer delay
      const stepData = tourSteps[prevStepIndex];
      if (stepData.action) {
        setTimeout(() => {
          stepData.action?.();
        }, 300);
      }
    }
  },
  
  goToStep: (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < tourSteps.length) {
      set({ currentStep: stepIndex });
      
      // Execute action for the target step with longer delay
      const stepData = tourSteps[stepIndex];
      if (stepData.action) {
        setTimeout(() => {
          stepData.action?.();
        }, 300);
      }
    }
  },
  
  getCurrentStepData: () => {
    const { currentStep } = get();
    return tourSteps[currentStep] || null;
  },
  
  getTotalSteps: () => tourSteps.length,
}));
