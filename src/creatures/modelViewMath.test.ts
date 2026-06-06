import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import {
  AUTO_ROTATE_VIEW_EPSILON,
  BACKGROUND_BASE_ZOOM,
  BACKGROUND_MAX_ZOOM,
  BACKGROUND_MIN_ZOOM,
  BACKGROUND_ZOOM_DEAD_ZONE,
  TRANSITION_EASE_SHAPE,
  computeBackgroundZoom,
  easeOutExponential,
  isAutoRotateCompatiblePose,
} from './modelViewMath'

describe('model view math', () => {
  it('eases exponential progress with the authored shape', () => {
    expect(easeOutExponential(0)).toBe(0)
    expect(easeOutExponential(1)).toBe(1)

    const midpoint = 0.5
    const expected = (1 - Math.exp(-TRANSITION_EASE_SHAPE * midpoint))
      / (1 - Math.exp(-TRANSITION_EASE_SHAPE))

    expect(easeOutExponential(midpoint)).toBeCloseTo(expected)
  })

  it('keeps the exponential easing monotonic', () => {
    const samples = Array.from({ length: 21 }, (_, index) => easeOutExponential(index / 20))

    for (let index = 1; index < samples.length; index += 1) {
      expect(samples[index]).toBeGreaterThanOrEqual(samples[index - 1])
    }
  })

  it('maps neutral and dead-zone distances to the base background zoom', () => {
    const neutralDistance = 5
    const insideDeadZoneDistance = neutralDistance
      - Math.max(1.4, neutralDistance * 0.35) * (BACKGROUND_ZOOM_DEAD_ZONE / 2)

    expect(computeBackgroundZoom(neutralDistance, neutralDistance)).toBe(BACKGROUND_BASE_ZOOM)
    expect(computeBackgroundZoom(neutralDistance, insideDeadZoneDistance)).toBe(BACKGROUND_BASE_ZOOM)
  })

  it('clamps background zoom in and out at the authored extremes', () => {
    expect(computeBackgroundZoom(5, 0)).toBe(BACKGROUND_MAX_ZOOM)
    expect(computeBackgroundZoom(5, 100)).toBe(BACKGROUND_MIN_ZOOM)
  })

  it('compares auto-rotate compatible poses without requiring the same theta', () => {
    const current = {
      cameraPosition: new THREE.Vector3(2, 1, 0),
      controlsTarget: new THREE.Vector3(0, 0, 0),
      stagePosition: new THREE.Vector3(0.1, -0.2, 0.3),
      stageScale: new THREE.Vector3(1.9, 1.9, 1.9),
    }
    const autoRotate = {
      cameraPosition: new THREE.Vector3(0, 1, 2),
      controlsTarget: new THREE.Vector3(0, 0, 0),
      stagePosition: new THREE.Vector3(0.1, -0.2, 0.3),
      stageScale: new THREE.Vector3(1.9, 1.9, 1.9),
    }

    expect(isAutoRotateCompatiblePose(current, autoRotate)).toBe(true)
  })

  it('rejects auto-rotate poses outside the authored epsilon', () => {
    const current = {
      cameraPosition: new THREE.Vector3(0, 1, 2),
      controlsTarget: new THREE.Vector3(0, 0, 0),
      stagePosition: new THREE.Vector3(0, 0, 0),
      stageScale: new THREE.Vector3(1, 1, 1),
    }
    const autoRotate = {
      cameraPosition: new THREE.Vector3(0, 1, 2),
      controlsTarget: new THREE.Vector3(AUTO_ROTATE_VIEW_EPSILON * 2, 0, 0),
      stagePosition: new THREE.Vector3(0, 0, 0),
      stageScale: new THREE.Vector3(1, 1, 1),
    }

    expect(isAutoRotateCompatiblePose(current, autoRotate)).toBe(false)
  })
})
