import type { Annotation, ConservationInfo, Creature, Locale } from '../types/creature'

export type LocalizedAnnotation = Annotation & {
  title: string
  shortText: string
  body: string
}

export type LocalizedCreatureText = {
  commonName: string
  productLayer: string
  actualDepthRangeNote?: string
  habitat: string
  stageSummary: string
  summary: string
  lifeStrategy: string[]
  vitals?: Creature['vitals']
  conservation?: ConservationInfo
  annotations: LocalizedAnnotation[]
}

export function getCreatureText(creature: Creature, locale: Locale): LocalizedCreatureText {
  const translation = locale === 'zh' ? creature.translations?.zh : undefined

  return {
    commonName: translation?.commonName ?? creature.commonName,
    productLayer: translation?.productLayer ?? creature.productLayer,
    actualDepthRangeNote: translation?.actualDepthRangeNote ?? creature.actualDepthRangeMeters.note,
    habitat: translation?.habitat ?? creature.habitat,
    stageSummary: getLocalizedStageSummary(creature, locale),
    summary: translation?.summary ?? creature.summary,
    lifeStrategy: translation?.lifeStrategy ?? creature.lifeStrategy,
    vitals: localizeVitals(creature, locale),
    conservation: localizeConservation(creature, locale),
    annotations: creature.annotations
      .filter((annotation) => annotation.enabled !== false)
      .map((annotation) => ({
        ...annotation,
        ...(translation?.annotations?.[annotation.id] ?? {}),
      })),
  }
}

function getLocalizedStageSummary(creature: Creature, locale: Locale): string {
  const translation = locale === 'zh' ? creature.translations?.zh : undefined

  return firstNonEmptyString(
    translation?.stageSummary,
    translation?.summary,
    creature.stageSummary,
    creature.summary,
  )
}

function firstNonEmptyString(...values: Array<string | undefined>): string {
  return values.find((value) => value?.trim()) ?? ''
}

function localizeVitals(creature: Creature, locale: Locale): Creature['vitals'] {
  if (!creature.vitals) return undefined
  if (locale !== 'zh') return creature.vitals

  const translatedVitals = creature.translations?.zh?.vitals

  if (!translatedVitals) return creature.vitals

  return {
    ...creature.vitals,
    ...translatedVitals,
  }
}

function localizeConservation(creature: Creature, locale: Locale): ConservationInfo | undefined {
  if (!creature.conservation) return undefined
  if (creature.conservation.enabled === false) return undefined

  const translation = locale === 'zh' ? creature.translations?.zh?.conservation : undefined

  return {
    ...creature.conservation,
    ...translation,
    ...(locale === 'zh' ? { title: '动物保护' } : {}),
  }
}
