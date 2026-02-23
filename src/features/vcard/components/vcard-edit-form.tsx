import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { VCardRecord } from "@/features/vcard/services/vcard-api"
import type { VCardData } from "@/features/vcard/types"
import { VCARD_INITIAL } from "@/features/vcard/types"

interface VCardEditFormProps {
  initial?: VCardRecord | null
  isLoading: boolean
  onSave: (label: string, data: VCardData) => void
  onCancel: () => void
}

export function VCardEditForm({ initial, isLoading, onSave, onCancel }: VCardEditFormProps) {
  const [label, setLabel] = useState(initial?.label ?? "")
  const [data, setData] = useState<VCardData>(initial?.data ?? VCARD_INITIAL)

  useEffect(() => {
    setLabel(initial?.label ?? "")
    setData(initial?.data ?? VCARD_INITIAL)
  }, [initial])

  const set = (field: keyof VCardData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return
    onSave(label, data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="vc-label">ラベル（識別名）*</Label>
        <Input
          id="vc-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="例: 仕事用"
          required
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-gray-700">氏名</legend>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="vc-last">姓</Label>
            <Input id="vc-last" value={data.lastName} onChange={set("lastName")} placeholder="山田" />
          </div>
          <div>
            <Label htmlFor="vc-first">名</Label>
            <Input id="vc-first" value={data.firstName} onChange={set("firstName")} placeholder="太郎" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="vc-last-kana">姓（ふりがな）</Label>
            <Input id="vc-last-kana" value={data.lastNameKana} onChange={set("lastNameKana")} placeholder="やまだ" />
          </div>
          <div>
            <Label htmlFor="vc-first-kana">名（ふりがな）</Label>
            <Input id="vc-first-kana" value={data.firstNameKana} onChange={set("firstNameKana")} placeholder="たろう" />
          </div>
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="vc-company">会社名</Label>
          <Input id="vc-company" value={data.company} onChange={set("company")} />
        </div>
        <div>
          <Label htmlFor="vc-title">役職</Label>
          <Input id="vc-title" value={data.title} onChange={set("title")} />
        </div>
      </div>

      <div>
        <Label htmlFor="vc-email">メールアドレス</Label>
        <Input id="vc-email" type="email" value={data.email} onChange={set("email")} />
      </div>

      <div>
        <Label htmlFor="vc-phone">電話番号</Label>
        <Input id="vc-phone" type="tel" value={data.phone} onChange={set("phone")} />
      </div>

      <div>
        <Label htmlFor="vc-url">ウェブサイト</Label>
        <Input id="vc-url" type="url" value={data.url} onChange={set("url")} />
      </div>

      <div>
        <Label htmlFor="vc-address">住所</Label>
        <Input id="vc-address" value={data.address} onChange={set("address")} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" disabled={isLoading || !label.trim()}>
          {isLoading ? "保存中..." : "保存"}
        </Button>
      </div>
    </form>
  )
}
