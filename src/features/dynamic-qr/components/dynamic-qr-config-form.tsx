import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DynamicQRConfig } from "@/features/dynamic-qr/types"

interface DynamicQRConfigFormProps {
  config: Partial<DynamicQRConfig>
  onSave: (config: DynamicQRConfig) => void
}

export function DynamicQRConfigForm({ config, onSave }: DynamicQRConfigFormProps) {
  const [workerBaseUrl, setWorkerBaseUrl] = useState(config.workerBaseUrl ?? "")
  const [adminToken, setAdminToken] = useState(config.adminToken ?? "")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({ workerBaseUrl: workerBaseUrl.replace(/\/$/, ""), adminToken })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="dqr-worker-url">Worker ベース URL <span aria-hidden="true" className="text-red-500">*</span></Label>
        <Input
          id="dqr-worker-url"
          type="url"
          placeholder="https://qr.example.com"
          required
          value={workerBaseUrl}
          onChange={(e) => setWorkerBaseUrl(e.target.value)}
        />
        <p className="text-xs text-slate-500">
          Cloudflare Workers のデプロイ先 URL（末尾スラッシュ不要）
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="dqr-admin-token">管理トークン <span aria-hidden="true" className="text-red-500">*</span></Label>
        <Input
          id="dqr-admin-token"
          type="password"
          placeholder="your-secret-admin-token"
          required
          value={adminToken}
          onChange={(e) => setAdminToken(e.target.value)}
        />
        <p className="text-xs text-amber-600">
          ⚠ このトークンはブラウザに保持されます。共有端末では使用しないでください。
        </p>
      </div>

      <Button type="submit" className="w-full">
        設定を保存
      </Button>
    </form>
  )
}
