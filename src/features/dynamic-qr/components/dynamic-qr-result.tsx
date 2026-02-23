import { useEffect, useRef } from "react"
import QRCode from "qrcode"
import { Button } from "@/components/ui/button"
import type { CreateLinkResponse } from "@/features/dynamic-qr/types"

interface DynamicQRResultProps {
  result: CreateLinkResponse
  onReset: () => void
}

export function DynamicQRResult({ result, onReset }: DynamicQRResultProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, result.redirect_url, {
      width: 240,
      margin: 2,
    }).catch((err: unknown) => {
      console.error("[DynamicQRResult] QR generation failed", err)
    })
  }, [result.redirect_url])

  function handleCopy() {
    navigator.clipboard.writeText(result.redirect_url).catch(() => {
      // clipboard API が使えない環境では何もしない
    })
  }

  function handleDownload() {
    if (!canvasRef.current) return
    const link = document.createElement("a")
    link.download = `qr-${result.code}.png`
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <canvas
        ref={canvasRef}
        aria-label={`${result.redirect_url} の QRコード`}
        role="img"
        className="rounded-lg border border-slate-200 shadow-sm"
      />

      <div className="w-full space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">リダイレクト URL</p>
        <p className="break-all font-mono text-slate-800">{result.redirect_url}</p>

        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">コード</p>
        <p className="font-mono text-slate-800">{result.code}</p>

        {result.expires_at ? (
          <>
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">有効期限</p>
            <p className="text-slate-800">
              {new Date(result.expires_at).toLocaleString("ja-JP")}
            </p>
          </>
        ) : (
          <>
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">有効期限</p>
            <p className="text-slate-500">なし（無期限）</p>
          </>
        )}
      </div>

      <div className="flex w-full flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1">
          URLをコピー
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1">
          QRを保存
        </Button>
        <Button variant="ghost" size="sm" onClick={onReset} className="w-full">
          別のリンクを作成
        </Button>
      </div>
    </div>
  )
}
