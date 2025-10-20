import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { elevationTokens } from "@/theme/design-system"

type FeatureContentVariant = "paper" | "transparent"
type FeatureContentPadding = "none" | "sm" | "md" | "lg"

type ElevationLevel = keyof typeof elevationTokens

const variantClassMap: Record<FeatureContentVariant, string> = {
  paper: "bg-white border border-slate-200/80 rounded-2xl",
  transparent: "bg-transparent",
}

const paddingClassMap: Record<FeatureContentPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
}

export interface FeatureContentProps {
  children: ReactNode
  variant?: FeatureContentVariant
  padding?: FeatureContentPadding
  elevation?: ElevationLevel
  className?: string
}

export function FeatureContent({
  children,
  variant = "paper",
  padding = "md",
  elevation = "md",
  className,
}: FeatureContentProps) {
  return (
    <section
      className={cn(
        "w-full",
        variantClassMap[variant],
        paddingClassMap[padding],
        elevationTokens[elevation],
        className,
      )}
    >
      {children}
    </section>
  )
}
