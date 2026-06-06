import type { Annotation, Creature } from '../types/creature'

type ModelOverrides = Partial<Omit<Creature['model'], 'quality'>> & {
  quality?: Partial<Creature['model']['quality']>
}

type CreatureOverrides = Partial<Omit<Creature, 'links' | 'model' | 'provenance'>> & {
  links?: Partial<Creature['links']>
  model?: ModelOverrides
  provenance?: Partial<Creature['provenance']>
}

export function createCreature(overrides: CreatureOverrides = {}): Creature {
  const base: Creature = {
    id: 'test-creature',
    commonName: 'Test Creature',
    scientificName: 'Specius testus',
    zone: 'midnight',
    productLayer: 'Test layer',
    displayDepthMeters: 1200,
    actualDepthRangeMeters: {
      min: 1000,
      max: 2000,
      source: 'https://example.com/depth',
    },
    habitat: 'Open water',
    stageSummary: 'Stage summary',
    summary: 'A compact creature summary.',
    lifeStrategy: ['drift patiently'],
    vitals: {
      typicalDepth: '1,000-2,000 m',
    },
    links: {
      primarySource: 'https://example.com/source',
    },
    model: {
      type: 'ai-assisted-human-reviewed',
      url: '/models/test.glb',
      scale: 1,
      defaultCamera: [0, 0, 5],
      quality: {
        triangleCount: null,
        textureCount: null,
        fileBytes: null,
      },
    },
    annotations: [],
    provenance: {
      modelType: 'ai-assisted-human-reviewed',
      generationProvider: 'test',
      generationModel: 'test',
      prompt: 'test',
      humanEdits: [],
      reviewStatus: 'visual-reviewed',
      reviewers: [],
      sourceDossier: 'test',
    },
  }

  return {
    ...base,
    ...overrides,
    links: {
      ...base.links,
      ...overrides.links,
    },
    model: {
      ...base.model,
      ...overrides.model,
      quality: {
        ...base.model.quality,
        ...overrides.model?.quality,
      },
    },
    provenance: {
      ...base.provenance,
      ...overrides.provenance,
    },
  }
}

export function createAnnotation(overrides: Partial<Annotation> = {}): Annotation {
  return {
    id: 'feature',
    title: 'Feature',
    anchor: [0, 0, 0],
    shortText: 'Short note',
    body: 'Longer note',
    sourceUrls: ['https://example.com/source'],
    confidence: 'high',
    ...overrides,
  }
}
