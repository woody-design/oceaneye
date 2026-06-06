import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Orbit, Pause, Undo2 } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ComponentRef, KeyboardEvent, PointerEvent } from 'react'
import * as THREE from 'three'
import type { Creature, Locale } from '../types/creature'
import { getCreatureMusicTrack } from '../depth/depthMusic'
import type { DepthTheme } from '../depth/depthTheme'
import { getCreatureText } from '../i18n/creatureText'
import { uiCopy } from '../i18n/locale'
import { OceanEnvironment } from '../environment/OceanEnvironment'
import { hasDepthBackground2D } from '../environment/DepthBackground2D'
import { CreatureModel } from './CreatureModel'
import { StageMusicLink } from './StageMusicLink'
import { SUMMARY_INSIGHT_ID } from './creatureInsights'
import { getCreatureEntryModelView, getCreatureModelView } from './modelView'
import type { CreatureModelView } from './modelView'
import {
  AUTO_ROTATE_VIEW_EPSILON,
  BACKGROUND_BASE_ZOOM,
  computeBackgroundZoom,
  easeOutExponential,
  isAutoRotateCompatiblePose,
} from './modelViewMath'
import { useModelViewCapture } from './useModelViewCapture'
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

const DEFAULT_AUTO_ROTATE_CREATURE_IDS = new Set(['yellow-boxfish', 'longspine-seahorse'])

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
  const [modelLoadFailed, setModelLoadFailed] = useState(false)
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
  const modelFallbackUrl = creature.links.googleImages ?? creature.links.wikipedia

  const handleModelLoadError = useCallback(() => {
    setModelLoadFailed(true)
  }, [])

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
    if (target instanceof Element && target.closest('.stage-control-button, .stage-music-link, .stage-model-error-link')) return
    pauseAutoRotate()
    event.currentTarget.focus({ preventScroll: true })
  }

  function handleStageKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key.toLowerCase() !== 'r') return
    event.preventDefault()
    resetView()
  }

  useEffect(() => {
    setModelLoadFailed(false)
  }, [creature.id])

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
      {modelLoadFailed && (
        <div className="stage-model-error" role="status" aria-live="polite">
          <span>{copy.modelUnavailable}</span>
          {modelFallbackUrl && (
            <>
              <span aria-hidden="true">·</span>
              <a
                className="stage-model-error-link"
                href={modelFallbackUrl}
                target="_blank"
                rel="noreferrer"
              >
                {copy.seeReferenceImages}
              </a>
            </>
          )}
        </div>
      )}
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
          onModelLoadError={handleModelLoadError}
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
  onModelLoadError?: () => void
}

type OrbitControlsHandle = ComponentRef<typeof OrbitControls>

const BACKGROUND_ZOOM_EPSILON = 0.002
const STANDARD_TRANSITION_DAMPING = 3.25
const STANDARD_TRANSITION_EPSILON = 0.003
const CREATURE_SWITCH_SETTLE_DURATION_SECONDS = 3.5
const AUTO_ROTATE_RETURN_DURATION_SECONDS = 0.82
const AUTO_ROTATE_SECONDS_PER_REVOLUTION = 34

type TransitionPurpose = 'view' | 'entry-default' | 'auto-rotate-return'

type RigPose = {
  cameraPosition: THREE.Vector3
  controlsTarget: THREE.Vector3
  stagePosition: THREE.Vector3
  stageScale: THREE.Vector3
}

type FixedTransitionState = {
  phase: 'fixedTransition'
  purpose: TransitionPurpose
  elapsedSeconds: number
  durationSeconds: number
  start: RigPose
  target: RigPose
  autoRotateOnComplete: boolean
}

type DampedTransitionState = {
  phase: 'dampedTransition'
  purpose: TransitionPurpose
  target: RigPose
}

type RigTransitionState = FixedTransitionState | DampedTransitionState

type RigState =
  | { phase: 'idle' }
  | FixedTransitionState
  | DampedTransitionState
  | { phase: 'autoRotating' }
  | { phase: 'userInteracting' }

