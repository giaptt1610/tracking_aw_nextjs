/**
 * Centralized color tokens for the app.
 *
 * Use these constants instead of hardcoding hex values in components.
 * Values are aligned with the Ant Design theme (`AntdProvider`).
 *
 * NOTE: Tailwind preflight is disabled and theme is driven by Ant Design tokens,
 * so these JS constants are the single source of truth for inline-styled values
 * (e.g. `valueStyle`, recharts `fill`, profit/loss color rendering).
 */

export const BRAND_COLORS = {
  primary: '#1677ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  purple: '#722ed1',
  cyan: '#13c2c2',
  siderBg: '#001529',
  headerBg: '#fff',
} as const

/**
 * Color used to render profit/loss values.
 * Positive (>= 0) → success green, otherwise → error red.
 */
export function profitColor(value: number): string {
  return value >= 0 ? BRAND_COLORS.success : BRAND_COLORS.error
}

/**
 * Color sequence for chart series (pie slices, bars, etc).
 */
export const CHART_PALETTE: readonly string[] = [
  BRAND_COLORS.primary,
  BRAND_COLORS.success,
  BRAND_COLORS.warning,
  BRAND_COLORS.error,
  BRAND_COLORS.purple,
  BRAND_COLORS.cyan,
] as const
