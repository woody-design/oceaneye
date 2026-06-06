export type ZoneId = 'sunlight' | 'twilight' | 'midnight' | 'abyssal' | 'hadal'

export type ReviewStatus =
  | 'draft'
  | 'source-backed'
  | 'model-draft'
  | 'release-candidate'
  | 'visual-reviewed'
  | 'science-reviewed'
  | 'published'
  | 'needs-revision'

export type ModelType =
  | 'procedural-placeholder'
  | 'ai-assisted-draft'
  | 'ai-assisted-release-candidate'
  | 'ai-assisted-human-reviewed'
  | 'manual-reviewed'
  | 'reference'

export type DepthRange = {
  min: number | null
  max: number | null
  source: string
  note?: string
}

export type Locale = 'zh' | 'en'

export type AnnotationTranslation = {
  title: string
  shortText: string
  body: string
}

export type CreatureSourceLink = string | {
  name?: string
  url?: string
}

export type Annotation = {
  id: string
  enabled?: boolean
  title: string
  anchor: [number, number, number]
  anchorSpace?: 'model-space-fallback' | 'model-space' | 'named-node'
  anchorNodeName?: string
  viewPresetId?: string | null
  shortText: string
  body: string
  sourceUrls: CreatureSourceLink[]
  confidence: 'low' | 'medium' | 'medium-high' | 'high'
}

export type ConservationInfo = {
  enabled?: boolean
  title: string
  summary: string
  body?: string
  sourceUrls: CreatureSourceLink[]
}

export type ConservationTranslation = {
  title: string
  summary: string
  body?: string
}

export type CreatureVitalId = 'typicalDepth' | 'waterPressure' | 'adultLength' | 'adultWeight'

export type CreatureVitals = Partial<Record<CreatureVitalId, string>>

export type CreatureOverviewLink = {
  name: string
  url?: string
  status?: 'placeholder'
}

export type CreatureTranslation = {
  commonName: string
  productLayer: string
  actualDepthRangeNote?: string
  habitat: string
  stageSummary?: string
  summary: string
  lifeStrategy: string[]
  vitals?: CreatureVitals
  annotations: Record<string, AnnotationTranslation>
  conservation?: ConservationTranslation
}

export type Creature = {
  id: string
  commonName: string
  scientificName: string
  zone: ZoneId
  productLayer: string
  displayDepthMeters: number
  actualDepthRangeMeters: DepthRange
  habitat: string
  stageSummary?: string
  summary: string
  lifeStrategy: string[]
  vitals?: CreatureVitals
  overviewLinks?: CreatureOverviewLink[]
  conservation?: ConservationInfo
  links: {
    wikipedia?: string
    googleImages?: string
    primarySource: string
  }
  model: {
    type: ModelType
    url?: string
    scale: number
    rotation?: [number, number, number]
    defaultCamera: [number, number, number]
    viewTarget?: [number, number, number]
    stagePosition?: [number, number, number]
    entryView?: CreatureViewPreset | null
    viewPresets?: Record<string, CreatureViewPreset>
    quality: {
      triangleCount: number | null
      textureCount: number | null
      fileBytes: number | null
    }
  }
  annotations: Annotation[]
  translations?: {
    zh?: CreatureTranslation
  }
  provenance: {
    modelType: ModelType
    generationProvider: string
    generationModel: string
    prompt: string
    humanEdits: string[]
    reviewStatus: ReviewStatus
    reviewers: string[]
    sourceDossier: string
  }
}

export type CreatureViewPreset = {
  camera?: [number, number, number]
  target?: [number, number, number]
  stagePosition?: [number, number, number]
  scale?: number
}

export type DepthZone = {
  id: ZoneId
  label: string
  translations?: {
    zh?: {
      label: string
      description: string
    }
  }
  depthRangeMeters: {
    min: number
    max: number | null
  }
  description: string
}
