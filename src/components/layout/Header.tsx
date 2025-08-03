import React from 'react';
import { QrCode, Github } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                QRコード生成ツール
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                カスタムQRコードを簡単作成
              </p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold text-gray-900">
                QRコード
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-md hover:bg-gray-100"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
