import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DynamicLink, UpdateLinkRequest } from "@/features/dynamic-qr/types"

interface DynamicQRManageProps {
  isLoading: boolean
  currentLink: DynamicLink | null
  onFetch: (code: string) => void
  onUpdate: (code: string, req: UpdateLinkRequest) => void
  onDisable: (code: string) => void
}

function statusLabel(status: DynamicLink["status"]): string {
  if (status === "active") return "有効"
  if (status === "disabled") return "無効化済み"
  return "期限切れ"
}

function statusBadgeClass(status: DynamicLink["status"]): string {
  if (status === "active") return "bg-emerald-100 text-emerald-700"
  if (status === "disabled") return "bg-slate-100 text-slate-600"
  return "bg-amber-100 text-amber-700"
}

export function DynamicQRManage({
  isLoading,
  currentLink,
  onFetch,
  onUpdate,
  onDisable,
}: DynamicQRManageProps) {
  const [code, setCode] = useState("")
  const [newTargetUrl, setNewTargetUrl] = useState("")
  const [newExpiresAt, setNewExpiresAt] = useState("")

  function handleFetch(e: React.FormEvent) {
    e.preventDefault()
    if (code.trim()) {
      onFetch(code.trim())
    }
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!currentLink) return
    const req: UpdateLinkRequest = {}
    if (newTargetUrl) req.target_url = newTargetUrl
    if (newExpiresAt) req.expires_at = new Date(newExpiresAt).toISOString()
    onUpdate(currentLink.code, req)
  }

  return (
    <div className="space-y-6">
      {/* コード検索 */}
      <form onSubmit={handleFetch} className="flex gap-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="dqr-manage-code">コードで検索</Label>
          <Input
            id="dqr-manage-code"
            type="text"
            placeholder="例: abc12345"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={isLoading || !code.trim()} variant="outline">
            取得
          </Button>
        </div>
      </form>

      {/* リンク詳細 */}
      {currentLink && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-mono font-semibold text-slate-800">{currentLink.code}</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(currentLink.status)}`}
            >
              {statusLabel(currentLink.status)}
            </span>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">リダイレクト先</p>
            <p className="break-all text-slate-800">{currentLink.target_url}</p>
          </div>

          {currentLink.expires_at && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">有効期限</p>
              <p className="text-slate-800">
                {new Date(currentLink.expires_at).toLocaleString("ja-JP")}
              </p>
            </div>
          )}

          {currentLink.note && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">メモ</p>
              <p className="text-slate-600">{currentLink.note}</p>
            </div>
          )}

          {/* 更新フォーム */}
          <form onSubmit={handleUpdate} className="space-y-3 pt-2 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-700">リンクを更新</p>
            <div className="space-y-1.5">
              <Label htmlFor="dqr-new-url">新しいリダイレクト先（任意）</Label>
              <Input
                id="dqr-new-url"
                type="url"
                placeholder="https://example.com/new-page"
                value={newTargetUrl}
                onChange={(e) => setNewTargetUrl(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dqr-new-expires">新しい有効期限（任意）</Label>
              <Input
                id="dqr-new-expires"
                type="datetime-local"
                value={newExpiresAt}
                onChange={(e) => setNewExpiresAt(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={isLoading || (!newTargetUrl && !newExpiresAt)}
                className="flex-1"
              >
                更新
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                disabled={isLoading || currentLink.status === "disabled"}
                onClick={() => onDisable(currentLink.code)}
                className="flex-1"
              >
                無効化
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
