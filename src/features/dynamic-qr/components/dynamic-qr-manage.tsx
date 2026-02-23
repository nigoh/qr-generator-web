import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { DynamicLink, UpdateLinkRequest } from "@/features/dynamic-qr/types"

interface DynamicQRManageProps {
  isLoading: boolean
  currentLink: DynamicLink | null
  links?: DynamicLink[]
  onFetch: (code: string) => void
  onUpdate: (code: string, req: UpdateLinkRequest) => void
  onDisable: (code: string) => void
  onFetchList?: (limit?: number) => Promise<void>
}

function statusLabel(status: DynamicLink["status"]): string {
  if (status === "active") return "有効"
  if (status === "disabled") return "無効化済み"
  return "期限切れ"
}

function statusVariant(status: DynamicLink["status"]): "default" | "secondary" | "outline" {
  if (status === "active") return "default"
  if (status === "disabled") return "secondary"
  return "outline"
}

export function DynamicQRManage({
  isLoading,
  currentLink,
  links = [],
  onFetch,
  onUpdate,
  onDisable,
  onFetchList,
}: DynamicQRManageProps) {
  const [code, setCode] = useState("")
  const [newTargetUrl, setNewTargetUrl] = useState("")
  const [newExpiresAt, setNewExpiresAt] = useState("")

  useEffect(() => {
    if (onFetchList) {
      void onFetchList(20)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      {/* 作成済みリンク一覧 */}
      {links.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">作成済みリンク一覧</p>
            {onFetchList && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void onFetchList(20)}
                disabled={isLoading}
                className="text-xs"
              >
                更新
              </Button>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {links.map((link) => (
              <button
                key={link.code}
                type="button"
                onClick={() => { setCode(link.code); onFetch(link.code); }}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors text-sm"
              >
                <span className="font-mono text-slate-800 shrink-0">{link.code}</span>
                <span className="flex-1 truncate text-slate-500 text-xs">{link.target_url}</span>
                <Badge variant={statusVariant(link.status)} className="shrink-0">
                  {statusLabel(link.status)}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

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
            <Badge variant={statusVariant(currentLink.status)}>
              {statusLabel(currentLink.status)}
            </Badge>
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
