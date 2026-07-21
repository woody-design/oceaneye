import { z } from 'zod'
import type { Creature } from '../types/creature'

const nonEmptyString = z.string().trim().min(1)
const contentId = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be a lowercase slug')
const httpUrl = z.string().url().refine(
  (value) => value.startsWith('https://') || value.startsWith('http://'),
  'must use http or https',
)
const finiteNumber = z.number().finite()
const nonNegativeIntegerOrNull = z.number().int().nonnegative().nullable()
const vec3 = z.tuple([finiteNumber, finiteNumber, finiteNumber])

const sourceLinkSchema = z.union([
  httpUrl,
  z.object({
    name: nonEmptyString.optional(),
    url: httpUrl,
  }).strict(),
])

const annotationTranslationSchema = z.object({
  title: nonEmptyString,
  shortText: z.string(),
  body: nonEmptyString,
}).strict()

const conservationTranslationSchema = z.object({
  title: nonEmptyString,
  summary: z.string(),
  body: z.string().optional(),
}).strict()

const vitalsSchema = z.object({
  typicalDepth: nonEmptyString.optional(),
  waterPressure: nonEmptyString.optional(),
  adultLength: nonEmptyString.optional(),
  adultWeight: nonEmptyString.optional(),
}).strict()

const viewPresetSchema = z.object({
  camera: vec3.optional(),
  target: vec3.optional(),
  stagePosition: vec3.optional(),
  scale: finiteNumber.positive().optional(),
  mobileScale: finiteNumber.positive().optional(),
}).strict()

export const zoneIdSchema = z.enum(['sunlight', 'twilight', 'midnight', 'abyssal', 'hadal'])

export const creatureContentSchema = z.object({
  id: contentId,
  commonName: nonEmptyString,
  scientificName: nonEmptyString,
  zone: zoneIdSchema,
  productLayer: nonEmptyString,
  displayDepthMeters: finiteNumber.nonnegative(),
  actualDepthRangeMeters: z.object({
    min: finiteNumber.nonnegative().nullable(),
    max: finiteNumber.nonnegative().nullable(),
    source: httpUrl,
    note: nonEmptyString.optional(),
  }).strict(),
  habitat: nonEmptyString,
  stageSummary: nonEmptyString.optional(),
  summary: nonEmptyString,
  lifeStrategy: z.array(nonEmptyString),
  vitals: vitalsSchema.optional(),
  overviewLinks: z.array(z.object({
    name: nonEmptyString,
    url: httpUrl.optional(),
    status: z.literal('placeholder').optional(),
  }).strict()).optional(),
  conservation: z.object({
    enabled: z.boolean().optional(),
    title: nonEmptyString,
    summary: z.string(),
    body: z.string().optional(),
    sourceUrls: z.array(sourceLinkSchema).min(1),
  }).strict().optional(),
  links: z.object({
    wikipedia: httpUrl.optional(),
    googleImages: httpUrl.optional(),
    primarySource: httpUrl,
  }).strict(),
  model: z.object({
    type: z.enum([
      'procedural-placeholder',
      'ai-assisted-draft',
      'ai-assisted-release-candidate',
      'ai-assisted-human-reviewed',
      'manual-reviewed',
      'reference',
    ]),
    url: z.string().regex(/^\/models\/[a-z0-9]+(?:-[a-z0-9]+)*\.glb$/).optional(),
    scale: finiteNumber.positive(),
    mobileScale: finiteNumber.positive().optional(),
    rotation: vec3.optional(),
    defaultCamera: vec3,
    viewTarget: vec3.optional(),
    stagePosition: vec3.optional(),
    entryView: viewPresetSchema.nullable().optional(),
    viewPresets: z.record(z.string(), viewPresetSchema).optional(),
    quality: z.object({
      triangleCount: nonNegativeIntegerOrNull,
      textureCount: nonNegativeIntegerOrNull,
      fileBytes: nonNegativeIntegerOrNull,
    }).strict(),
  }).strict(),
  annotations: z.array(z.object({
    id: contentId,
    enabled: z.boolean().optional(),
    title: nonEmptyString,
    anchor: vec3,
    anchorSpace: z.enum(['model-space-fallback', 'model-space', 'named-node']).optional(),
    anchorNodeName: nonEmptyString.optional(),
    viewPresetId: nonEmptyString.nullable().optional(),
    shortText: z.string(),
    body: nonEmptyString,
    sourceUrls: z.array(sourceLinkSchema).min(1),
    confidence: z.enum(['low', 'medium', 'medium-high', 'high']),
  }).strict()),
  translations: z.object({
    zh: z.object({
      commonName: nonEmptyString,
      productLayer: nonEmptyString,
      actualDepthRangeNote: nonEmptyString.optional(),
      habitat: nonEmptyString,
      stageSummary: nonEmptyString.optional(),
      summary: nonEmptyString,
      lifeStrategy: z.array(nonEmptyString),
      vitals: vitalsSchema.optional(),
      annotations: z.record(z.string(), annotationTranslationSchema),
      conservation: conservationTranslationSchema.optional(),
    }).strict(),
  }).strict(),
  provenance: z.object({
    modelType: z.enum([
      'procedural-placeholder',
      'ai-assisted-draft',
      'ai-assisted-release-candidate',
      'ai-assisted-human-reviewed',
      'manual-reviewed',
      'reference',
    ]),
    generationProvider: nonEmptyString,
    generationModel: nonEmptyString,
    prompt: nonEmptyString,
    humanEdits: z.array(nonEmptyString),
    reviewStatus: z.enum([
      'draft',
      'source-backed',
      'model-draft',
      'release-candidate',
      'visual-reviewed',
      'science-reviewed',
      'published',
      'needs-revision',
    ]),
    reviewers: z.array(nonEmptyString),
    sourceDossier: z.string().regex(
      /^docs\/(?!.*(?:^|\/)\.\.(?:\/|$))[a-zA-Z0-9][a-zA-Z0-9._/-]*\.md$/,
    ),
  }).strict(),
}).strict()

const zoneStoryCopySchema = z.object({
  title: nonEmptyString,
  mechanism: nonEmptyString,
  body: nonEmptyString,
  backgroundMeaning: nonEmptyString,
  quote: z.object({
    text: nonEmptyString,
    attribution: nonEmptyString,
  }).strict(),
}).strict()

export const zoneContentSchema = zoneStoryCopySchema.extend({
  id: zoneIdSchema,
  sources: z.array(z.object({
    name: nonEmptyString,
    url: httpUrl,
  }).strict()).min(1),
  translations: z.object({
    zh: zoneStoryCopySchema,
  }).strict(),
}).strict()

export type CreatureContent = z.infer<typeof creatureContentSchema>
export type ZoneContent = z.infer<typeof zoneContentSchema>

type AssertTrue<T extends true> = T
export type CreatureContentMatchesRuntime = AssertTrue<CreatureContent extends Creature ? true : false>
