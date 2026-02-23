import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  /** 最大高さ (デフォルト: 90vh) */
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onOpenChange,
  title,
  children,
  maxHeight = '90vh',
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // open 変化に合わせて可視状態を制御（アンマウントを遅延）
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setDragOffsetY(0);
    }
  }, [open]);

  const handleBackdropClick = () => onOpenChange(false);

  // ドラッグジェスチャー
  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStartY(e.touches[0].clientY);
    setDragOffsetY(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY === null) return;
    const delta = e.touches[0].clientY - dragStartY;
    if (delta > 0) {
      setDragOffsetY(delta);
    }
  };

  const handleTouchEnd = () => {
    if (dragOffsetY > 80) {
      onOpenChange(false);
    }
    setDragOffsetY(0);
    setDragStartY(null);
  };

  const handleTransitionEnd = () => {
    if (!open) setIsVisible(false);
  };

  // フォーカスロック: シートが開いている間 backdrop の先へ Tab を逃がさない
  useEffect(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    if (!sheet) return;

    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(
      sheet.querySelectorAll<HTMLElement>(focusableSelectors)
    );

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
        return;
      }
      if (e.key !== 'Tab' || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // 最初のフォーカス可能要素にフォーカス
    focusables[0]?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!isVisible && !open) return null;

  return (
    <>
      {/* バックドロップ */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        aria-hidden="true"
        onClick={handleBackdropClick}
      />

      {/* シート本体 */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'QRコード設定'}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 flex flex-col',
          'bg-white rounded-t-2xl shadow-2xl',
          'transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{
          maxHeight,
          transform: open
            ? `translateY(${dragOffsetY}px)`
            : 'translateY(100%)',
          transition: dragStartY !== null ? 'none' : undefined,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTransitionEnd={handleTransitionEnd}
      >
        {/* ドラッグハンドル */}
        <div className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1 rounded-full bg-gray-300" aria-hidden="true" />
        </div>

        {/* タイトル */}
        {title && (
          <div className="px-5 py-3 border-b border-gray-100 shrink-0">
            <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          </div>
        )}

        {/* スクロール可能コンテンツ */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </>
  );
};
