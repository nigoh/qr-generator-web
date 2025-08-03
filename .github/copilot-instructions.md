<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->


# Copilot Instructions — React + Vite + Tailwind v4

> あなたはこのリポジトリ専属のコーディングアシスタントです。
> **保守性** / **関心の分離** / **一貫性** を最優先し、ここに書かれたルール・出力形式・例に厳密に従ってください。

## 0. プロジェクト前提

* **Stack**: React 18+, TypeScript, Vite, Tailwind CSS v4
* **目標**: コンポーネントは「見た目」、フックは「振る舞い」、サービスは「外部I/O」を担当し、**層をまたがない**。
* **既定の出力**: 必ず TypeScript。JS は提案しない。

---

## 1. 原則（SoCのための非交渉ルール）

1. **UI とロジックを分離**

   * UI = Presentational Components（props駆動・副作用なし）
   * ロジック = Custom Hooks（副作用・状態・データ取得）
2. **サーバ状態とローカル状態の分離**

   * サーバ状態（API由来）はサービス層 + Hook（例：`useAgenda()`）で扱う。
   * ローカルUI状態はコンポーネント内（`useState`/`useReducer`）。
3. **副作用は Hook のみ**

   * `useEffect` 等は必ず `src/**/hooks/` に隔離。UI層に書かない。
4. **I/O はサービス層のみ**

   * `fetch`/`storage`/`worker`/`idb` などは `services/` へ。UIやHook直下に直書きしない。
5. **型は公共財**

   * 共有型は `types.ts` に集約。APIスキーマは型安全（`zod` など）で検証可能に。
6. **Tailwind の乱用禁止**

   * 長大クラス列は `cva`（variants）や小さな UI コンポーネントへ抽出。`@apply` は最小限。
7. **テスト同時生成**

   * 新規ロジックには Vitest + Testing Library の最小テストを同一PRで追加。
8. **アクセシビリティはデフォルトON**

   * ラベル/ロール/キーボード操作/フォーカスリングは必須。

---

## 2. 推奨ディレクトリ構成（機能単位の共同体）

```
src/
  app/                # ルート, Provider, ルーティング
  pages/              # ページコンテナ（データ取得を呼び出す層）
  features/
    agenda-timer/
      components/     # 見た目専用（無副作用）
      hooks/          # useXxx（副作用/状態/計時ロジック）
      services/       # 外部I/O(API, storage, worker)
      types.ts
      index.ts        # public API（外部公開エントリ）
  shared/
    components/       # 再利用UI（Button, Modal等）
    hooks/            # 横断的ロジック（useToggle等）
    lib/              # ユーティリティ（cn, cvaラッパ等）
    styles/           # グローバルCSS, Tailwindエントリ
```

**生成物の境界**

* ページ: ルーティングと機能の組立てのみ。重いロジックは呼び出しに留める。
* Feature: `components/` は props 駆動、`hooks/` はロジック、`services/` はI/O。

---

## 3. コーディング規約（抜粋）

* **命名**: ファイルは `kebab-case.tsx`、Hookは `useXxx.ts`、型は `PascalCase`。
* **imports**: 絶対パス alias（例：`@/shared/lib/cn`）を優先。
* **UI**: `className` は `cn()` で結合。Variantsは `cva` を使用。
* **エラー**: サービス層で `try/catch` → 失敗時はエラー型で返し、UIで通知。
* **コメント**: なぜ必要か（Why）を1行で。何をしたか（What）はコードで表現。

---

## 4. Tailwind v4 の使用方針

* **主義**: “意味のある小さな再利用” を重視。ページ直書きで**冗長なクラス列**を作らない。
* **variants**: サイズ/色/状態などの分岐は `cva` で宣言し、UIから渡す。
* **トークン**: 任意色の直書きより、テーマトークン（`--color-*` 等）/既存スケールを優先。
* **レイアウト**: `grid`/`flex` は小さなコンポーネント単位で閉じる（後方互換性が高い）。

---

## 5. 状態管理の約束

* ローカルUI: `useState` / `useReducer`
* 非同期・副作用: **必ず** Custom Hook（`hooks/`）で包む
* フォーム: `react-hook-form` 推奨（必要時）。UIはプレゼンテーションに徹する。

---

## 6. サービス層（API / Clock / Storage）

* `services/clock.ts` などで **時間**・**乱数**・**I/O** を抽象化（テスト容易性のため）。
* 例:

  ```ts
  // src/features/agenda-timer/services/clock.ts
  export interface Clock { now(): number }
  export const systemClock: Clock = { now: () => Date.now() }
  ```

---

## 7. アクセシビリティ（必ず満たす）

* 全フォーム要素に関連ラベル。
* クリック可能要素は `button`/`a` を使用（div禁止）。
* キーボード操作（Tab/Enter/Space）で完結。
* フォーカス可視、`aria-live` でフィードバック。

---

## 8. テスト

* **単体**: Hook のロジック（境界条件・タイマ刻み・誤差吸収）
* **UI**: スナップショットより、役割/テキスト/操作のテストを優先
* **例**: `src/features/agenda-timer/hooks/useAgendaTimer.test.ts`

---

## 9. コミット/PR

