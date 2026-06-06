import { useFrame } from '@react-three/fiber'
import { useCallback, useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { CreatureViewPreset } from '../types/creature'
import { getAuthoredStageScale } from './modelView'
import type { CreatureModelView } from './modelView'

type CaptureControls = {
  target: THREE.Vector3
}

type RefLike<T> = {
  current: T | null
}

type ModelViewCapture = {
  creatureId: string
  activeInsightId?: string
  viewPresetId: string
  source: CreatureModelView['source']
  jsonPath: string
  writeTarget: string
  entryWriteTarget?: string
  preset: CreatureViewPreset
  runtime: {
    stageScale: number
  }
}

type UseModelViewCaptureOptions = {
  controlsRef: RefLike<CaptureControls>
  stageGroupRef: RefLike<THREE.Group>
  camera: THREE.Camera
  creatureId: string
  activeInsightId?: string
  activeViewPresetId?: string
  modelViewSource: CreatureModelView['source']
}

declare global {
  interface Window {
    __OE?: {
      captureModelView?: () => ModelViewCapture | undefined
    }
  }
}

export const useModelViewCapture = import.meta.env.DEV
  ? useModelViewCaptureDev
  : useModelViewCaptureNoop

function useModelViewCaptureNoop(_options: UseModelViewCaptureOptions) {}

function useModelViewCaptureDev({
  controlsRef,
  stageGroupRef,
  camera,
  creatureId,
  activeInsightId,
  activeViewPresetId,
  modelViewSource,
}: UseModelViewCaptureOptions) {
  const lastCapturePayloadRef = useRef('')
  const captureMirrorElapsedRef = useRef(0)

  const captureModelView = useCallback((): ModelViewCapture | undefined => {
    const controls = controlsRef.current
    const stageGroup = stageGroupRef.current

    if (!controls || !stageGroup) return undefined

    const runtimeStageScale = stageGroup.scale.x
    const viewPresetId = activeViewPresetId ?? 'default'
    const preset: CreatureViewPreset = {
      camera: vectorToRoundedVec3(camera.position),
      target: vectorToRoundedVec3(controls.target),
      stagePosition: vectorToRoundedVec3(stageGroup.position),
      scale: roundNumber(getAuthoredStageScale(runtimeStageScale)),
    }

    return {
      creatureId,
      activeInsightId,
      viewPresetId,
      source: modelViewSource,
      jsonPath: `content/creatures/${creatureId}.json`,
      writeTarget: activeViewPresetId ? `model.viewPresets.${activeViewPresetId}` : 'model.defaultCamera/viewTarget',
      entryWriteTarget: activeViewPresetId ? undefined : 'model.entryView',
      preset,
      runtime: {
        stageScale: roundNumber(runtimeStageScale),
      },
    }
  }, [activeInsightId, activeViewPresetId, camera.position, controlsRef, creatureId, modelViewSource, stageGroupRef])

  useEffect(() => {
    const previousNamespace = window.__OE ?? {}
    const capture = () => captureModelView()
    window.__OE = {
      ...previousNamespace,
      captureModelView: capture,
    }
    document.documentElement.dataset.oeCapture = 'ready'
    document.documentElement.dataset.oeCapturePayload = JSON.stringify(capture() ?? null)

    return () => {
      if (window.__OE?.captureModelView !== capture) return
      delete window.__OE.captureModelView
      delete document.documentElement.dataset.oeCapture
      delete document.documentElement.dataset.oeCapturePayload
      if (Object.keys(window.__OE).length === 0) {
        delete window.__OE
      }
    }
  }, [captureModelView])

  useFrame((_, delta) => {
    captureMirrorElapsedRef.current += delta
    if (captureMirrorElapsedRef.current < 0.12) return

    captureMirrorElapsedRef.current = 0
    const payload = JSON.stringify(captureModelView() ?? null)
    if (payload === lastCapturePayloadRef.current) return

    lastCapturePayloadRef.current = payload
    document.documentElement.dataset.oeCapturePayload = payload
  })
}

function vectorToRoundedVec3(vector: THREE.Vector3): [number, number, number] {
  return [roundNumber(vector.x), roundNumber(vector.y), roundNumber(vector.z)]
}

function roundNumber(value: number): number {
  return Number(value.toFixed(4))
}
