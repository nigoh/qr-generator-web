import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { X, ChevronLeft, ChevronRight, Monitor, Smartphone } from 'lucide-react';

// Badge コンポーネント（Badgeが存在しない場合の代替）
const Badge: React.FC<{ children: React.ReactNode; variant?: 'secondary' | 'outline'; className?: string }> = ({ 
  children, 
  variant = 'secondary',
  className = '' 
}) => {
  const baseStyles = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
  const variantStyles = {
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700'
  };
  
  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

interface ComponentTourStepProps {
  step: {
    id: string;
    title: string;
    content: string;
    component: React.ReactNode;
    tips?: string[];
    features?: string[];
  };
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export const ComponentTourStep: React.FC<ComponentTourStepProps> = ({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  onClose,
}) => {
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="max-w-6xl w-full max-h-[90vh] overflow-auto bg-white rounded-xl shadow-2xl">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs">
              ステップ {currentStepIndex + 1} / {totalSteps}
            </Badge>
            <h2 className="text-xl font-semibold text-gray-900">
              {step.title}
            </h2>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="ツアーを閉じる"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* 説明セクション */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg text-blue-600">
                このステップについて
              </CardTitle>
              <CardDescription className="text-base">
                {step.content}
              </CardDescription>
            </CardHeader>
            
            {(step.tips || step.features) && (
              <CardContent className="pt-0">
                {step.tips && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">💡 ポイント</h4>
                    <ul className="space-y-1">
                      {step.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {step.features && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">⭐ 主な機能</h4>
                    <div className="flex flex-wrap gap-2">
                      {step.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* コンポーネント表示エリア */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-lg">実際のコンポーネント</CardTitle>
              </div>
              <CardDescription>
                実際に使用するコンポーネントを触って体験してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-gray-50">
                {step.component}
              </div>
              
              {/* 注意書き */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <Smartphone className="h-4 w-4 inline mr-1" />
                  これは実際に動作するコンポーネントです。自由に操作して機能を確認してください。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* フッター */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onSkip}
            className="text-gray-600"
          >
            スキップ
          </Button>
          
          <div className="flex gap-3">
            {!isFirstStep && (
              <Button
                variant="outline"
                onClick={onPrev}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                前のステップ
              </Button>
            )}
            
            <Button
              onClick={onNext}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {isLastStep ? (
                '完了'
              ) : (
                <>
                  次のステップ
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
