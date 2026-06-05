import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Orbit, Pause, Undo2 } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ComponentRef, KeyboardEvent, PointerEvent } from 'react'
import * as THREE from 'three'
import type { Creature, CreatureViewPreset, Locale } from '../types/creature'
import { getCreatureMusicTrack } from '../depth/depthMusic'
import type { DepthTheme } from '../depth/depthTheme'
import { getCreatureText } from '../i18n/creatureText'
import { uiCopy } from '../i18n/locale'
import { OceanEnvironment } from '../environment/OceanEnvironment'
import { hasDepthBackground2D } from '../environment/DepthBackground2D'
import { CreatureModel } from './CreatureModel'
import { StageMusicLink } from './StageMusicLink'
import { SUMMARY_INSIGHT_ID } from './creatureInsights'
import { getAuthoredStageScale, getCreatureEntryModelView, getCreatureModelView } from './modelView'
import type { CreatureModelView } from './modelView'
import './CreatureStage.css'

type CreatureStageProps = {
  creature: Creature
  activeInsightId?: string
  activeViewPresetId?: string
  entryReplayToken: number
  theme: DepthTheme
  locale: Locale
  onDepthBackgroundZoomChange?: (zoom: number) => void
  onResetView?: () => void
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

const DEFAULT_AUTO_ROTATE_CREATURE_IDS = new Set(['yellow-boxfish', 'longspine-seahorse'])

declare global {
  interface Window {
    __OE?: {
      captureModelView?: () => ModelViewCapture | undefined
    }
  }
}

export function CreatureStage({
  creature,
  activeInsightId,
  activeViewPresetId,
  entryReplayToken,
  theme,
  locale,
  onDepthBackgroundZoomChange,
  onResetView,
}: CreatureStageProps) {
  const creatureText = getCreatureText(creature, locale)
  const copy = uiCopy[locale]
  const shouldAutoRotateByDefault = DEFAULT_AUTO_ROTATE_CREATURE_IDS.has(creature.id)
  const [resetToken, setResetToken] = useState(0)
  const [isAutoRotateActive, setIsAutoRotateActive] = useState(shouldAutoRotateByDefault)
  const previousAutoRotateCreatureIdRef = useRef(creature.id)
  const previousEntryReplayTokenRef = useRef(entryReplayToken)
  const autoRotateView = useMemo(() => getCreatureModelView(creature), [creature])
  const autoRotateLabel = copy.autoRotate
  const resetLabel = copy.resetView
  const modelView = getCreatureModelView(creature, activeViewPresetId)
  const entryModelView = getCreatureEntryModelView(creature)
  const initialCameraRef = useRef({ position: entryModelView.cameraPosition, fov: 42 })
  const uses2DDepthBackground = hasDepthBackground2D(theme.id)
  const musicTrack = getCreatureMusicTrack(creature)

  function resetView() {
    setIsAutoRotateActive(false)
    onResetView?.()
    setResetToken((token) => token + 1)
  }

  function toggleAutoRotate() {
    if (isAutoRotateActive) {
      setIsAutoRotateActive(false)
      return
    }

    onResetView?.()
    setIsAutoRotateActive(true)
  }

  function pauseAutoRotate() {
    setIsAutoRotateActive(false)
  }

  function handleStagePointerDown(event: PointerEvent<HTMLElement>) {
    const target = event.target
    if (target instanceof Element && target.closest('.stage-control-button, .stage-music-link')) return
    pauseAutoRotate()
    event.currentTarget.focus({ preventScroll: true })
  }

  function handleStageKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key.toLowerCase() !== 'r') return
    event.preventDefault()
    resetView()
  }

  useEffect(() => {
    const isDefaultView = !activeViewPresetId && (!activeInsightId || activeInsightId === SUMMARY_INSIGHT_ID)
    const didSwitchCreature = previousAutoRotateCreatureIdRef.current !== creature.id
    const didReplayEntry = previousEntryReplayTokenRef.current !== entryReplayToken

    previousEntryReplayTokenRef.current = entryReplayToken

    if (didSwitchCreature) {
      previousAutoRotateCreatureIdRef.current = creature.id
      setIsAutoRotateActive(shouldAutoRotateByDefault && isDefaultView)
      return
    }

    if (!isDefaultView) {
      setIsAutoRotateActive(false)
      return
    }

    if (didReplayEntry) setIsAutoRotateActive(shouldAutoRotateByDefault)
  }, [activeInsightId, activeViewPresetId, creature.id, entryReplayToken, shouldAutoRotateByDefault])

  const AutoRotateIcon = isAutoRotateActive ? Orbit : Pause

  return (
    <section
      className="creature-stage"
      tabIndex={0}
      aria-label={`${creatureText.commonName} ${copy.stageAriaSuffix}`}
      onPointerDownCapture={handleStagePointerDown}
      onWheelCapture={pauseAutoRotate}
      onKeyDown={handleStageKeyDown}
    >
      <div className="stage-copy">
        <span className="stage-kicker">{creatureText.productLayer}</span>
        <h1>{creatureText.commonName}</h1>
        <p>{creatureText.stageSummary}</p>
      </div>
      <div className="stage-bottom-bar">
        <div className="stage-legend" aria-hidden="true">
          {copy.stageInteractionHints.map((hint) => (
            <span className="stage-legend-item" key={hint.action}>
              <span>{hint.action}</span>
              <span>{hint.separator}</span>
              <strong>{hint.result}</strong>
            </span>
          ))}
        </div>
        {musicTrack ? <StageMusicLink track={musicTrack} locale={locale} /> : <span aria-hidden="true" />}
        <div className="stage-actions">
          <button
            type="button"
            className={isAutoRotateActive ? 'stage-control-button active' : 'stage-control-button'}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              toggleAutoRotate()
            }}
            title={isAutoRotateActive ? copy.pauseAutoRotate : copy.resumeAutoRotate}
            aria-label={isAutoRotateActive ? copy.pauseAutoRotate : copy.resumeAutoRotate}
            aria-pressed={isAutoRotateActive}
          >
            <AutoRotateIcon
              className={isAutoRotateActive ? 'stage-control-button-icon spinning' : 'stage-control-button-icon'}
              size={12}
              strokeWidth={2.4}
            />
            <span>{autoRotateLabel}</span>
          </button>
          <button
            type="button"
            className="stage-control-button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              resetView()
            }}
            title={resetLabel}
            aria-label={resetLabel}
          >
            <Undo2 size={12} strokeWidth={2.4} />
            <span>{resetLabel}</span>
          </button>
        </div>
      </div>
      <Canvas
        camera={initialCameraRef.current}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <OceanEnvironment
          theme={theme}
          transparentBackground={uses2DDepthBackground}
          showParticles={!uses2DDepthBackground}
          showStageIons
        />
        <ModelViewRig
          creature={creature}
          activeInsightId={activeInsightId}
          activeViewPresetId={activeViewPresetId}
          entryReplayToken={entryReplayToken}
          modelView={modelView}
          entryModelView={entryModelView}
          autoRotateView={autoRotateView}
          isAutoRotateActive={isAutoRotateActive}
          resetToken={resetToken}
          onAutoRotatePause={pauseAutoRotate}
          onDepthBackgroundZoomChange={uses2DDepthBackground ? onDepthBackgroundZoomChange : undefined}
        />
      </Canvas>
    </section>
  )
}

