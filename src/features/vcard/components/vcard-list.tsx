import { useState } from "react"
import { Edit2, QrCode, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

  if (isLoading && vcards.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">読み込み中...</p>
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
      onDelete(id)
      setConfirmId(null)
    } else {
      setConfirmId(id)
    }
  }

  const handleQR = (record: VCardRecord) => {
    const vcard = buildVCardString(record.data)
    // QRデータをクリップボードにコピー（簡易実装）
    void navigator.clipboard.writeText(vcard)
    alert("vCard文字列をクリップボードにコピーしました")
  }

  return (
    <div className="space-y-3">
      {vcards.map((record) => {
        const fullName = [record.data.lastName, record.data.firstName]
          .filter(Boolean)
          .join(" ")
        const subText = [record.data.company, record.data.title]
          .filter(Boolean)
          .join(" / ")

        return (
          <Card key={record.id} className="border shadow-sm">
            <CardContent className="flex items-center justify-between gap-3 py-3 px-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-blue-600 truncate">{record.label}</p>
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
                  aria-label="QRコード用にコピー"
                >
                  <QrCode className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(record)}
                  aria-label="編集"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(record.id)}
                  aria-label={confirmId === record.id ? "削除を確定" : "削除"}
                  className={confirmId === record.id ? "text-red-600 hover:text-red-700" : ""}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
      {confirmId ? (
        <p className="text-center text-xs text-red-600">
          もう一度削除ボタンを押すと確定します
        </p>
      ) : null}
    </div>
  )
}
