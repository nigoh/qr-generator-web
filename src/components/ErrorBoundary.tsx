import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * アプリ全体を保護するエラーバウンダリ。
 * レンダリング中に予期せぬ例外が発生しても白画面にせず、
 * 再読み込み導線つきのフォールバック UI を表示する。
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 開発時のデバッグ用。本番では監視サービスへ送る差し込み口になる。
    console.error('Unhandled UI error:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center"
      >
        <h1 className="text-xl font-semibold text-gray-900">
          予期しないエラーが発生しました
        </h1>
        <p className="max-w-md text-sm text-gray-600">
          お手数ですが、ページを再読み込みしてください。
          問題が続く場合は、入力内容を変えてお試しください。
        </p>
        <button
          type="button"
          onClick={this.handleReload}
          className="min-h-[44px] rounded-md bg-gray-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          ページを再読み込み
        </button>
      </div>
    );
  }
}
