import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CreateLinkRequest } from "@/features/dynamic-qr/types"

interface DynamicQRCreateFormProps {
  isLoading: boolean
  onSubmit: (req: CreateLinkRequest) => void
}

export function DynamicQRCreateForm({ isLoading, onSubmit }: DynamicQRCreateFormProps) {
  const [targetUrl, setTargetUrl] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [note, setNote] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      target_url: targetUrl,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      note: note || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="dqr-target-url">リダイレクト先 URL <span aria-hidden="true" className="text-red-500">*</span></Label>
        <Input
          id="dqr-target-url"
          type="url"
          placeholder="https://example.com/page"
          required
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          aria-required="true"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="dqr-expires-at">有効期限（任意）</Label>
        <Input
          id="dqr-expires-at"
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
        <p className="text-xs text-slate-500">
          未入力の場合、期限なしで有効になります。
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="dqr-note">メモ（任意）</Label>
        <Input
          id="dqr-note"
          type="text"
          placeholder="内部管理用のメモ"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "作成中…" : "時限QRリンクを作成"}
      </Button>
    </form>
  )
}
