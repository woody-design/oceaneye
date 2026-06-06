import { describe, expect, it } from 'vitest'
import {
  getAuthoredStageScale,
  getCreatureModelView,
  getRuntimeStageScale,
} from './modelView'
import { createAnnotation, createCreature } from '../test/creatureFixture'

describe('model view helpers', () => {
  it('round-trips authored and runtime stage scales', () => {
    const authoredScale = 1.35
    expect(getAuthoredStageScale(getRuntimeStageScale(authoredScale))).toBeCloseTo(authoredScale)
  })

  it('resolves default and preset views', () => {
    const creature = createCreature({
      model: {
        scale: 1,
        defaultCamera: [0, 1, 8],
        viewTarget: [0, 0.25, 0],
        stagePosition: [1, 2, 3],
        viewPresets: {
          detail: {
            camera: [2, 3, 4],
            target: [0.5, 0.6, 0.7],
            stagePosition: [-1, -2, -3],
            scale: 2,
          },
        },
      },
    })

    expect(getCreatureModelView(creature)).toMatchObject({
      id: 'default',
      source: 'default',
      cameraPosition: [0, 1, 8],
      controlsTarget: [0, 0.25, 0],
      stagePosition: [1, 2, 3],
      stageScale: 1.9,
    })
    expect(getCreatureModelView(creature, 'detail')).toMatchObject({
      id: 'detail',
      source: 'preset',
      cameraPosition: [2, 3, 4],
      controlsTarget: [0.5, 0.6, 0.7],
      stagePosition: [-1, -2, -3],
      stageScale: 3.8,
    })
  })

  it('derives anchor fallback camera and target positions', () => {
    const creature = createCreature({
      model: {
        scale: 2,
        defaultCamera: [10, 20, 30],
        viewTarget: [0, 0, 0],
        stagePosition: [1, 2, 3],
      },
      annotations: [
        createAnnotation({
          id: 'fallback',
          anchor: [0.5, -1, 0.25],
        }),
      ],
    })
    const view = getCreatureModelView(creature, 'fallback')

    expect(view.source).toBe('anchor-fallback')
    expect(view.controlsTarget[0]).toBeCloseTo(1.608)
    expect(view.controlsTarget[1]).toBeCloseTo(0.784)
    expect(view.controlsTarget[2]).toBeCloseTo(3.304)
    expect(view.cameraPosition[0]).toBeCloseTo(9.408)
    expect(view.cameraPosition[1]).toBeCloseTo(16.384)
    expect(view.cameraPosition[2]).toBeCloseTo(26.704)
  })
})
