import type { ZoneId } from '../types/creature'
import { DepthCanvasUnderlay } from './DepthCanvasBackground'
import type { DepthCanvasId, DepthCanvasVariant } from './DepthCanvasBackground'

export const DEPTH_BACKGROUND_BASE_ZOOM = 1.25

const DEPTH_BACKGROUND_VARIANTS: Partial<Record<ZoneId, { depth: DepthCanvasId; variant: DepthCanvasVariant }>> = {
  sunlight: { depth: 'reef_cool', variant: 'A' },
  twilight: { depth: 'twilight', variant: 'A' },
  midnight: { depth: 'midnight', variant: 'C' },
  abyssal: { depth: 'abyssal', variant: 'B' },
  hadal: { depth: 'hadal', variant: 'B' },
}

type DepthBackground2DProps = {
  zone: ZoneId
  zoom?: number
}

export function hasDepthBackground2D(zone: ZoneId): boolean {
  return Boolean(DEPTH_BACKGROUND_VARIANTS[zone])
}

export function DepthBackground2D({ zone, zoom = DEPTH_BACKGROUND_BASE_ZOOM }: DepthBackground2DProps) {
  const variant = DEPTH_BACKGROUND_VARIANTS[zone]
  if (!variant) return null

  return <DepthCanvasUnderlay depth={variant.depth} variant={variant.variant} zoom={zoom} />
}
