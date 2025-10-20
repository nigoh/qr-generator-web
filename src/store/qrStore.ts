import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QRSettings, LogoSettings } from '../types/qr.types';

// 汎用的な初期URL: 環境変数で上書き可能（未設定時は空）
const DEFAULT_QR_URL: string = (import.meta.env.VITE_DEFAULT_QR_URL as string | undefined) ?? '';

interface QRState {
  // 基本設定
  url: string;
  errorCorrection: QRSettings['errorCorrection'];
  
  // 色設定
  fgColor: string;
  bgColor: string;
  
  // スタイル設定
  dotStyle: QRSettings['dotStyle'];
  boxSize: number;
  border: number;
  
  // ロゴ設定
  logoFile: File | null;
  logoSettings: LogoSettings;
  
  // UI状態
  logoSectionOpen: boolean;
  settingsSectionOpen: boolean;
  
  // アクション
  setUrl: (url: string) => void;
  setErrorCorrection: (level: QRSettings['errorCorrection']) => void;
  setFgColor: (color: string) => void;
  setBgColor: (color: string) => void;
  setDotStyle: (style: QRSettings['dotStyle']) => void;
  setBoxSize: (size: number) => void;
  setBorder: (border: number) => void;
  setLogoFile: (file: File | null) => void;
  updateLogoSettings: (settings: Partial<LogoSettings>) => void;
  toggleLogoSection: () => void;
  toggleSettingsSection: () => void;
  
  // 設定をまとめて取得
  getQRSettings: () => QRSettings;
}

export const useQRStore = create<QRState>()(
  persist(
    (set, get) => ({
      // 初期値（汎用URL）
      url: DEFAULT_QR_URL,
      errorCorrection: 'H',
      // デフォルト色: 高コントラストで目に優しい配色（Tailwind gray-900 on gray-50 相当）
      fgColor: '#111827',
      bgColor: '#F9FAFB',
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
      setErrorCorrection: (errorCorrection) => set({ errorCorrection }),
      setFgColor: (fgColor) => set({ fgColor }),
      setBgColor: (bgColor) => set({ bgColor }),
      setDotStyle: (dotStyle) => set({ dotStyle }),
      setBoxSize: (boxSize) => set({ boxSize }),
      setBorder: (border) => set({ border }),
      setLogoFile: (logoFile) => set({ logoFile }),
      updateLogoSettings: (settings) => 
        set((state) => ({
          logoSettings: { ...state.logoSettings, ...settings }
        })),
      toggleLogoSection: () => 
        set((state) => ({ logoSectionOpen: !state.logoSectionOpen })),
      toggleSettingsSection: () => 
        set((state) => ({ settingsSectionOpen: !state.settingsSectionOpen })),
      
      // 設定をまとめて取得
      getQRSettings: () => {
        const state = get();
        return {
          url: state.url,
          errorCorrection: state.errorCorrection,
          fgColor: state.fgColor,
          bgColor: state.bgColor,
          dotStyle: state.dotStyle,
          boxSize: state.boxSize,
          border: state.border,
        };
      },
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