function createRigPose(
  cameraPosition: THREE.Vector3,
  controlsTarget: THREE.Vector3,
  stagePosition: THREE.Vector3,
  stageScale: THREE.Vector3,
): RigPose {
  return {
    cameraPosition: cameraPosition.clone(),
    controlsTarget: controlsTarget.clone(),
    stagePosition: stagePosition.clone(),
    stageScale: stageScale.clone(),
  }
}

function cloneRigPose(pose: RigPose): RigPose {
  return createRigPose(pose.cameraPosition, pose.controlsTarget, pose.stagePosition, pose.stageScale)
}

function shouldResumeAutoRotateAfterTransition(state: RigTransitionState): boolean {
  const startsAutoRotate = state.purpose === 'entry-default' || state.purpose === 'auto-rotate-return'
  return state.phase === 'fixedTransition' && startsAutoRotate && state.autoRotateOnComplete
}

function shouldPauseAutoRotateFromState(state: RigState): boolean {
  return state.phase === 'autoRotating'
    || (state.phase === 'fixedTransition' && state.autoRotateOnComplete)
}

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
  onModelLoadError,
}: ModelViewRigProps) {
  const stageGroupRef = useRef<THREE.Group>(null)
  const controlsRef = useRef<OrbitControlsHandle>(null)
  const { camera } = useThree()
  const rigStateRef = useRef<RigState>({ phase: 'idle' })
  const autoRotateOffsetRef = useRef(new THREE.Vector3())
  const autoRotateSphericalRef = useRef(new THREE.Spherical())
  const backgroundZoomNeutralDistanceRef = useRef(0)
  const lastBackgroundZoomRef = useRef(BACKGROUND_BASE_ZOOM)
  const previousCreatureIdRef = useRef(creature.id)
  const creatureSwitchSettlingRef = useRef(false)
  const handledEntryReplayTokenRef = useRef(entryReplayToken)
  const handledResetTokenRef = useRef(resetToken)
  const didRunInitialEntryRef = useRef(false)
  const initialStagePositionRef = useRef(modelView.stagePosition)
  const initialStageScaleRef = useRef(modelView.stageScale)
  const initialControlsTargetRef = useRef(modelView.controlsTarget)
  useModelViewCapture({
    controlsRef,
    stageGroupRef,
    camera,
    creatureId: creature.id,
    activeInsightId,
    activeViewPresetId,
    modelViewSource: modelView.source,
  })
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
  const targetPose = useMemo(
    () => createRigPose(targetPosition, targetControls, targetStagePosition, targetStageScale),
    [targetControls, targetPosition, targetStagePosition, targetStageScale],
  )
  const entryPose = useMemo(
    () => createRigPose(entryPosition, entryControls, entryStagePosition, entryStageScale),
    [entryControls, entryPosition, entryStagePosition, entryStageScale],
  )
  const autoRotatePose = useMemo(
    () => createRigPose(autoRotatePosition, autoRotateControls, autoRotateStagePosition, autoRotateStageScale),
    [autoRotateControls, autoRotatePosition, autoRotateStagePosition, autoRotateStageScale],
  )

  const applyPose = useCallback((pose: RigPose) => {
    const controls = controlsRef.current
    const stageGroup = stageGroupRef.current

    camera.position.copy(pose.cameraPosition)
    controls?.target.copy(pose.controlsTarget)
    stageGroup?.position.copy(pose.stagePosition)
    stageGroup?.scale.copy(pose.stageScale)
    controls?.update()
  }, [camera.position])

  const readCurrentPose = useCallback((fallback: RigPose) => {
    const controls = controlsRef.current
    const stageGroup = stageGroupRef.current

    return createRigPose(
      camera.position,
      controls?.target ?? fallback.controlsTarget,
      stageGroup?.position ?? fallback.stagePosition,
      stageGroup?.scale ?? fallback.stageScale,
    )
  }, [camera.position])

  const beginFixedTransition = useCallback((
    durationSeconds: number,
    target: RigPose,
    purpose: TransitionPurpose,
    autoRotateOnComplete: boolean,
  ) => {
    rigStateRef.current = {
      phase: 'fixedTransition',
      purpose,
      elapsedSeconds: 0,
      durationSeconds,
      start: readCurrentPose(target),
      target: cloneRigPose(target),
      autoRotateOnComplete,
    }
  }, [readCurrentPose])

  const beginDampedTransition = useCallback((target: RigPose, purpose: TransitionPurpose = 'view') => {
    rigStateRef.current = {
      phase: 'dampedTransition',
      purpose,
      target: cloneRigPose(target),
    }
  }, [])

  const snapToEntryThenSettle = useCallback((skipNextViewDampedTransition: boolean) => {
    applyPose(entryPose)

    if (skipNextViewDampedTransition) {
      creatureSwitchSettlingRef.current = true
    }

    backgroundZoomNeutralDistanceRef.current = targetPose.cameraPosition.distanceTo(targetPose.controlsTarget)
    lastBackgroundZoomRef.current = BACKGROUND_BASE_ZOOM
    beginFixedTransition(
      CREATURE_SWITCH_SETTLE_DURATION_SECONDS,
      targetPose,
      'entry-default',
      isAutoRotateActive,
    )
  }, [applyPose, beginFixedTransition, entryPose, isAutoRotateActive, targetPose])

  useLayoutEffect(() => {
    if (didRunInitialEntryRef.current) return
    didRunInitialEntryRef.current = true
    snapToEntryThenSettle(true)
  }, [snapToEntryThenSettle])

  useLayoutEffect(() => {
    if (previousCreatureIdRef.current === creature.id) return

    previousCreatureIdRef.current = creature.id
    snapToEntryThenSettle(true)
  }, [creature.id, snapToEntryThenSettle])

  useLayoutEffect(() => {
    if (entryReplayToken === handledEntryReplayTokenRef.current) return
    handledEntryReplayTokenRef.current = entryReplayToken

    snapToEntryThenSettle(false)
  }, [entryReplayToken, snapToEntryThenSettle])

  useEffect(() => {
    if (creatureSwitchSettlingRef.current) {
      creatureSwitchSettlingRef.current = false
    } else {
      beginDampedTransition(targetPose)
    }
    backgroundZoomNeutralDistanceRef.current = targetPose.cameraPosition.distanceTo(targetPose.controlsTarget)
    lastBackgroundZoomRef.current = BACKGROUND_BASE_ZOOM
  }, [beginDampedTransition, modelView.id, targetPose])

  useEffect(() => {
    if (handledResetTokenRef.current === resetToken) return

    handledResetTokenRef.current = resetToken
    beginDampedTransition(targetPose)
    lastBackgroundZoomRef.current = BACKGROUND_BASE_ZOOM
  }, [beginDampedTransition, resetToken, targetPose])

  const completeTransition = useCallback((completedState: RigTransitionState) => {
    rigStateRef.current = shouldResumeAutoRotateAfterTransition(completedState)
      ? { phase: 'autoRotating' }
      : { phase: 'idle' }
  }, [])

  const updateAutoRotate = useCallback((delta: number) => {
    const controls = controlsRef.current

    if (!controls) return

    autoRotateOffsetRef.current.copy(camera.position).sub(controls.target)
    autoRotateSphericalRef.current.setFromVector3(autoRotateOffsetRef.current)
    autoRotateSphericalRef.current.theta += delta * ((Math.PI * 2) / AUTO_ROTATE_SECONDS_PER_REVOLUTION)
    camera.position.copy(controls.target).add(autoRotateOffsetRef.current.setFromSpherical(autoRotateSphericalRef.current))
    controls.update()
  }, [camera.position])

  const isAutoRotateCompatibleView = useCallback((): boolean => {
    const controls = controlsRef.current
    const stageGroup = stageGroupRef.current

    if (!controls || !stageGroup) return false

    return isAutoRotateCompatiblePose(
      {
        cameraPosition: camera.position,
        controlsTarget: controls.target,
        stagePosition: stageGroup.position,
        stageScale: stageGroup.scale,
      },
      autoRotatePose,
      AUTO_ROTATE_VIEW_EPSILON,
    )
  }, [autoRotatePose, camera.position])

  const beginAutoRotate = useCallback(() => {
    if (isAutoRotateCompatibleView()) {
      rigStateRef.current = { phase: 'autoRotating' }
      return
    }

    beginFixedTransition(
      AUTO_ROTATE_RETURN_DURATION_SECONDS,
      autoRotatePose,
      'auto-rotate-return',
      true,
    )
  }, [autoRotatePose, beginFixedTransition, isAutoRotateCompatibleView])

  useEffect(() => {
    const currentState = rigStateRef.current

    if (!isAutoRotateActive) {
      if (currentState.phase === 'autoRotating') {
        rigStateRef.current = { phase: 'idle' }
        return
      }

      if (currentState.phase !== 'fixedTransition') return

      if (currentState.purpose === 'auto-rotate-return') {
        rigStateRef.current = { phase: 'idle' }
        return
      }

      if (currentState.autoRotateOnComplete) {
        rigStateRef.current = {
          ...currentState,
          autoRotateOnComplete: false,
        }
      }
      return
    }

    backgroundZoomNeutralDistanceRef.current = autoRotatePose.cameraPosition.distanceTo(autoRotatePose.controlsTarget)
    lastBackgroundZoomRef.current = BACKGROUND_BASE_ZOOM

    if (currentState.phase === 'fixedTransition' && currentState.purpose === 'entry-default') {
      rigStateRef.current = {
        ...currentState,
        autoRotateOnComplete: true,
      }
      return
    }

    beginAutoRotate()
  }, [autoRotatePose, beginAutoRotate, isAutoRotateActive])

  useFrame((_, delta) => {
    const stageGroup = stageGroupRef.current
    const controls = controlsRef.current
    const state = rigStateRef.current

    if (state.phase === 'autoRotating') {
      updateAutoRotate(delta)
      return
    }

    if (state.phase !== 'fixedTransition' && state.phase !== 'dampedTransition') return

    const transitionTargetPosition = state.target.cameraPosition
    const transitionTargetControls = state.target.controlsTarget
    const transitionTargetStagePosition = state.target.stagePosition
    const transitionTargetStageScale = state.target.stageScale

    if (state.phase === 'fixedTransition') {
      state.elapsedSeconds += delta
      const progress = THREE.MathUtils.clamp(
        state.elapsedSeconds / state.durationSeconds,
        0,
        1,
      )
      const easedProgress = easeOutExponential(progress)

      camera.position.copy(state.start.cameraPosition).lerp(transitionTargetPosition, easedProgress)
      controls?.target.copy(state.start.controlsTarget).lerp(transitionTargetControls, easedProgress)
      stageGroup?.position.copy(state.start.stagePosition).lerp(transitionTargetStagePosition, easedProgress)
      stageGroup?.scale.copy(state.start.stageScale).lerp(transitionTargetStageScale, easedProgress)
      controls?.update()

      if (progress < 1) return
      camera.position.copy(transitionTargetPosition)
      controls?.target.copy(transitionTargetControls)
      stageGroup?.position.copy(transitionTargetStagePosition)
      stageGroup?.scale.copy(transitionTargetStageScale)
      controls?.update()
      completeTransition(state)
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
      completeTransition(state)
    }
  })

  function handleControlsStart() {
    const previousState = rigStateRef.current
    rigStateRef.current = { phase: 'userInteracting' }

    if (shouldPauseAutoRotateFromState(previousState)) {
      onAutoRotatePause()
    }
  }

  function handleControlsChange() {
    const controls = controlsRef.current
    if (!controls || rigStateRef.current.phase !== 'userInteracting' || !onDepthBackgroundZoomChange) return

    const neutralDistance = backgroundZoomNeutralDistanceRef.current
      || targetPose.cameraPosition.distanceTo(targetPose.controlsTarget)
    const currentDistance = camera.position.distanceTo(controls.target)
    const roundedZoom = computeBackgroundZoom(neutralDistance, currentDistance)

    if (Math.abs(roundedZoom - lastBackgroundZoomRef.current) < BACKGROUND_ZOOM_EPSILON) return
    lastBackgroundZoomRef.current = roundedZoom
    onDepthBackgroundZoomChange(roundedZoom)
  }

  function handleControlsEnd() {
    if (rigStateRef.current.phase === 'userInteracting') {
      rigStateRef.current = { phase: 'idle' }
    }
  }

  return (
    <>
      <group
        ref={stageGroupRef}
        position={initialStagePositionRef.current}
        scale={initialStageScaleRef.current}
      >
        <CreatureModel creature={creature} onError={onModelLoadError} />
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
