import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Button } from '../ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface TourStepProps {
  step: {
    target: string;
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right';
  };
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
}

interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPosition {
  top: number;
  left: number;
  transform: string;
}

// デバウンス用のユーティリティ関数
const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const TourStepImproved: React.FC<TourStepProps> = ({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onClose,
}) => {
  const [targetPosition, setTargetPosition] = useState<Position | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ 
    top: 0, 
    left: 0, 
    transform: 'none' 
  });
  const [actualPosition, setActualPosition] = useState(step.position);
  const [error, setError] = useState<string | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevStepRef = useRef<number | null>(null); // 前のステップを記録

  // ターゲット要素の検索（リトライ機能付き）
  const findTargetElement = useCallback(
    (selector: string, retries = 3): Promise<Element | null> => {
      return new Promise((resolve) => {
        const attempt = (remaining: number) => {
          try {
            const element = document.querySelector(selector);
            if (element || remaining === 0) {
              resolve(element);
            } else {
              retryTimeoutRef.current = setTimeout(() => attempt(remaining - 1), 200);
            }
          } catch (err) {
            console.error(`ターゲット要素の検索エラー: ${selector}`, err);
            resolve(null);
          }
        };
        attempt(retries);
      });
    },
    []
  );

  // 位置計算の最適化（重複回避機能付き）
  const calculateTooltipPosition = useCallback((
    targetPos: Position,
    preferredPosition: 'top' | 'bottom' | 'left' | 'right',
    tooltipWidth = 320,
    tooltipHeight = 200,
    margin = 20
  ) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let tooltipTop = targetPos.top;
    let tooltipLeft = targetPos.left;
    let finalPosition: 'top' | 'bottom' | 'left' | 'right' = preferredPosition;
    let transform = 'none';

    // 重複回避のためのマージン調整
    const adjustedMargin = margin + 10; // 重複を避けるために余分なマージンを追加

    // 位置計算ロジック
    switch (preferredPosition) {
      case 'top':
        tooltipTop = targetPos.top - tooltipHeight - adjustedMargin;
        tooltipLeft = targetPos.left + targetPos.width / 2;
        transform = 'translateX(-50%)';
        // より厳密な境界チェック
        if (tooltipTop < scrollTop + 10) {
          finalPosition = 'bottom';
          tooltipTop = targetPos.top + targetPos.height + adjustedMargin;
        }
        break;
      case 'bottom':
        tooltipTop = targetPos.top + targetPos.height + adjustedMargin;
        tooltipLeft = targetPos.left + targetPos.width / 2;
        transform = 'translateX(-50%)';
        if (tooltipTop + tooltipHeight > scrollTop + viewportHeight - 10) {
          finalPosition = 'top';
          tooltipTop = targetPos.top - tooltipHeight - adjustedMargin;
        }
        break;
      case 'left':
        tooltipTop = targetPos.top + targetPos.height / 2;
        tooltipLeft = targetPos.left - tooltipWidth - adjustedMargin;
        transform = 'translateY(-50%)';
        if (tooltipLeft < scrollLeft + 10) {
          finalPosition = 'right';
          tooltipLeft = targetPos.left + targetPos.width + adjustedMargin;
        }
        break;
      case 'right':
        tooltipTop = targetPos.top + targetPos.height / 2;
        tooltipLeft = targetPos.left + targetPos.width + adjustedMargin;
        transform = 'translateY(-50%)';
        if (tooltipLeft + tooltipWidth > scrollLeft + viewportWidth - 10) {
          finalPosition = 'left';
          tooltipLeft = targetPos.left - tooltipWidth - adjustedMargin;
        }
        break;
    }

    // ビューポート境界チェック
    if (finalPosition === 'top' || finalPosition === 'bottom') {
      const halfWidth = tooltipWidth / 2;
      if (tooltipLeft - halfWidth < scrollLeft + margin) {
        tooltipLeft = scrollLeft + margin + halfWidth;
      } else if (tooltipLeft + halfWidth > scrollLeft + viewportWidth - margin) {
        tooltipLeft = scrollLeft + viewportWidth - margin - halfWidth;
      }
    }

    if (finalPosition === 'left' || finalPosition === 'right') {
      const halfHeight = tooltipHeight / 2;
      if (tooltipTop - halfHeight < scrollTop + margin) {
        tooltipTop = scrollTop + margin + halfHeight;
      } else if (tooltipTop + halfHeight > scrollTop + viewportHeight - margin) {
        tooltipTop = scrollTop + viewportHeight - margin - halfHeight;
      }
    }

    return {
      position: { top: tooltipTop, left: tooltipLeft, transform },
      finalPosition
    };
  }, []);

  // 矢印スタイル生成の最適化
  const arrowStyles = useMemo(() => {
    if (!targetPosition) return {};
    
    const arrowSize = 8;
    const targetCenterX = targetPosition.left + targetPosition.width / 2;
    const targetCenterY = targetPosition.top + targetPosition.height / 2;
    
    const baseStyle = {
      position: 'absolute' as const,
      width: 0,
      height: 0,
    };

    switch (actualPosition) {
      case 'top':
        return {
          ...baseStyle,
          top: tooltipPosition.top + 200 - arrowSize,
          left: targetCenterX - arrowSize,
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderTop: `${arrowSize}px solid rgb(15 23 42)`,
        };
      case 'bottom':
        return {
          ...baseStyle,
          top: tooltipPosition.top - arrowSize,
          left: targetCenterX - arrowSize,
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid rgb(15 23 42)`,
        };
      case 'left':
        return {
          ...baseStyle,
          top: targetCenterY - arrowSize,
          left: tooltipPosition.left + 320 - arrowSize,
          borderTop: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid transparent`,
          borderLeft: `${arrowSize}px solid rgb(15 23 42)`,
        };
      case 'right':
        return {
          ...baseStyle,
          top: targetCenterY - arrowSize,
          left: tooltipPosition.left - arrowSize,
          borderTop: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid rgb(15 23 42)`,
        };
      default:
        return {};
    }
  }, [targetPosition, tooltipPosition, actualPosition]);

  // 位置更新関数の最適化（自動スクロール制御付き）
  const updatePosition = useCallback(async (allowAutoScroll = false) => {
    try {
      setError(null);
      const targetElement = await findTargetElement(step.target);
      
      if (!targetElement) {
        setError(`ターゲット要素が見つかりません: ${step.target}`);
        console.warn(`Tour target not found: ${step.target}`);
        return;
      }

      const rect = targetElement.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(targetElement);
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      // マージンとパディングを考慮した正確な位置計算
      const marginTop = parseInt(computedStyle.marginTop) || 0;
      const marginLeft = parseInt(computedStyle.marginLeft) || 0;
      const marginRight = parseInt(computedStyle.marginRight) || 0;
      const marginBottom = parseInt(computedStyle.marginBottom) || 0;
      
      const position = {
        top: rect.top + scrollTop - marginTop,
        left: rect.left + scrollLeft - marginLeft,
        width: rect.width + marginLeft + marginRight,
        height: rect.height + marginTop + marginBottom,
      };
      
      setTargetPosition(position);
      
      const { position: tooltipPos, finalPosition } = calculateTooltipPosition(
        position,
        step.position
      );
      
      setTooltipPosition(tooltipPos);
      setActualPosition(finalPosition as 'top' | 'bottom' | 'left' | 'right');

      // 自動スクロールの制御（許可されている場合のみ実行）
      if (allowAutoScroll) {
        const elementRect = targetElement.getBoundingClientRect();
        const isElementVisible = elementRect.top >= 50 && 
                                elementRect.bottom <= window.innerHeight - 50 &&
                                elementRect.left >= 0 && 
                                elementRect.right <= window.innerWidth;
        
        // より厳しい条件で自動スクロールを実行
        if (!isElementVisible) {
          const scrollOptions: ScrollIntoViewOptions = {
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          };
          
          targetElement.scrollIntoView(scrollOptions);
          
          // スクロール完了後に位置を再計算（自動スクロールは無効化）
          setTimeout(() => {
            updatePosition(false);
          }, 600);
        }
      }
    } catch (err) {
      console.error('位置更新エラー:', err);
      setError('位置の計算中にエラーが発生しました');
    }
  }, [step.target, step.position, findTargetElement, calculateTooltipPosition]);

  // デバウンスされたイベントハンドラー（自動スクロール無効）
  const debouncedUpdatePosition = useMemo(
    () => debounce(() => updatePosition(false), 100),
    [updatePosition]
  );

  // キーボードイベントハンドラー
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        onNext();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (currentStepIndex > 0) {
          onPrev();
        }
        break;
    }
  }, [onNext, onPrev, onClose, currentStepIndex]);

  useEffect(() => {
    // 初回および手動ステップ移動時のみ自動スクロールを実行
    const isFirstLoad = prevStepRef.current !== currentStepIndex;
    updatePosition(isFirstLoad);
    prevStepRef.current = currentStepIndex;
    
    // イベントリスナーの最適化
    window.addEventListener('resize', debouncedUpdatePosition);
    window.addEventListener('scroll', debouncedUpdatePosition);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('resize', debouncedUpdatePosition);
      window.removeEventListener('scroll', debouncedUpdatePosition);
      document.removeEventListener('keydown', handleKeyDown);
      
      // クリーンアップ
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [updatePosition, debouncedUpdatePosition, handleKeyDown, currentStepIndex]);

  // エラー状態の表示
  if (error) {
    return (
      <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg z-[9999]">
        <div className="flex items-center justify-between">
          <span>ツアーエラー: {error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-red-600 ml-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (!targetPosition) {
    return null;
  }

  return (
    <>
      {/* ハイライトオーバーレイ */}
      <div
        className="fixed border-4 border-blue-400 bg-blue-400/10 rounded-lg pointer-events-none z-[100] shadow-2xl transition-all duration-200"
        style={{
          top: targetPosition.top - 4,
          left: targetPosition.left - 4,
          width: targetPosition.width + 8,
          height: targetPosition.height + 8,
          boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.5)',
        }}
      />
      
      {/* 矢印 */}
      <div
        className="fixed pointer-events-none z-[90]"
        style={arrowStyles}
      />

      {/* ツールチップ */}
      <div
        className="fixed bg-slate-900 text-white p-6 rounded-lg shadow-xl max-w-sm z-[90] transition-all duration-200"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: tooltipPosition.transform,
          pointerEvents: 'all',
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="tour-title"
        aria-describedby="tour-content"
        aria-live="polite"
      >
        <div className="flex items-start justify-between mb-3">
          <h3 id="tour-title" className="text-lg font-semibold text-white pr-2">
            {step.title}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-slate-800 p-1 h-auto"
            aria-label="ツアーを閉じる"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p id="tour-content" className="text-slate-200 mb-4 leading-relaxed">
          {step.content}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400" aria-label={`ステップ ${currentStepIndex + 1} / ${totalSteps}`}>
            {currentStepIndex + 1} / {totalSteps}
          </span>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSkip}
              className="text-slate-900 border-slate-600 hover:bg-slate-100"
            >
              スキップ
            </Button>
            
            {currentStepIndex > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
                className="text-slate-900 border-slate-600 hover:bg-slate-100"
                aria-label="前のステップ"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                戻る
              </Button>
            )}
            
            <Button
              size="sm"
              onClick={onNext}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              aria-label={currentStepIndex === totalSteps - 1 ? 'ツアーを完了' : '次のステップ'}
            >
              {currentStepIndex === totalSteps - 1 ? (
                '完了'
              ) : (
                <>
                  次へ
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
