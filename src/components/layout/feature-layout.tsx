import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type FeatureLayoutMaxWidth = false | "sm" | "md" | "lg" | "xl" | "2xl"

const widthClassMap: Record<Exclude<FeatureLayoutMaxWidth, false>, string> = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
}

function getWidthClass(maxWidth: FeatureLayoutMaxWidth) {
  if (!maxWidth) {
    return "max-w-none"
  }
  return widthClassMap[maxWidth]
}

export interface FeatureLayoutProps {
  children: ReactNode
  maxWidth?: FeatureLayoutMaxWidth
  showHeader?: boolean
  title?: string
  headerContent?: ReactNode
  className?: string
}

export function FeatureLayout({
  children,
  maxWidth = false,
  showHeader = false,
  title,
  headerContent,
  className,
}: FeatureLayoutProps) {
  return (
    <div className="w-full bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className={cn("mx-auto", getWidthClass(maxWidth))}>
          {showHeader && (title || headerContent) ? (
            <header className="mb-6">
              {title ? (
                <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
              ) : null}
              {headerContent ? (
                <div className={cn(title ? "mt-2" : undefined)}>{headerContent}</div>
              ) : null}
            </header>
          ) : null}
          <div className={cn("relative", className)}>{children}</div>
        </div>
      </div>
    </div>
  )
}
