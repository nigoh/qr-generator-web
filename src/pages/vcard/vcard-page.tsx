import { useState } from "react"
import { FeatureContent, FeatureHeader, FeatureLayout } from "@/components/layout"
import { VCardEditForm, VCardList, useVCard, type VCardRecord } from "@/features/vcard"
import type { VCardData } from "@/features/vcard"

type ViewMode = "list" | "edit"

export function VCardPage() {
  const { vcards, isLoading, error, create, update, remove, clearError } = useVCard()
  const [mode, setMode] = useState<ViewMode>("list")
  const [editTarget, setEditTarget] = useState<VCardRecord | null>(null)

  const handleNew = () => {
    setEditTarget(null)
    setMode("edit")
  }

  const handleEdit = (record: VCardRecord) => {
    setEditTarget(record)
    setMode("edit")
  }

  const handleSave = async (label: string, data: VCardData) => {
    if (editTarget) {
      await update(editTarget.id, label, data)
    } else {
      await create(label, data)
    }
    setMode("list")
  }

  const handleCancel = () => {
    setMode("list")
    clearError()
  }

  const handleDelete = async (id: string) => {
    await remove(id)
  }

  return (
    <FeatureLayout maxWidth={false}>
      <FeatureHeader
        title="vCard管理"
        subtitle="連絡先情報を登録してQRコードで共有できます"
        onAdd={mode === "list" ? handleNew : undefined}
        addButtonText="新規作成"
        showAddButton={mode === "list"}
      />

      {error ? (
        <div
          role="alert"
          className="mb-4 mx-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <FeatureContent variant="paper" padding="md">
        {mode === "list" ? (
          <VCardList
            vcards={vcards}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <div className="max-w-lg">
            <h2 className="mb-4 text-base font-semibold text-gray-800">
              {editTarget ? "vCardを編集" : "新規vCard作成"}
            </h2>
            <VCardEditForm
              initial={editTarget}
              isLoading={isLoading}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        )}
      </FeatureContent>
    </FeatureLayout>
  )
}
