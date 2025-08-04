# QRコード生成ツール - ツアー機能改善計画

## 📋 現在の実装評価

### ✅ 正常に動作している機能
- **基本的なツアーフロー**: 開始→ステップ遷移→終了が正常に動作
- **ビジュアルハイライト**: ターゲット要素の青いハイライトが適切に表示
- **ツールチップ表示**: ステップタイトル・内容・ナビゲーションボタンが正常表示
- **position調整**: ビューポート境界を考慮した自動位置調整
- **自動アクション**: CollapsibleSectionの展開が適切に実行
- **レスポンシブ対応**: 異なる画面サイズでの適応

### 🎯 テスト結果から見えた強み
1. **直感的なUX**: ユーザーが迷わずツアーを進められる
2. **視覚的誘導**: ハイライトとツールチップで明確な誘導
3. **柔軟性**: 複数のposition設定と自動調整
4. **中断可能**: スキップ機能でユーザーの自由度を確保

## 🔧 改善が必要な領域

### 1. パフォーマンス最適化 🚀
**現在の問題:**
- リサイズ・スクロール時の頻繁な再計算
- 不要なDOM操作

**改善策:**
```typescript
// デバウンス機能付きposition更新
const debouncedUpdatePosition = useMemo(
  () => debounce(updatePosition, 100),
  [updatePosition]
);

// IntersectionObserver による可視性監視
const useVisibilityObserver = (targetRef: RefObject<Element>) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    
    if (targetRef.current) observer.observe(targetRef.current);
    return () => observer.disconnect();
  }, [targetRef]);
  
  return isVisible;
};
```

### 2. アクセシビリティ強化 ♿
**現在の問題:**
- キーボード操作のサポート不足
- スクリーンリーダーへの配慮不足

**改善策:**
```typescript
// キーボードナビゲーション
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowRight':
      case ' ':
        onNext();
        break;
      case 'ArrowLeft':
        onPrev();
        break;
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [onNext, onPrev, onClose]);

// ARIA属性の追加
<div
  role="dialog"
  aria-labelledby="tour-title"
  aria-describedby="tour-content"
  aria-live="polite"
>
```

### 3. エラーハンドリング強化 🛡️
**現在の問題:**
- ターゲット要素が見つからない場合の処理が不十分
- ネットワーク遅延時の考慮不足

**改善策:**
```typescript
// ロバストなターゲット検索
const findTargetElement = useCallback(
  (selector: string, retries = 3): Promise<Element | null> => {
    return new Promise((resolve) => {
      const attempt = (remaining: number) => {
        const element = document.querySelector(selector);
        if (element || remaining === 0) {
          resolve(element);
        } else {
          setTimeout(() => attempt(remaining - 1), 100);
        }
      };
      attempt(retries);
    });
  },
  []
);
```

### 4. カスタマイゼーション機能 🎨
**現在の問題:**
- ハードコードされたスタイル
- テーマ対応不足

**改善策:**
```typescript
interface TourTheme {
  highlight: {
    borderColor: string;
    backgroundColor: string;
    borderWidth: number;
    borderRadius: number;
  };
  tooltip: {
    backgroundColor: string;
    textColor: string;
    borderRadius: number;
    shadow: string;
  };
  arrow: {
    size: number;
    color: string;
  };
}

const useTourTheme = (customTheme?: Partial<TourTheme>) => {
  return useMemo(() => ({
    ...defaultTourTheme,
    ...customTheme,
  }), [customTheme]);
};
```

### 5. 状態管理の改善 📊
**現在の問題:**
- Zustandストアと古いhookの重複
- 状態の一貫性問題

**改善策:**
```typescript
// 統一されたツアー状態管理
interface TourState {
  isActive: boolean;
  currentStep: number;
  isLoading: boolean;
  error: string | null;
  progress: {
    completed: number[];
    skipped: number[];
  };
  settings: {
    autoProgress: boolean;
    showProgress: boolean;
    allowSkip: boolean;
  };
}
```

## 🎯 優先度付き実装ロードマップ

### Phase 1: 緊急修正 (1-2日) 🔥
1. **重複ファイル整理**
   - `useTour.ts` の削除または統合
   - インポート整理

2. **基本的なエラーハンドリング**
   - ターゲット要素未発見時の対処
   - console.errorでのデバッグ情報出力

### Phase 2: パフォーマンス改善 (3-5日) ⚡
1. **デバウンス実装**
   - リサイズ・スクロールイベントの最適化
   - 位置計算の効率化

2. **メモ化の追加**
   - 重い計算処理のメモ化
   - 不要な再レンダリング防止

### Phase 3: アクセシビリティ (1週間) ♿
1. **キーボード操作サポート**
   - 矢印キー・Escape・スペースキーの対応
   - フォーカス管理の改善

2. **スクリーンリーダー対応**
   - ARIA属性の追加
   - aria-live によるコンテンツ変更通知

### Phase 4: 機能拡張 (1-2週間) 🚀
1. **テーマシステム**
   - カスタムカラー対応
   - ダークモード対応

2. **高度な機能**
   - ツアー進行状況の保存
   - 条件分岐ツアー
   - カスタムアニメーション

## 🧪 テスト戦略

### 単体テスト
```typescript
// 優先度の高いテストケース
describe('TourStep エッジケース', () => {
  it('ターゲット要素が動的に生成される場合', async () => {
    // 遅延レンダリングのシミュレーション
  });
  
  it('ビューポートサイズ変更時の位置調整', () => {
    // レスポンシブ対応のテスト
  });
  
  it('ページスクロール時の追従', () => {
    // スクロール対応のテスト
  });
});
```

### 統合テスト
```typescript
describe('ツアー全体フロー', () => {
  it('6ステップ完走', async () => {
    // 全ステップの自動実行テスト
  });
  
  it('途中スキップからの再開', async () => {
    // 状態管理のテスト
  });
});
```

### E2Eテスト
```typescript
// Playwright でのシナリオテスト
test('新規ユーザーのツアー体験', async ({ page }) => {
  // 実際のユーザー行動をシミュレーション
});
```

## 📈 成功指標

### 定量的指標
- **パフォーマンス**: FPS 60維持、メモリ使用量 < 10MB
- **アクセシビリティ**: WCAG 2.1 AA準拠率 100%
- **信頼性**: エラー発生率 < 0.1%

### 定性的指標
- **ユーザビリティ**: 直感的な操作感
- **学習効果**: 機能理解度の向上
- **離脱率**: ツアー完走率 > 80%

## 🛠️ 実装優先順位

1. **🔴 High**: エラーハンドリング、パフォーマンス最適化
2. **🟡 Medium**: アクセシビリティ、テスト追加
3. **🟢 Low**: テーマシステム、高度な機能

この計画に基づき、段階的に改善を進めることで、現在の良好な基盤を保ちながら、より堅牢で使いやすいツアー機能を実現できます。
