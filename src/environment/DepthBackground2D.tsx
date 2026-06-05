import type { ZoneId } from '../types/creature'
import { DepthCanvasUnderlay } from './DepthCanvasBackground'
import type { DepthCanvasCandidate, DepthCanvasId } from './DepthCanvasBackground'

export const DEPTH_BACKGROUND_BASE_ZOOM = 1.25

const DEPTH_BACKGROUND_VARIANTS: Partial<Record<ZoneId, { depth: DepthCanvasId; candidate: DepthCanvasCandidate }>> = {
  sunlight: { depth: 'reef_cool', candidate: 'A' },
  twilight: { depth: 'twilight', candidate: 'A' },
  midnight: { depth: 'midnight', candidate: 'C' },
  abyssal: { depth: 'abyssal', candidate: 'B' },
  hadal: { depth: 'hadal', candidate: 'B' },
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

  return <DepthCanvasUnderlay depth={variant.depth} candidate={variant.candidate} zoom={zoom} />
}