* **Conventional Commits**（`feat:`, `fix:`, `refactor:`…）
* PR には**動機/設計/スクショ/テスト結果**を簡潔に。
* 自動生成されたファイル一覧を明記（どの層に何を追加したか）。

---

## 10. 生成時の出力フォーマット（厳守）

* **見出し**「Changed files」→ 箇条書きでパスを列挙
* 各ファイルは **1つずつ** 「`tsx」や「`ts」で囲んで全文出力（差分ではなく**完成品**）
* 最後に「How to test」手順を記載

**例**:

````
### Changed files
- src/features/agenda-timer/components/AgendaProgress.tsx
- src/features/agenda-timer/hooks/useAgendaTimer.ts
- src/features/agenda-timer/services/clock.ts
- src/features/agenda-timer/types.ts
- src/shared/lib/cn.ts
- src/shared/lib/cva.ts

```tsx
// <file path here>
// <full content>
````

...

### How to test

1. ...

````

---

## 11. プロンプト・レシピ（要求の書き方）
- **新規機能（Feature）**  
  「`features/<name>` に **components/hooks/services/types** を作成。UIはprops駆動、ロジックはHook、I/Oはサービス層。上記フォーマットで**完成ファイル**を出力。テストも追加。」
- **UIコンポーネント**  
  「`shared/components` に再利用可能 Button を作成。`cva`で`variant/size`を定義し、`className`は`cn`で結合。A11yとテストを含める。」
- **Hook**  
  「`hooks/` に `useXxx` を作成。副作用はここに隔離。エッジケースのテスト込みで。」

---

## 12. サンプル（アジェンダ・タイマー機能）
**要求**: 「会議アジェンダごとに目標時間と経過率を表示。100%超過時は明示。ページは組立てのみ。」

**期待する出力（骨子）**
- `features/agenda-timer/types.ts`
  ```ts
  export type Agenda = { id: string; title: string; targetMs: number }
  export type AgendaProgress = { id: string; elapsedMs: number; ratio: number } // 0.0 ~ 1.0+
````

* `features/agenda-timer/services/clock.ts`（上記のとおり）
* `features/agenda-timer/hooks/useAgendaTimer.ts`

  ```ts
  import { useEffect, useRef, useState } from "react"
  import type { Agenda, AgendaProgress } from "../types"
  import type { Clock } from "../services/clock"

  export function useAgendaTimer(agendas: Agenda[], clock: Clock) {
    const [runningId, setRunningId] = useState<string | null>(null)
    const [progress, setProgress] = useState<Record<string, AgendaProgress>>({})
    const tickRef = useRef<number | null>(null)

    useEffect(() => {
      if (!runningId) return
      const start = clock.now()
      const loop = () => {
        const now = clock.now()
        setProgress(p => {
          const agenda = agendas.find(a => a.id === runningId)!
          const prev = p[runningId!]?.elapsedMs ?? 0
          const elapsedMs = prev + (now - start)
          const ratio = agenda.targetMs === 0 ? 1 : elapsedMs / agenda.targetMs
          return { ...p, [runningId!]: { id: runningId!, elapsedMs, ratio } }
        })
        tickRef.current = requestAnimationFrame(loop)
      }
      tickRef.current = requestAnimationFrame(loop)
      return () => { if (tickRef.current) cancelAnimationFrame(tickRef.current) }
    }, [runningId, agendas, clock])

    return {
      runningId,
      progress,
      start: (id: string) => setRunningId(id),
      stop: () => setRunningId(null),
      reset: (id: string) =>
        setProgress(p => ({ ...p, [id]: { id, elapsedMs: 0, ratio: 0 } })),
    }
  }
  ```
* `features/agenda-timer/components/AgendaProgress.tsx`

  ```tsx
  import { cn } from "@/shared/lib/cn"

  export function AgendaProgress({
    title, ratio,
  }: { title: string; ratio: number }) {
    const pct = Math.floor(ratio * 100)
    const over = ratio > 1
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-medium">{title}</span>
          <span className={cn("tabular-nums", over && "text-red-600")}>
            {pct}%
          </span>
        </div>
        <div className="h-2 w-full rounded bg-gray-200">
          <div
            className={cn("h-2 rounded bg-blue-600", over && "bg-red-600")}
            style={{ width: `${Math.min(pct, 100)}%` }}
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
          />
        </div>
      </div>
    )
  }
  ```

---

## 13. 禁止事項

* UI コンポーネント内での `fetch` / `localStorage` / 時刻参照
* 1ファイルに複数責務（例：表示 + 取得 + 計時）
* 無根拠の依存追加（提案はOK、導入は明示依頼時のみ）
* テスト・A11y・How to test の省略

---

## 14. 応答テンプレート（コピペして使う）

````
### Changed files
- <path1>
- <path2>
...

```tsx
// <path1>
// <full content>
````

```ts
// <path2>
// <full content>
```

### How to test

1. install
2. run
3. verify

```

---

以上。  
「この構成で ‘アジェンダ・タイマー’ を実装して」と依頼すれば、Copilot は **components / hooks / services / types** に分離して、テストと How to test まで出力するはずです。  
必要なら、あなたのプロジェクト流儀（命名・エイリアス・テスト方針）に合わせて微調整します。
```
