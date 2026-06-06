/// <reference types="node" />

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Creature, ZoneId } from '../types/creature'

type JsonObject = Record<string, unknown>
type CreatureJson = Partial<Creature> & JsonObject

const creatureContentDir = path.join(process.cwd(), 'content/creatures')
const publicDir = path.join(process.cwd(), 'public')
const zoneIds = ['sunlight', 'twilight', 'midnight', 'abyssal', 'hadal'] as const satisfies ZoneId[]
const zoneIdSet = new Set<ZoneId>(zoneIds)

function fieldMessage(file: string, field: string, requirement: string): string {
  return `${file}: ${field} ${requirement}`
}

function assertObject(value: unknown, file: string, field: string): asserts value is JsonObject {
  expect(
    typeof value === 'object' && value !== null && !Array.isArray(value),
    fieldMessage(file, field, 'must be an object'),
  ).toBe(true)
}

function assertNonEmptyString(value: unknown, file: string, field: string): asserts value is string {
  expect(
    typeof value === 'string' && value.trim().length > 0,
    fieldMessage(file, field, 'must be a non-empty string'),
  ).toBe(true)
}

function assertFiniteNumber(value: unknown, file: string, field: string): asserts value is number {
  expect(
    typeof value === 'number' && Number.isFinite(value),
    fieldMessage(file, field, 'must be a finite number'),
  ).toBe(true)
}

function assertCameraVector(
  value: unknown,
  file: string,
  field: string,
): asserts value is [number, number, number] {
  expect(
    Array.isArray(value)
      && value.length === 3
      && value.every((coordinate) => typeof coordinate === 'number' && Number.isFinite(coordinate)),
    fieldMessage(file, field, 'must be an array of exactly 3 finite numbers'),
  ).toBe(true)
}

function readCreatureJson(fileName: string): CreatureJson {
  const file = `content/creatures/${fileName}`
  const filePath = path.join(creatureContentDir, fileName)
  let parsed: unknown

  try {
    parsed = JSON.parse(readFileSync(filePath, 'utf8'))
  } catch (error) {
    throw new Error(
      fieldMessage(file, 'json', `must parse (${error instanceof Error ? error.message : String(error)})`),
      { cause: error },
    )
  }

  assertObject(parsed, file, 'root')
  return parsed as CreatureJson
}

function assertModelUrlExists(modelUrl: string, file: string): void {
  const publicRelativePath = modelUrl.startsWith('/') ? modelUrl.slice(1) : modelUrl
  const modelPath = path.join(publicDir, publicRelativePath)

  expect(
    existsSync(modelPath),
    fieldMessage(file, 'model.url', `must reference an existing file (${path.join('public', publicRelativePath)})`),
  ).toBe(true)
}

describe('creature content integrity', () => {
  it('keeps load-bearing creature JSON fields valid', () => {
    const fileNames = readdirSync(creatureContentDir)
      .filter((fileName) => fileName.endsWith('.json'))
      .sort()
    const idsByFile = new Map<string, string>()

    for (const fileName of fileNames) {
      const file = `content/creatures/${fileName}`
      const creature = readCreatureJson(fileName)

      const id = creature.id
      assertNonEmptyString(id, file, 'id')
      expect(
        idsByFile.has(id),
        fieldMessage(file, 'id', `must be unique; duplicate "${id}" first appears in ${idsByFile.get(id)}`),
      ).toBe(false)
      idsByFile.set(id, file)

      const zone = creature.zone
      expect(
        typeof zone === 'string' && zoneIdSet.has(zone as ZoneId),
        fieldMessage(file, 'zone', `must be one of ${zoneIds.join(' | ')}`),
      ).toBe(true)

      assertFiniteNumber(creature.displayDepthMeters, file, 'displayDepthMeters')

      const model = creature.model
      assertObject(model, file, 'model')
      assertFiniteNumber(model.scale, file, 'model.scale')
      assertCameraVector(model.defaultCamera, file, 'model.defaultCamera')

      if (Object.hasOwn(model, 'url')) {
        const modelUrl = model.url
        expect(
          typeof modelUrl === 'string',
          fieldMessage(file, 'model.url', 'must be a string when present'),
        ).toBe(true)

        if (typeof modelUrl === 'string') {
          assertModelUrlExists(modelUrl, file)
        }
      }

      expect(
        Array.isArray(creature.annotations),
        fieldMessage(file, 'annotations', 'must be an array'),
      ).toBe(true)

      assertObject(creature.links, file, 'links')
    }
  })
})
