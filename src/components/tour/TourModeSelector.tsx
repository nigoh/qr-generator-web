import React from 'react';
import { Button } from '../ui/button';
import { useTourStore } from '../../store/tourStore';

export const TourModeSelector: React.FC = () => {
  const { startTour } = useTourStore();

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900">ツアー形式を選択</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 従来のツアー */}
        <Button
          onClick={startTour}
          variant="outline"
          className="h-auto p-4 flex flex-col items-start space-y-2 border-2 hover:border-blue-300"
        >
          <div className="font-medium text-left">📍 画面ガイドツアー</div>
          <div className="text-sm text-gray-600 text-left">
            実際の画面上でリアルタイムに説明します
          </div>
        </Button>

        {/* 新しいコンポーネントツアー */}
        <Button
          onClick={() => {
            // ComponentTourを開始するロジック
            // TODO: ComponentTour用のstoreまたは状態管理を追加
            console.log('コンポーネントツアーを開始');
          }}
          variant="outline"
          className="h-auto p-4 flex flex-col items-start space-y-2 border-2 hover:border-green-300"
        >
          <div className="font-medium text-left">🧩 コンポーネント体験ツアー</div>
          <div className="text-sm text-gray-600 text-left">
            独立したコンポーネントで詳しく体験できます
          </div>
        </Button>
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        💡 コンポーネント体験ツアーは画面サイズに影響されず、より詳細な説明を提供します
      </div>
    </div>
  );
};