type ModelViewRigProps = {
  creature: Creature
  activeInsightId?: string
  activeViewPresetId?: string
  entryReplayToken: number
  modelView: CreatureModelView
  entryModelView: CreatureModelView
  autoRotateView: CreatureModelView
  isAutoRotateActive: boolean
  resetToken: number
  onAutoRotatePause: () => void
  onDepthBackgroundZoomChange?: (zoom: number) => void
}

type OrbitControlsHandle = ComponentRef<typeof OrbitControls>

const BACKGROUND_BASE_ZOOM = 1.25
const BACKGROUND_MIN_ZOOM = 1.22
const BACKGROUND_MAX_ZOOM = 1.31
const BACKGROUND_ZOOM_DEAD_ZONE = 0.04
const BACKGROUND_ZOOM_EPSILON = 0.002
const STANDARD_TRANSITION_DAMPING = 3.25
const STANDARD_TRANSITION_EPSILON = 0.003
const CREATURE_SWITCH_SETTLE_DURATION_SECONDS = 3.5
const AUTO_ROTATE_RETURN_DURATION_SECONDS = 0.82
const AUTO_ROTATE_SECONDS_PER_REVOLUTION = 34
const AUTO_ROTATE_VIEW_EPSILON = 0.035
const TRANSITION_EASE_SHAPE = 5

