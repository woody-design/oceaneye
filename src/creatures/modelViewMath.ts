import * as THREE from 'three'

export const BACKGROUND_BASE_ZOOM = 1.25
export const BACKGROUND_MIN_ZOOM = 1.22
export const BACKGROUND_MAX_ZOOM = 1.31
export const BACKGROUND_ZOOM_DEAD_ZONE = 0.04
export const TRANSITION_EASE_SHAPE = 5
export const AUTO_ROTATE_VIEW_EPSILON = 0.035

type AutoRotateCompatiblePose = {
  cameraPosition: THREE.Vector3
  controlsTarget: THREE.Vector3
  stagePosition: THREE.Vector3
  stageScale: THREE.Vector3
}

export function easeOutExponential(progress: number): number {
  if (progress >= 1) return 1
  return (1 - Math.exp(-TRANSITION_EASE_SHAPE * progress)) / (1 - Math.exp(-TRANSITION_EASE_SHAPE))
}

export function computeBackgroundZoom(neutralDistance: number, currentDistance: number): number {
  const normalized = THREE.MathUtils.clamp(
    (neutralDistance - currentDistance) / Math.max(1.4, neutralDistance * 0.35),
    -1,
    1,
  )
  const magnitude = Math.abs(normalized)
  const eased = magnitude <= BACKGROUND_ZOOM_DEAD_ZONE
    ? 0
    : Math.sign(normalized) * ((magnitude - BACKGROUND_ZOOM_DEAD_ZONE) / (1 - BACKGROUND_ZOOM_DEAD_ZONE))
  const nextZoom = eased >= 0
    ? BACKGROUND_BASE_ZOOM + eased * (BACKGROUND_MAX_ZOOM - BACKGROUND_BASE_ZOOM)
    : BACKGROUND_BASE_ZOOM + eased * (BACKGROUND_BASE_ZOOM - BACKGROUND_MIN_ZOOM)

  return Number(nextZoom.toFixed(4))
}

export function isAutoRotateCompatiblePose(
  current: AutoRotateCompatiblePose,
  autoRotate: AutoRotateCompatiblePose,
  epsilon = AUTO_ROTATE_VIEW_EPSILON,
): boolean {
  const currentOffset = current.cameraPosition.clone().sub(current.controlsTarget)
  const currentSpherical = new THREE.Spherical().setFromVector3(currentOffset)
  const targetSpherical = new THREE.Spherical().setFromVector3(
    autoRotate.cameraPosition.clone().sub(autoRotate.controlsTarget),
  )

  return current.controlsTarget.distanceTo(autoRotate.controlsTarget) < epsilon
    && current.stagePosition.distanceTo(autoRotate.stagePosition) < epsilon
    && Math.abs(current.stageScale.x - autoRotate.stageScale.x) < epsilon
    && Math.abs(currentSpherical.radius - targetSpherical.radius) < epsilon
    && Math.abs(currentSpherical.phi - targetSpherical.phi) < epsilon
}
