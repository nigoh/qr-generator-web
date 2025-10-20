export const spacingTokens = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  xxl: "3rem",
} as const

export const shapeTokens = {
  corner: {
    none: "0px",
    small: "0.25rem",
    medium: "0.75rem",
    large: "1.5rem",
  },
} as const

export const elevationTokens = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
} as const

export type SpacingToken = keyof typeof spacingTokens
export type ShapeCornerToken = keyof typeof shapeTokens.corner
export type ElevationToken = keyof typeof elevationTokens