function ModelViewRig({
  creature,
  activeInsightId,
  activeViewPresetId,
  entryReplayToken,
  modelView,
  entryModelView,
  autoRotateView,
  isAutoRotateActive,
  resetToken,
  onAutoRotatePause,
  onDepthBackgroundZoomChange,
}: ModelViewRigProps) {
  const stageGroupRef = useRef<THREE.Group>(null)
  const controlsRef = useRef<OrbitControlsHandle>(null)
  const { camera } = useThree()
  const transitionActiveRef = useRef(false)
  const transitionModeRef = useRef<'damped' | 'fixed'>('damped')
  const transitionDurationRef = useRef(CREATURE_SWITCH_SETTLE_DURATION_SECONDS)
  const transitionElapsedRef = useRef(0)
  const transitionStartPositionRef = useRef(new THREE.Vector3())
  const transitionStartControlsRef = useRef(new THREE.Vector3())
  const transitionStartStagePositionRef = useRef(new THREE.Vector3())
  const transitionStartStageScaleRef = useRef(new THREE.Vector3())
  const transitionTargetPositionRef = useRef(new THREE.Vector3())
  const transitionTargetControlsRef = useRef(new THREE.Vector3())
  const transitionTargetStagePositionRef = useRef(new THREE.Vector3())
  const transitionTargetStageScaleRef = useRef(new THREE.Vector3())
  const transitionPurposeRef = useRef<'view' | 'entry-default' | 'auto-rotate-return'>('view')
  const userInteractionActiveRef = useRef(false)
  const autoRotateActiveRef = useRef(isAutoRotateActive)
  const autoRotateReadyRef = useRef(false)
  const autoRotateOffsetRef = useRef(new THREE.Vector3())
  const autoRotateSphericalRef = useRef(new THREE.Spherical())
  const backgroundZoomNeutralDistanceRef = useRef(0)
  const lastBackgroundZoomRef = useRef(BACKGROUND_BASE_ZOOM)
  const previousCreatureIdRef = useRef(creature.id)
  const creatureSwitchSettlingRef = useRef(false)
  const handledEntryReplayTokenRef = useRef(entryReplayToken)
  const resetEffectReadyRef = useRef(false)
  const initialStagePositionRef = useRef(modelView.stagePosition)
  const initialStageScaleRef = useRef(modelView.stageScale)
  const initialControlsTargetRef = useRef(modelView.controlsTarget)
  const lastCapturePayloadRef = useRef('')
  const captureMirrorElapsedRef = useRef(0)
  const [cameraX, cameraY, cameraZ] = modelView.cameraPosition
  const [targetX, targetY, targetZ] = modelView.controlsTarget
  const [stageX, stageY, stageZ] = modelView.stagePosition
  const targetPosition = useMemo(() => new THREE.Vector3(cameraX, cameraY, cameraZ), [cameraX, cameraY, cameraZ])
  const targetControls = useMemo(() => new THREE.Vector3(targetX, targetY, targetZ), [targetX, targetY, targetZ])
  const targetStagePosition = useMemo(() => new THREE.Vector3(stageX, stageY, stageZ), [stageX, stageY, stageZ])
  const targetStageScale = useMemo(
    () => new THREE.Vector3(modelView.stageScale, modelView.stageScale, modelView.stageScale),
    [modelView.stageScale],
  )
  const [entryCameraX, entryCameraY, entryCameraZ] = entryModelView.cameraPosition
  const [entryTargetX, entryTargetY, entryTargetZ] = entryModelView.controlsTarget
  const [entryStageX, entryStageY, entryStageZ] = entryModelView.stagePosition
  const entryPosition = useMemo(
    () => new THREE.Vector3(entryCameraX, entryCameraY, entryCameraZ),
    [entryCameraX, entryCameraY, entryCameraZ],
  )
  const entryControls = useMemo(
    () => new THREE.Vector3(entryTargetX, entryTargetY, entryTargetZ),
    [entryTargetX, entryTargetY, entryTargetZ],
  )
  const entryStagePosition = useMemo(
    () => new THREE.Vector3(entryStageX, entryStageY, entryStageZ),
    [entryStageX, entryStageY, entryStageZ],
  )
  const entryStageScale = useMemo(
    () => new THREE.Vector3(entryModelView.stageScale, entryModelView.stageScale, entryModelView.stageScale),
    [entryModelView.stageScale],
  )
  const [autoCameraX, autoCameraY, autoCameraZ] = autoRotateView.cameraPosition
  const [autoTargetX, autoTargetY, autoTargetZ] = autoRotateView.controlsTarget
  const [autoStageX, autoStageY, autoStageZ] = autoRotateView.stagePosition
  const autoRotatePosition = useMemo(
    () => new THREE.Vector3(autoCameraX, autoCameraY, autoCameraZ),
    [autoCameraX, autoCameraY, autoCameraZ],
  )
  const autoRotateControls = useMemo(
    () => new THREE.Vector3(autoTargetX, autoTargetY, autoTargetZ),
    [autoTargetX, autoTargetY, autoTargetZ],
  )
  const autoRotateStagePosition = useMemo(
    () => new THREE.Vector3(autoStageX, autoStageY, autoStageZ),
    [autoStageX, autoStageY, autoStageZ],
  )
  const autoRotateStageScale = useMemo(
    () => new THREE.Vector3(autoRotateView.stageScale, autoRotateView.stageScale, autoRotateView.stageScale),
    [autoRotateView.stageScale],
  )

  function setTransitionTargets(
    cameraPosition: THREE.Vector3,
    controlsTarget: THREE.Vector3,
    stagePosition: THREE.Vector3,
    stageScale: THREE.Vector3,
  ) {
    transitionTargetPositionRef.current.copy(cameraPosition)
    transitionTargetControlsRef.current.copy(controlsTarget)
    transitionTargetStagePositionRef.current.copy(stagePosition)
    transitionTargetStageScaleRef.current.copy(stageScale)
  }

  function beginFixedTransition(
    durationSeconds: number,
    cameraPosition = targetPosition,
    controlsTarget = targetControls,
    stagePosition = targetStagePosition,
    stageScale = targetStageScale,
    purpose: 'view' | 'entry-default' | 'auto-rotate-return' = 'view',
  ) {
    const controls = controlsRef.current
    const stageGroup = stageGroupRef.current

    setTransitionTargets(cameraPosition, controlsTarget, stagePosition, stageScale)
    transitionPurposeRef.current = purpose
    transitionModeRef.current = 'fixed'
    transitionDurationRef.current = durationSeconds
    transitionElapsedRef.current = 0
    transitionStartPositionRef.current.copy(camera.position)
    transitionStartControlsRef.current.copy(controls?.target ?? targetControls)
    transitionStartStagePositionRef.current.copy(stageGroup?.position ?? targetStagePosition)
    transitionStartStageScaleRef.current.copy(stageGroup?.scale ?? targetStageScale)
    transitionActiveRef.current = true
  }

  function beginDampedTransition(
    cameraPosition = targetPosition,
    controlsTarget = targetControls,
    stagePosition = targetStagePosition,
    stageScale = targetStageScale,
    purpose: 'view' | 'entry-default' | 'auto-rotate-return' = 'view',
  ) {
    setTransitionTargets(cameraPosition, controlsTarget, stagePosition, stageScale)
    transitionPurposeRef.current = purpose
    transitionModeRef.current = 'damped'
    transitionActiveRef.current = true
  }

  function beginEntryToDefaultTransition() {
    const controls = controlsRef.current
    const stageGroup = stageGroupRef.current

    camera.position.copy(entryPosition)
    controls?.target.copy(entryControls)
    stageGroup?.position.copy(entryStagePosition)
    stageGroup?.scale.copy(entryStageScale)
    controls?.update()

    userInteractionActiveRef.current = false
    creatureSwitchSettlingRef.current = true
    backgroundZoomNeutralDistanceRef.current = targetPosition.distanceTo(targetControls)
    lastBackgroundZoomRef.current = BACKGROUND_BASE_ZOOM
    autoRotateReadyRef.current = false
    beginFixedTransition(
      CREATURE_SWITCH_SETTLE_DURATION_SECONDS,
      targetPosition,
      targetControls,
      targetStagePosition,
      targetStageScale,
      'entry-default',
    )
  }

  useLayoutEffect(() => {
    beginEntryToDefaultTransition()
  }, [])

  useLayoutEffect(() => {
    if (previousCreatureIdRef.current === creature.id) return

    previousCreatureIdRef.current = creature.id
    beginEntryToDefaultTransition()
  }, [
    camera,
    creature.id,
    entryControls,
    entryPosition,
    entryStagePosition,
    entryStageScale,
    targetControls,
    targetPosition,
    targetStagePosition,
    targetStageScale,
  ])

  useLayoutEffect(() => {
    if (entryReplayToken === handledEntryReplayTokenRef.current) return
    handledEntryReplayTokenRef.current = entryReplayToken

    const controls = controlsRef.current
    const stageGroup = stageGroupRef.current

    camera.position.copy(entryPosition)
    controls?.target.copy(entryControls)
    stageGroup?.position.copy(entryStagePosition)
    stageGroup?.scale.copy(entryStageScale)
    controls?.update()

    userInteractionActiveRef.current = false
    backgroundZoomNeutralDistanceRef.current = targetPosition.distanceTo(targetControls)
    lastBackgroundZoomRef.current = BACKGROUND_BASE_ZOOM
    autoRotateReadyRef.current = false
    beginFixedTransition(
      CREATURE_SWITCH_SETTLE_DURATION_SECONDS,
      targetPosition,
      targetControls,
      targetStagePosition,
      targetStageScale,
      'entry-default',
    )
  }, [
    camera,
    entryControls,
    entryPosition,
    entryReplayToken,
    entryStagePosition,
    entryStageScale,
    targetControls,
    targetPosition,
    targetStagePosition,
    targetStageScale,
  ])

  useEffect(() => {
    if (creatureSwitchSettlingRef.current) {
      creatureSwitchSettlingRef.current = false
    } else {
      beginDampedTransition()
    }
    backgroundZoomNeutralDistanceRef.current = targetPosition.distanceTo(targetControls)
    lastBackgroundZoomRef.current = BACKGROUND_BASE_ZOOM
  }, [modelView.id, targetPosition, targetControls, targetStagePosition, targetStageScale])

  useEffect(() => {
    if (!resetEffectReadyRef.current) {
      resetEffectReadyRef.current = true
      return
    }

    beginDampedTransition()
    lastBackgroundZoomRef.current = BACKGROUND_BASE_ZOOM
  }, [resetToken])

  useEffect(() => {
    autoRotateActiveRef.current = isAutoRotateActive

    if (!isAutoRotateActive) {
      autoRotateReadyRef.current = false
      if (transitionPurposeRef.current === 'auto-rotate-return') {
        transitionActiveRef.current = false
        transitionPurposeRef.current = 'view'
      }
      return
    }

    userInteractionActiveRef.current = false
    autoRotateReadyRef.current = false
    backgroundZoomNeutralDistanceRef.current = autoRotatePosition.distanceTo(autoRotateControls)
    lastBackgroundZoomRef.current = BACKGROUND_BASE_ZOOM

    if (transitionActiveRef.current && transitionPurposeRef.current === 'entry-default') return

    beginAutoRotate()
  }, [
    autoRotateControls,
    autoRotatePosition,
    autoRotateStagePosition,
    autoRotateStageScale,
    isAutoRotateActive,
  ])

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
      creatureId: creature.id,
      activeInsightId,
      viewPresetId,
      source: modelView.source,
      jsonPath: `content/creatures/${creature.id}.json`,
      writeTarget: activeViewPresetId ? `model.viewPresets.${activeViewPresetId}` : 'model.defaultCamera/viewTarget',
      entryWriteTarget: activeViewPresetId ? undefined : 'model.entryView',
      preset,
      runtime: {
        stageScale: roundNumber(runtimeStageScale),
      },
    }
  }, [activeInsightId, activeViewPresetId, camera.position, creature.id, modelView.source])

  useEffect(() => {
    if (!import.meta.env.DEV) return undefined

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
    if (import.meta.env.DEV) {
      captureMirrorElapsedRef.current += delta
      if (captureMirrorElapsedRef.current >= 0.12) {
        captureMirrorElapsedRef.current = 0
        const payload = JSON.stringify(captureModelView() ?? null)
        if (payload !== lastCapturePayloadRef.current) {
          lastCapturePayloadRef.current = payload
          document.documentElement.dataset.oeCapturePayload = payload
        }
      }
    }

    const stageGroup = stageGroupRef.current
    const controls = controlsRef.current

    if (!transitionActiveRef.current) {
      updateAutoRotate(delta)
      return
    }

    const transitionTargetPosition = transitionTargetPositionRef.current
    const transitionTargetControls = transitionTargetControlsRef.current
    const transitionTargetStagePosition = transitionTargetStagePositionRef.current
    const transitionTargetStageScale = transitionTargetStageScaleRef.current

    if (transitionModeRef.current === 'fixed') {
      transitionElapsedRef.current += delta
      const progress = THREE.MathUtils.clamp(
        transitionElapsedRef.current / transitionDurationRef.current,
        0,
        1,
      )
      const easedProgress = easeOutExponential(progress)

      camera.position.copy(transitionStartPositionRef.current).lerp(transitionTargetPosition, easedProgress)
      controls?.target.copy(transitionStartControlsRef.current).lerp(transitionTargetControls, easedProgress)
      stageGroup?.position.copy(transitionStartStagePositionRef.current).lerp(transitionTargetStagePosition, easedProgress)
      stageGroup?.scale.copy(transitionStartStageScaleRef.current).lerp(transitionTargetStageScale, easedProgress)
      controls?.update()

      if (progress < 1) return
      camera.position.copy(transitionTargetPosition)
      controls?.target.copy(transitionTargetControls)
      stageGroup?.position.copy(transitionTargetStagePosition)
      stageGroup?.scale.copy(transitionTargetStageScale)
      controls?.update()
      transitionActiveRef.current = false
      completeTransition()
      return
    }

    const alpha = 1 - Math.exp(-delta * STANDARD_TRANSITION_DAMPING)

    camera.position.lerp(transitionTargetPosition, alpha)
    controls?.target.lerp(transitionTargetControls, alpha)
    stageGroup?.position.lerp(transitionTargetStagePosition, alpha)
    stageGroup?.scale.lerp(transitionTargetStageScale, alpha)
    controls?.update()

    const cameraReady = camera.position.distanceTo(transitionTargetPosition) < STANDARD_TRANSITION_EPSILON
    const targetReady = !controls || controls.target.distanceTo(transitionTargetControls) < STANDARD_TRANSITION_EPSILON
    const stageReady = !stageGroup
      || (stageGroup.position.distanceTo(transitionTargetStagePosition) < STANDARD_TRANSITION_EPSILON
        && Math.abs(stageGroup.scale.x - transitionTargetStageScale.x) < STANDARD_TRANSITION_EPSILON)

    if (cameraReady && targetReady && stageReady) {
      camera.position.copy(transitionTargetPosition)
      controls?.target.copy(transitionTargetControls)
      stageGroup?.position.copy(transitionTargetStagePosition)
      stageGroup?.scale.copy(transitionTargetStageScale)
      controls?.update()
      transitionActiveRef.current = false
      completeTransition()
    }
  })

  function beginAutoRotate() {
    if (isAutoRotateCompatibleView()) {
      autoRotateReadyRef.current = true
      return
    }

    beginFixedTransition(
      AUTO_ROTATE_RETURN_DURATION_SECONDS,
      autoRotatePosition,
      autoRotateControls,
      autoRotateStagePosition,
      autoRotateStageScale,
      'auto-rotate-return',
    )
  }

  function completeTransition() {
    const canStartAutoRotate = transitionPurposeRef.current === 'entry-default'
      || transitionPurposeRef.current === 'auto-rotate-return'

    if (canStartAutoRotate && autoRotateActiveRef.current) {
      autoRotateReadyRef.current = true
    }

    transitionPurposeRef.current = 'view'
  }

  function updateAutoRotate(delta: number) {
    const controls = controlsRef.current

    if (!autoRotateActiveRef.current || !autoRotateReadyRef.current || !controls) return

    autoRotateOffsetRef.current.copy(camera.position).sub(controls.target)
    autoRotateSphericalRef.current.setFromVector3(autoRotateOffsetRef.current)
    autoRotateSphericalRef.current.theta += delta * ((Math.PI * 2) / AUTO_ROTATE_SECONDS_PER_REVOLUTION)
    camera.position.copy(controls.target).add(autoRotateOffsetRef.current.setFromSpherical(autoRotateSphericalRef.current))
    controls.update()
  }

  function isAutoRotateCompatibleView(): boolean {
    const controls = controlsRef.current
    const stageGroup = stageGroupRef.current

    if (!controls || !stageGroup) return false

    const currentOffset = autoRotateOffsetRef.current.copy(camera.position).sub(controls.target)
    const currentSpherical = new THREE.Spherical().setFromVector3(currentOffset)
    const targetSpherical = new THREE.Spherical().setFromVector3(
      autoRotatePosition.clone().sub(autoRotateControls),
    )

    return controls.target.distanceTo(autoRotateControls) < AUTO_ROTATE_VIEW_EPSILON
      && stageGroup.position.distanceTo(autoRotateStagePosition) < AUTO_ROTATE_VIEW_EPSILON
      && Math.abs(stageGroup.scale.x - autoRotateStageScale.x) < AUTO_ROTATE_VIEW_EPSILON
      && Math.abs(currentSpherical.radius - targetSpherical.radius) < AUTO_ROTATE_VIEW_EPSILON
      && Math.abs(currentSpherical.phi - targetSpherical.phi) < AUTO_ROTATE_VIEW_EPSILON
  }

  function interruptTransition() {
    transitionActiveRef.current = false
  }

  function interruptAutoRotate() {
    if (!autoRotateActiveRef.current && !autoRotateReadyRef.current) return

    autoRotateActiveRef.current = false
    autoRotateReadyRef.current = false
    onAutoRotatePause()
  }

  function handleControlsStart() {
    userInteractionActiveRef.current = true
    interruptTransition()
    interruptAutoRotate()
  }

  function handleControlsChange() {
    const controls = controlsRef.current
    if (!controls || !userInteractionActiveRef.current || !onDepthBackgroundZoomChange) return

    const neutralDistance = backgroundZoomNeutralDistanceRef.current || targetPosition.distanceTo(targetControls)
    const currentDistance = camera.position.distanceTo(controls.target)
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
    const roundedZoom = Number(nextZoom.toFixed(4))

    if (Math.abs(roundedZoom - lastBackgroundZoomRef.current) < BACKGROUND_ZOOM_EPSILON) return
    lastBackgroundZoomRef.current = roundedZoom
    onDepthBackgroundZoomChange(roundedZoom)
  }

  function handleControlsEnd() {
    userInteractionActiveRef.current = false
  }

  return (
    <>
      <group
        ref={stageGroupRef}
        position={initialStagePositionRef.current}
        scale={initialStageScaleRef.current}
      >
        <CreatureModel creature={creature} />
      </group>
      <OrbitControls
        ref={controlsRef}
        target={initialControlsTargetRef.current}
        enablePan
        screenSpacePanning
        minDistance={3.2}
        maxDistance={8.4}
        rotateSpeed={0.78}
        zoomSpeed={0.72}
        panSpeed={0.75}
        enableDamping
        dampingFactor={0.075}
        onStart={handleControlsStart}
        onChange={handleControlsChange}
        onEnd={handleControlsEnd}
      />
    </>
  )
}

function vectorToRoundedVec3(vector: THREE.Vector3): [number, number, number] {
  return [roundNumber(vector.x), roundNumber(vector.y), roundNumber(vector.z)]
}

function roundNumber(value: number): number {
  return Number(value.toFixed(4))
}

function easeOutExponential(progress: number): number {
  if (progress >= 1) return 1
  return (1 - Math.exp(-TRANSITION_EASE_SHAPE * progress)) / (1 - Math.exp(-TRANSITION_EASE_SHAPE))
}
