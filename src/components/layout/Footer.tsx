import React from 'react';
import { Code, Smartphone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 text-center sm:text-left">
            © 2024 QRコード生成ツール. Web版
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
            <div className="flex items-center gap-1">
              <Code className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">
                React + TypeScript + Tailwind CSS
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">
                Python版からの完全移行
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
