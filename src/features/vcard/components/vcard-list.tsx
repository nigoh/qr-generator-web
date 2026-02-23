import { useState } from "react"
import React from "react"
import { toast } from "sonner"
import { ClipboardCopy, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { VCardRecord } from "@/features/vcard/services/vcard-api"
import { buildVCardString } from "@/features/vcard/utils/vcard-utils"

interface VCardListProps {
  vcards: VCardRecord[]
  isLoading: boolean
  onEdit: (record: VCardRecord) => void
  onDelete: (id: string) => void
}

export function VCardList({ vcards, isLoading, onEdit, onDelete }: VCardListProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const confirmTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  if (isLoading && vcards.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border shadow-sm">
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-8 w-20 shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (vcards.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        vCardがまだありません。「新規作成」から追加してください。
      </p>
    )
  }

  const handleDelete = (id: string) => {
    if (confirmId === id) {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current)
      onDelete(id)
      setConfirmId(null)
    } else {
      setConfirmId(id)
      confirmTimerRef.current = setTimeout(() => setConfirmId(null), 3000)
    }
  }

  const handleQR = (record: VCardRecord) => {
    const vcard = buildVCardString(record.data)
    void navigator.clipboard.writeText(vcard).then(() => {
      toast.success("vCard文字列をクリップボードにコピーしました")
    }).catch(() => {
      toast.error("コピーに失敗しました")
    })
  }

  return (
    <div className="space-y-3">
      {vcards.map((record) => {        const fullName = [record.data.lastName, record.data.firstName]
          .filter(Boolean)
          .join(" ")
        const subText = [record.data.company, record.data.title]
          .filter(Boolean)
          .join(" / ")

        return (
          <Card key={record.id} className="border shadow-sm">
            <CardContent className="flex items-center justify-between gap-3 py-3 px-4">
              <div className="min-w-0 flex-1">
                <Badge variant="secondary" className="mb-1 truncate max-w-full">
                  {record.label}
                </Badge>
                <p className="font-medium text-gray-900 truncate">{fullName || "（名前未設定）"}</p>
                {subText ? (
                  <p className="text-sm text-gray-500 truncate">{subText}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQR(record)}
                  aria-label="vCard文字列をコピー"
                  title="vCard文字列をコピー"
                >
                  <ClipboardCopy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(record)}
                  aria-label="編集"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                {confirmId === record.id ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(record.id)}
                    aria-label="削除を確定"
                    className="text-xs px-2"
                  >
                    削除しますか?
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(record.id)}
                    aria-label="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
