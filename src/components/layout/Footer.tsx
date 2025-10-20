import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 text-center sm:text-left">
            © 2025 QRコード生成ツール · built by{' '}
            <a
              href="https://github.com/nigoh"
              target="_blank"
              rel="noreferrer noopener"
              className="text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline transition-colors"
              aria-label="開発者 nigoh の GitHub プロフィール（新しいタブで開く）"
            >
              nigoh
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/nigoh"
              target="_blank"
              rel="noreferrer noopener"
              className="text-sm text-gray-600 hover:text-gray-900 underline-offset-2 hover:underline transition-colors"
              aria-label="GitHub アカウント（新しいタブで開く）"
              title="github.com/nigoh"
            >
              github.com/nigoh
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
