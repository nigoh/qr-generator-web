import { useCallback, useState } from "react"
import { FeatureContent, FeatureHeader, FeatureLayout } from "@/components/layout"
import type { FeatureHeaderButton } from "@/components/layout"
import {
  DynamicQRConfigForm,
  DynamicQRCreateForm,
  DynamicQRManage,
  DynamicQRResult,
  useDynamicQR,
} from "@/features/dynamic-qr"
import type { DynamicQRConfig } from "@/features/dynamic-qr"

type ActiveTab = "create" | "manage" | "config"

interface DynamicQRPageProps {
  onClose: () => void
}

function loadConfig(): Partial<DynamicQRConfig> {
  try {
    const raw = sessionStorage.getItem("dynamic-qr:config")
    if (!raw) return {}
    return JSON.parse(raw) as Partial<DynamicQRConfig>
  } catch {
    return {}
  }
}

function saveConfig(config: DynamicQRConfig) {
  try {
    sessionStorage.setItem("dynamic-qr:config", JSON.stringify(config))
  } catch {
    // ignore
  }
}

export function DynamicQRPage({ onClose }: DynamicQRPageProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("create")
  const [config, setConfig] = useState<Partial<DynamicQRConfig>>(loadConfig)

  const {
    isLoading,
    error,
    lastCreated,
    currentLink,
    create,
    fetch: fetchLink,
    update,
    disable,
    clearError,
    resetLastCreated,
  } = useDynamicQR(config)

  const handleSaveConfig = useCallback((newConfig: DynamicQRConfig) => {
    setConfig(newConfig)
    saveConfig(newConfig)
    setActiveTab("create")
  }, [])

  const handleReset = useCallback(() => {
    clearError()
    resetLastCreated()
  }, [clearError, resetLastCreated])

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: "create", label: "作成" },
    { id: "manage", label: "管理" },
    { id: "config", label: "設定" },
  ]

  const headerButtons: FeatureHeaderButton[] = [
    {
      text: "生成画面に戻る",
      onClick: onClose,
      variant: "outline",
      size: "sm",
    },
  ]

  return (
    <FeatureLayout maxWidth="xl">
      <FeatureHeader
        title="時限QR（Dynamic QR）"
        subtitle="有効期限付きリダイレクトリンクを作成し、QRコードを発行します。期限後はアクセス不可になります。"
        buttons={headerButtons}
        showAddButton={false}
      />

      {/* タブ */}
      <div className="mb-6 flex border-b border-slate-200" role="tablist" aria-label="時限QR操作タブ">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`dqr-panel-${id}`}
            id={`dqr-tab-${id}`}
            onClick={() => {
              setActiveTab(id)
              clearError()
            }}
            className={[
              "px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
              activeTab === id
                ? "border-b-2 border-slate-900 text-slate-900"
                : "text-slate-500 hover:text-slate-700",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* エラー表示 */}
      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      {/* パネル: 作成 */}
      <div
        role="tabpanel"
        id="dqr-panel-create"
        aria-labelledby="dqr-tab-create"
        hidden={activeTab !== "create"}
      >
        <FeatureContent variant="paper" padding="md">
          {lastCreated && activeTab === "create" ? (
            <DynamicQRResult
              result={lastCreated}
              onReset={handleReset}
            />
          ) : (
            <DynamicQRCreateForm
              isLoading={isLoading}
              onSubmit={async (req) => {
                await create(req)
              }}
            />
          )}
        </FeatureContent>
      </div>

      {/* パネル: 管理 */}
      <div
        role="tabpanel"
        id="dqr-panel-manage"
        aria-labelledby="dqr-tab-manage"
        hidden={activeTab !== "manage"}
      >
        <FeatureContent variant="paper" padding="md">
          <DynamicQRManage
            isLoading={isLoading}
            currentLink={currentLink}
            onFetch={fetchLink}
            onUpdate={update}
            onDisable={disable}
          />
        </FeatureContent>
      </div>

      {/* パネル: 設定 */}
      <div
        role="tabpanel"
        id="dqr-panel-config"
        aria-labelledby="dqr-tab-config"
        hidden={activeTab !== "config"}
      >
        <FeatureContent variant="paper" padding="md">
          <div className="max-w-lg space-y-4">
            <p className="text-sm text-slate-600">
              Cloudflare Workers のデプロイ先と管理 API トークンを設定してください。
              設定値はブラウザのセッションストレージに保持されます（タブを閉じると削除）。
            </p>
            <DynamicQRConfigForm config={config} onSave={handleSaveConfig} />
          </div>
        </FeatureContent>
      </div>
    </FeatureLayout>
  )
}
