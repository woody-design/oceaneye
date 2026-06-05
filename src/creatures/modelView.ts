import type { Creature } from '../types/creature'

type Vec3 = [number, number, number]

export type CreatureModelView = {
  id: string
  source: 'default' | 'entry' | 'preset' | 'anchor-fallback'
  cameraPosition: Vec3
  controlsTarget: Vec3
  stagePosition: Vec3
  stageScale: number
}

export const DEFAULT_STAGE_POSITION: Vec3 = [0.8, -0.25, 0]
export const STAGE_SCALE_MULTIPLIER = 1.9

export function getCreatureModelView(creature: Creature, viewPresetId?: string): CreatureModelView {
  const preset = viewPresetId ? creature.model.viewPresets?.[viewPresetId] : undefined
  const annotation = viewPresetId
    ? creature.annotations.find((item) => item.id === viewPresetId || item.viewPresetId === viewPresetId)
    : undefined
  const fallbackView = !preset && annotation ? getAnchorFallbackView(creature, annotation.anchor) : undefined
  const defaultStagePosition = getCreatureStagePosition(creature)
  const defaultControlsTarget = getCreatureControlsTarget(creature)
  const source = preset ? 'preset' : fallbackView ? 'anchor-fallback' : 'default'

  return {
    id: source === 'default' ? 'default' : viewPresetId ?? 'default',
    source,
    cameraPosition: preset?.camera ?? fallbackView?.cameraPosition ?? creature.model.defaultCamera,
    controlsTarget: preset?.target ?? fallbackView?.controlsTarget ?? defaultControlsTarget,
    stagePosition: preset?.stagePosition ?? defaultStagePosition,
    stageScale: getRuntimeStageScale(preset?.scale ?? creature.model.scale),
  }
}

export function getCreatureEntryModelView(creature: Creature): CreatureModelView {
  const entryView = creature.model.entryView
  const defaultStagePosition = getCreatureStagePosition(creature)
  const defaultControlsTarget = getCreatureControlsTarget(creature)

  return {
    id: 'entry',
    source: 'entry',
    cameraPosition: entryView?.camera ?? creature.model.defaultCamera,
    controlsTarget: entryView?.target ?? defaultControlsTarget,
    stagePosition: entryView?.stagePosition ?? defaultStagePosition,
    stageScale: getRuntimeStageScale(entryView?.scale ?? creature.model.scale),
  }
}

export function getAuthoredStageScale(runtimeStageScale: number): number {
  return runtimeStageScale / STAGE_SCALE_MULTIPLIER
}

export function getRuntimeStageScale(authoredScale: number): number {
  return authoredScale * STAGE_SCALE_MULTIPLIER
}

function getCreatureStagePosition(creature: Creature): Vec3 {
  return creature.model.stagePosition ?? DEFAULT_STAGE_POSITION
}

function getCreatureControlsTarget(creature: Creature): Vec3 {
  return creature.model.viewTarget ?? getCreatureStagePosition(creature)
}

function getAnchorFallbackView(creature: Creature, anchor: Vec3): Pick<CreatureModelView, 'cameraPosition' | 'controlsTarget'> {
  const defaultStagePosition = getCreatureStagePosition(creature)
  const defaultTarget = getCreatureControlsTarget(creature)
  const stageScale = getRuntimeStageScale(creature.model.scale)
  const focusStrength = 0.32
  const zoomStrength = 0.78
  const controlsTarget: Vec3 = [
    defaultStagePosition[0] + anchor[0] * stageScale * focusStrength,
    defaultStagePosition[1] + anchor[1] * stageScale * focusStrength,
    defaultStagePosition[2] + anchor[2] * stageScale * focusStrength,
  ]
  const defaultOffset: Vec3 = [
    creature.model.defaultCamera[0] - defaultTarget[0],
    creature.model.defaultCamera[1] - defaultTarget[1],
    creature.model.defaultCamera[2] - defaultTarget[2],
  ]

  return {
    controlsTarget,
    cameraPosition: [
      controlsTarget[0] + defaultOffset[0] * zoomStrength,
      controlsTarget[1] + defaultOffset[1] * zoomStrength,
      controlsTarget[2] + defaultOffset[2] * zoomStrength,
    ],
  }
}
