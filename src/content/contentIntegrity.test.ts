/// <reference types="node" />

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { ZodType } from 'zod'
import { depthZones } from '../depth/depthZones'
import {
  creatureContentSchema,
  zoneContentSchema,
  type CreatureContent,
  type ZoneContent,
} from './contentSchema'

const repoRoot = process.cwd()
const creatureContentDir = path.join(repoRoot, 'content/creatures')
const zoneContentDir = path.join(repoRoot, 'content/zones')
const publicDir = path.join(repoRoot, 'public')
const docsDir = path.join(repoRoot, 'docs')
const cloudflarePagesFileLimitBytes = 25 * 1024 * 1024

function readJsonFiles<T>(directory: string, schema: ZodType<T>): Array<{ fileName: string; value: T }> {
  const fileNames = readdirSync(directory)
    .filter((fileName) => fileName.endsWith('.json'))
    .sort()

  expect(fileNames.length, `${path.relative(repoRoot, directory)} must contain JSON records`).toBeGreaterThan(0)

  return fileNames.map((fileName) => {
    const filePath = path.join(directory, fileName)
    const relativePath = path.relative(repoRoot, filePath)
    let parsed: unknown

    try {
      parsed = JSON.parse(readFileSync(filePath, 'utf8'))
    } catch (error) {
      throw new Error(
        `${relativePath}: invalid JSON (${error instanceof Error ? error.message : String(error)})`,
        { cause: error },
      )
    }

    const result = schema.safeParse(parsed)
    if (!result.success) {
      const details = result.error?.issues
        .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
        .join('\n')
      throw new Error(`${relativePath}: content contract failed\n${details}`)
    }

    return { fileName, value: result.data }
  })
}

function expectUnique(values: string[], label: string): void {
  expect(new Set(values).size, `${label} must be unique`).toBe(values.length)
}

function publicPath(relativeUrl: string): string {
  return path.join(publicDir, relativeUrl.replace(/^\//, ''))
}

describe('content integrity', () => {
  const creatureRecords = readJsonFiles<CreatureContent>(creatureContentDir, creatureContentSchema)
  const zoneRecords = readJsonFiles<ZoneContent>(zoneContentDir, zoneContentSchema)

  it('keeps every creature and zone record schema-valid and uniquely named', () => {
    expectUnique(creatureRecords.map(({ value }) => value.id), 'creature ids')
    expectUnique(zoneRecords.map(({ value }) => value.id), 'zone ids')

    creatureRecords.forEach(({ fileName, value }) => {
      expect(path.basename(fileName, '.json'), `${fileName}: filename must match id`).toBe(value.id)
    })
    zoneRecords.forEach(({ fileName, value }) => {
      expect(path.basename(fileName, '.json'), `${fileName}: filename must match id`).toBe(value.id)
    })

    expect(zoneRecords.map(({ value }) => value.id).sort()).toEqual(
      depthZones.map((zone) => zone.id).sort(),
    )
  })

  it('keeps creature relationships, translations, and provenance consistent', () => {
    creatureRecords.forEach(({ fileName, value: creature }) => {
      const zone = depthZones.find((candidate) => candidate.id === creature.zone)
      expect(zone, `${fileName}: zone must exist in the runtime catalog`).toBeDefined()
      expect(creature.displayDepthMeters, `${fileName}: display depth must be within its zone`).toBeGreaterThanOrEqual(zone!.depthRangeMeters.min)
      if (zone!.depthRangeMeters.max !== null) {
        expect(creature.displayDepthMeters, `${fileName}: display depth must be within its zone`).toBeLessThanOrEqual(zone!.depthRangeMeters.max)
      }

      const { min, max } = creature.actualDepthRangeMeters
      if (min !== null && max !== null) {
        expect(min, `${fileName}: actual depth min must not exceed max`).toBeLessThanOrEqual(max)
      }
      if (min !== null) {
        expect(creature.displayDepthMeters, `${fileName}: display depth must not be shallower than the sourced range`).toBeGreaterThanOrEqual(min)
      }
      if (max !== null) {
        expect(creature.displayDepthMeters, `${fileName}: display depth must not be deeper than the sourced range`).toBeLessThanOrEqual(max)
      }

      expect(creature.model.type, `${fileName}: model and provenance types must agree`).toBe(creature.provenance.modelType)
      const dossierPath = path.resolve(repoRoot, creature.provenance.sourceDossier)
      expect(dossierPath.startsWith(`${docsDir}${path.sep}`), `${fileName}: source dossier must stay within docs/`).toBe(true)
      expect(existsSync(dossierPath), `${fileName}: source dossier must exist`).toBe(true)
      expect(statSync(dossierPath).isFile(), `${fileName}: source dossier must be a regular file`).toBe(true)

      const annotationIds = creature.annotations.map((annotation) => annotation.id)
      expectUnique(annotationIds, `${fileName} annotation ids`)
      expect(Object.keys(creature.translations.zh.annotations).sort(), `${fileName}: Chinese annotation translations must match annotations`).toEqual(annotationIds.sort())

      creature.annotations.forEach((annotation) => {
        if (annotation.anchorSpace === 'named-node') {
          expect(annotation.anchorNodeName, `${fileName}: named-node annotation ${annotation.id} needs anchorNodeName`).toBeTruthy()
        }
        if (annotation.viewPresetId) {
          expect(creature.model.viewPresets?.[annotation.viewPresetId], `${fileName}: annotation ${annotation.id} references a missing view preset`).toBeDefined()
        }
      })

      if (creature.conservation) {
        expect(creature.translations.zh.conservation, `${fileName}: conservation needs a Chinese translation`).toBeDefined()
      }
    })
  })

  it('keeps published GLBs and decoder assets deployable', () => {
    const modelUrls = creatureRecords
      .map(({ value }) => value.model.url)
      .filter((url): url is string => Boolean(url))
    expectUnique(modelUrls, 'model URLs')

    creatureRecords.forEach(({ fileName, value: creature }) => {
      const modelUrl = creature.model.url
      if (!modelUrl) return

      const modelPath = publicPath(modelUrl)
      expect(existsSync(modelPath), `${fileName}: model file must exist`).toBe(true)

      const fileStats = statSync(modelPath)
      expect(fileStats.size, `${fileName}: model quality.fileBytes must match the deployed file`).toBe(creature.model.quality.fileBytes)
      expect(fileStats.size, `${fileName}: model must stay below the Cloudflare Pages file limit`).toBeLessThan(cloudflarePagesFileLimitBytes)

      const header = readFileSync(modelPath).subarray(0, 12)
      expect(header.readUInt32LE(0), `${fileName}: model must have the GLB magic header`).toBe(0x46546c67)
      expect(header.readUInt32LE(4), `${fileName}: model must use glTF 2`).toBe(2)
      expect(header.readUInt32LE(8), `${fileName}: GLB declared length must match the file`).toBe(fileStats.size)
    })

    const decoderAssets = [
      'draco/draco_decoder.js',
      'draco/draco_decoder.wasm',
      'draco/draco_wasm_wrapper.js',
      'basis/basis_transcoder.js',
      'basis/basis_transcoder.wasm',
    ]

    decoderAssets.forEach((assetPath) => {
      expect(existsSync(path.join(publicDir, assetPath)), `public/${assetPath} must exist`).toBe(true)
    })
  })
})
