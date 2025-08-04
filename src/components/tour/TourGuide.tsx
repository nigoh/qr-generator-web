import React, { useEffect } from 'react';
import { TourStepImproved } from './TourStepImproved';
import { useTourStore } from '../../store/tourStore';

export const TourGuide: React.FC = () => {
  const isActive = useTourStore((state) => state.isActive);
  const currentStep = useTourStore((state) => state.currentStep);
  const getCurrentStepData = useTourStore((state) => state.getCurrentStepData);
  const getTotalSteps = useTourStore((state) => state.getTotalSteps);
  const endTour = useTourStore((state) => state.endTour);
  const nextStep = useTourStore((state) => state.nextStep);
  const prevStep = useTourStore((state) => state.prevStep);

  // ツアー中のスクロール防止
  useEffect(() => {
    if (isActive) {
      // 現在のスクロール位置を保存
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // bodyのスクロールを無効化
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollTop}px`;
      document.body.style.width = '100%';
      
      return () => {
        // スクロール設定を復元
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // スクロール位置を復元
        window.scrollTo(0, scrollTop);
      };
    }
  }, [isActive]);

  const currentStepData = getCurrentStepData();
  const totalSteps = getTotalSteps();

  if (!isActive || !currentStepData) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999]" data-testid="tour-overlay">
      {/* モーダル背景でインタラクション防止 - より強力なブロッキング */}
      <div 
        className="fixed inset-0 bg-black/60 cursor-not-allowed"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onScroll={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onWheel={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        style={{ 
          pointerEvents: 'all',
          touchAction: 'none',
          overscrollBehavior: 'none'
        }}
      />
      
      <TourStepImproved
        step={currentStepData}
        currentStepIndex={currentStep}
        totalSteps={totalSteps}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={endTour}
        onClose={endTour}
      />
    </div>
  );
};
