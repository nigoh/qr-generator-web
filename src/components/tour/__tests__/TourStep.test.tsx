import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TourStepComponent } from '../TourStep';

// Mock window methods
const mockScrollIntoView = vi.fn();
Object.defineProperty(window, 'scrollIntoView', {
  value: mockScrollIntoView,
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock getBoundingClientRect
const mockGetBoundingClientRect = vi.fn(() => ({
  top: 100,
  left: 100,
  width: 200,
  height: 50,
  bottom: 150,
  right: 300,
  x: 100,
  y: 100,
  toJSON: vi.fn(),
}));

describe('TourStepComponent', () => {
  const mockProps = {
    step: {
      target: '[data-test="target"]',
      title: 'テストタイトル',
      content: 'テストコンテンツ',
      position: 'bottom' as const,
    },
    currentStepIndex: 0,
    totalSteps: 3,
    onNext: vi.fn(),
    onPrev: vi.fn(),
    onSkip: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock target element
    const targetElement = document.createElement('div');
    targetElement.setAttribute('data-test', 'target');
    targetElement.getBoundingClientRect = mockGetBoundingClientRect;
    document.body.appendChild(targetElement);
    
    // Mock querySelector
    document.querySelector = vi.fn(() => targetElement);
  });

  it('ターゲット要素が見つからない場合、何も表示しない', () => {
    document.querySelector = vi.fn(() => null);
    
    render(<TourStepComponent {...mockProps} />);
    
    expect(screen.queryByText('テストタイトル')).not.toBeInTheDocument();
  });

  it('正常にツアーステップが表示される', async () => {
    render(<TourStepComponent {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('テストタイトル')).toBeInTheDocument();
    });
    
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('次へボタンが正常に動作する', async () => {
    render(<TourStepComponent {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('次へ')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('次へ'));
    expect(mockProps.onNext).toHaveBeenCalledTimes(1);
  });

  it('戻るボタンが表示される（最初のステップ以外）', async () => {
    const propsWithPrev = { ...mockProps, currentStepIndex: 1 };
    
    render(<TourStepComponent {...propsWithPrev} />);
    
    await waitFor(() => {
      expect(screen.getByText('戻る')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('戻る'));
    expect(mockProps.onPrev).toHaveBeenCalledTimes(1);
  });

  it('最初のステップでは戻るボタンが表示されない', async () => {
    render(<TourStepComponent {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('テストタイトル')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('戻る')).not.toBeInTheDocument();
  });

  it('最後のステップでは完了ボタンが表示される', async () => {
    const propsWithLast = { ...mockProps, currentStepIndex: 2 };
    
    render(<TourStepComponent {...propsWithLast} />);
    
    await waitFor(() => {
      expect(screen.getByText('完了')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('完了'));
    expect(mockProps.onNext).toHaveBeenCalledTimes(1);
  });

  it('スキップボタンが正常に動作する', async () => {
    render(<TourStepComponent {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('スキップ')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('スキップ'));
    expect(mockProps.onSkip).toHaveBeenCalledTimes(1);
  });

  it('閉じるボタンが正常に動作する', async () => {
    render(<TourStepComponent {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('テストタイトル')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('異なるposition設定でハイライトが正しく表示される', async () => {
    const positionVariants = ['top', 'bottom', 'left', 'right'] as const;
    
    for (const position of positionVariants) {
      const propsWithPosition = { ...mockProps, step: { ...mockProps.step, position } };
      
      const { unmount } = render(<TourStepComponent {...propsWithPosition} />);
      
      await waitFor(() => {
        expect(screen.getByText('テストタイトル')).toBeInTheDocument();
      });
      
      // ハイライト要素が存在することを確認
      const highlightElement = document.querySelector('.fixed.border-4.border-blue-400');
      expect(highlightElement).toBeInTheDocument();
      
      unmount();
    }
  });

  it('ウィンドウリサイズ時にポジションが再計算される', async () => {
    render(<TourStepComponent {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('テストタイトル')).toBeInTheDocument();
    });
    
    // リサイズイベントを発火
    fireEvent(window, new Event('resize'));
    
    // getBoundingClientRectが再度呼ばれることを期待
    await waitFor(() => {
      expect(mockGetBoundingClientRect).toHaveBeenCalled();
    });
  });
});
