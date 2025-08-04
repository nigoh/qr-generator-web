import React, { useEffect, useState, useCallback, useMemo } from 'react';
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

export const TourStepComponent: React.FC<TourStepProps> = ({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onClose,
}) => {
  const [targetPosition, setTargetPosition] = useState<Position | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [actualPosition, setActualPosition] = useState(step.position);

  useEffect(() => {
    const updatePosition = () => {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        const position = {
          top: rect.top + scrollTop,
          left: rect.left + scrollLeft,
          width: rect.width,
          height: rect.height,
        };
        
        setTargetPosition(position);
        
        // Calculate tooltip position with viewport boundary checks
        const tooltipWidth = 320; // max-w-sm = 384px, but accounting for padding
        const tooltipHeight = 200; // estimated height
        const margin = 20;
        
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let tooltipTop = position.top;
        let tooltipLeft = position.left;
        let finalPosition = step.position;
        
        // Check if preferred position fits in viewport
        switch (step.position) {
          case 'top':
            tooltipTop = position.top - tooltipHeight - margin;
            tooltipLeft = position.left + position.width / 2;
            // Check if it goes above viewport
            if (tooltipTop < scrollTop) {
              finalPosition = 'bottom';
              tooltipTop = position.top + position.height + margin;
            }
            break;
          case 'bottom':
            tooltipTop = position.top + position.height + margin;
            tooltipLeft = position.left + position.width / 2;
            // Check if it goes below viewport
            if (tooltipTop + tooltipHeight > scrollTop + viewportHeight) {
              finalPosition = 'top';
              tooltipTop = position.top - tooltipHeight - margin;
            }
            break;
          case 'left':
            tooltipTop = position.top + position.height / 2;
            tooltipLeft = position.left - tooltipWidth - margin;
            // Check if it goes left of viewport or is too close to left edge
            if (tooltipLeft < scrollLeft + margin) {
              finalPosition = 'right';
              tooltipLeft = position.left + position.width + margin;
            }
            break;
          case 'right':
            tooltipTop = position.top + position.height / 2;
            tooltipLeft = position.left + position.width + margin;
            // Check if it goes right of viewport
            if (tooltipLeft + tooltipWidth > scrollLeft + viewportWidth) {
              finalPosition = 'left';
              tooltipLeft = position.left - tooltipWidth - margin;
            }
            break;
        }
        
        // Ensure horizontal positioning stays within viewport bounds
        if (finalPosition === 'top' || finalPosition === 'bottom') {
          const halfWidth = tooltipWidth / 2;
          if (tooltipLeft - halfWidth < scrollLeft + margin) {
            tooltipLeft = scrollLeft + margin + halfWidth;
          } else if (tooltipLeft + halfWidth > scrollLeft + viewportWidth - margin) {
            tooltipLeft = scrollLeft + viewportWidth - margin - halfWidth;
          }
        }
        
        // Ensure vertical positioning stays within viewport bounds
        if (finalPosition === 'left' || finalPosition === 'right') {
          const halfHeight = tooltipHeight / 2;
          if (tooltipTop - halfHeight < scrollTop + margin) {
            tooltipTop = scrollTop + margin + halfHeight;
          } else if (tooltipTop + halfHeight > scrollTop + viewportHeight - margin) {
            tooltipTop = scrollTop + viewportHeight - margin - halfHeight;
          }
        }
        
        setTooltipPosition({ top: tooltipTop, left: tooltipLeft });
        setActualPosition(finalPosition);

        // Auto-scroll to ensure target is visible
        const elementRect = targetElement.getBoundingClientRect();
        const isElementVisible = elementRect.top >= 0 && 
                                elementRect.bottom <= window.innerHeight &&
                                elementRect.left >= 0 && 
                                elementRect.right <= window.innerWidth;
        
        if (!isElementVisible) {
          targetElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
          });
          
          // Re-calculate positions after scroll
          setTimeout(() => {
            updatePosition();
          }, 500);
        }
      }
    };

    updatePosition();
    
    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [step]);

  // Generate arrow styles based on actual position
  const getArrowStyles = () => {
    if (!targetPosition) return {};
    
    const arrowSize = 8;
    const targetCenterX = targetPosition.left + targetPosition.width / 2;
    const targetCenterY = targetPosition.top + targetPosition.height / 2;
    
    switch (actualPosition) {
      case 'top':
        return {
          top: tooltipPosition.top + 200 - arrowSize, // At bottom of tooltip
          left: targetCenterX - arrowSize,
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderTop: `${arrowSize}px solid rgb(15 23 42)`, // slate-900
        };
      case 'bottom':
        return {
          top: tooltipPosition.top - arrowSize, // At top of tooltip
          left: targetCenterX - arrowSize,
          borderLeft: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid rgb(15 23 42)`, // slate-900
        };
      case 'left':
        return {
          top: targetCenterY - arrowSize,
          left: tooltipPosition.left + 320 - arrowSize, // At right of tooltip
          borderTop: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid transparent`,
          borderLeft: `${arrowSize}px solid rgb(15 23 42)`, // slate-900
        };
      case 'right':
        return {
          top: targetCenterY - arrowSize,
          left: tooltipPosition.left - arrowSize, // At left of tooltip
          borderTop: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid rgb(15 23 42)`, // slate-900
        };
      default:
        return {};
    }
  };

  if (!targetPosition) {
    return null;
  }

  return (
    <>
      {/* Highlight overlay with better visibility */}
      <div
        className="fixed border-4 border-blue-400 bg-blue-400/10 rounded-lg pointer-events-none z-[100] shadow-2xl"
        style={{
          top: targetPosition.top - 6,
          left: targetPosition.left - 6,
          width: targetPosition.width + 12,
          height: targetPosition.height + 12,
          boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.5)',
        }}
      />
      
      {/* Arrow */}
      <div
        className="fixed pointer-events-none z-[90]"
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          ...getArrowStyles(),
        }}
      />

      {/* Tooltip with improved interaction blocking */}
      <div
        className="fixed bg-slate-900 text-white p-6 rounded-lg shadow-xl max-w-sm z-[90]"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: actualPosition === 'left' || actualPosition === 'right' 
            ? 'translateY(-50%)' 
            : actualPosition === 'top' || actualPosition === 'bottom'
            ? 'translateX(-50%)'
            : 'none',
          pointerEvents: 'all', // Allow interaction with tooltip
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-white pr-2">{step.title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-slate-800 p-1 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-slate-200 mb-4 leading-relaxed">{step.content}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
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
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                戻る
              </Button>
            )}
            
            <Button
              size="sm"
              onClick={onNext}
              className="bg-blue-600 hover:bg-blue-700 text-white"
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
