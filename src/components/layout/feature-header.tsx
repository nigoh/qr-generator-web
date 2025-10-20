import type { ReactNode } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface FeatureHeaderButton extends Pick<ButtonProps, "variant" | "size" | "disabled"> {
  text: string
  onClick: () => void
  icon?: ReactNode
}

export interface FeatureHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  buttons?: FeatureHeaderButton[]
  showAddButton?: boolean
  addButtonText?: string
  onAdd?: () => void
  className?: string
}

export function FeatureHeader({
  title,
  subtitle,
  actions,
  buttons,
  showAddButton = false,
  addButtonText = "新規作成",
  onAdd,
  className,
}: FeatureHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-slate-600">{subtitle}</p>
        ) : null}
        {actions ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
            {actions}
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {showAddButton && onAdd ? (
          <Button onClick={onAdd} size="lg">
            {addButtonText}
          </Button>
        ) : null}
        {buttons?.map(({ text, icon, onClick, variant, size, disabled }) => (
          <Button
            key={text}
            onClick={onClick}
            variant={variant}
            size={size ?? "sm"}
            disabled={disabled}
          >
            {icon}
            <span>{text}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
