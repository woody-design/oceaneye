import type { Annotation, ConservationInfo, Creature, Locale } from '../types/creature'
import { getCreatureText } from '../i18n/creatureText'
import { uiCopy } from '../i18n/locale'
import { getNamedSources, getSourceUrls } from '../i18n/sources'

export type InsightCardKind = 'summary' | 'knowledge' | 'conservation'

export type InsightCard = {
  id: string
  kind: InsightCardKind
  eyebrow: string
  title: string
  summary?: string
  body?: string
  vitals?: InsightVital[]
  details?: InsightDetail[]
  chips?: string[]
  links?: InsightLink[]
  viewPresetId?: string
}

export type InsightLink = {
  name: string
  url?: string
  status?: 'placeholder'
}

export type InsightVitalId = 'typical-depth' | 'pressure' | 'adult-length' | 'adult-weight'

export type InsightVital = {
  id: InsightVitalId
  label: string
  value: string
  unit?: string
  status?: 'unknown'
}

export type InsightDetail = {
  label: string
  value: string
}

export const SUMMARY_INSIGHT_ID = 'summary'
export const CONSERVATION_INSIGHT_ID = 'conservation'

export function getCreatureInsightCards(creature: Creature, locale: Locale): InsightCard[] {
  const copy = uiCopy[locale]
  const creatureText = getCreatureText(creature, locale)
  const cards: InsightCard[] = [
    {
      id: SUMMARY_INSIGHT_ID,
      kind: 'summary',
      eyebrow: copy.overview,
      title: copy.overview,
      summary: creatureText.summary,
      vitals: getVitals(creatureText.vitals, copy),
      details: [
        { label: copy.scientificName, value: creature.scientificName },
        { label: copy.habitat, value: creatureText.habitat },
      ],
      chips: creatureText.lifeStrategy,
      links: getOverviewLinks(creature, locale),
    },
  ]

  cards.push(
    ...creatureText.annotations.map((annotation, index) => ({
      id: getKnowledgeInsightId(annotation.id),
      kind: 'knowledge' as const,
      eyebrow: `${copy.knowledge} ${index + 1}`,
      title: annotation.title,
      summary: annotation.shortText,
      body: annotation.body,
      links: getNamedSources(annotation.sourceUrls),
      viewPresetId: getAnnotationViewPresetId(annotation, copy.conservation),
    })),
  )

  const conservationCard = getConservationCard(creatureText.conservation, locale)
  if (conservationCard) cards.push(conservationCard)

  return cards
}

function getAnnotationViewPresetId(annotation: Annotation, conservationTitle: string): string | undefined {
  if (annotation.viewPresetId === null) return undefined
  if (isConservationAnnotation(annotation, conservationTitle)) return undefined

  return annotation.viewPresetId ?? annotation.id
}

function isConservationAnnotation(annotation: Annotation, conservationTitle: string): boolean {
  const title = annotation.title.trim().toLocaleLowerCase()
  const localizedConservationTitle = conservationTitle.trim().toLocaleLowerCase()

  return ['conservation', '动物保护', '保护现状', localizedConservationTitle].includes(title)
}

function getVitals(
  vitals: Creature['vitals'],
  copy: {
    typicalDepth: string
    pressure: string
    adultLength: string
    adultWeight: string
    unknown: string
  },
): InsightVital[] {
  return [
    getVital('typical-depth', copy.typicalDepth, vitals?.typicalDepth, copy.unknown),
    getVital('pressure', copy.pressure, vitals?.waterPressure, copy.unknown),
    getVital('adult-length', copy.adultLength, vitals?.adultLength, copy.unknown),
    getVital('adult-weight', copy.adultWeight, vitals?.adultWeight, copy.unknown),
  ]
}

function getVital(
  id: InsightVitalId,
  label: string,
  value: string | undefined,
  unknownLabel: string,
): InsightVital {
  if (!value) {
    return { id, label, value: unknownLabel, status: 'unknown' }
  }

  return {
    id,
    label,
    value,
  }
}

export function getKnowledgeInsightId(annotationId: string): string {
  return `knowledge:${annotationId}`
}

function getConservationCard(conservation: ConservationInfo | undefined, locale: Locale): InsightCard | null {
  const copy = uiCopy[locale]

  if (!conservation) return null

  return {
    id: CONSERVATION_INSIGHT_ID,
    kind: 'conservation',
    eyebrow: copy.conservation,
    title: conservation.title,
    summary: conservation.summary,
    body: conservation.body,
    links: getNamedSources(conservation.sourceUrls),
  }
}

function getOverviewLinks(creature: Creature, locale: Locale): InsightLink[] {
  const copy = uiCopy[locale]
  if (creature.overviewLinks) {
    return dedupeLinks(
      creature.overviewLinks.map((link) => ({
        ...link,
        name: getLocalizedOverviewLinkName(link.name, copy),
      })),
    ).filter(shouldShowOverviewLink)
  }

  const primarySource = creature.links.primarySource
  const activeAnnotations = creature.annotations.filter((annotation) => annotation.enabled !== false)
  const activeConservationSources = creature.conservation?.enabled === false
    ? []
    : creature.conservation?.sourceUrls ?? []
  const activeAnnotationSources = activeAnnotations.flatMap((annotation: Annotation) => annotation.sourceUrls)
  const noaaSource = primarySource && isNoaaUrl(primarySource)
    ? primarySource
    : findNoaaUrl([
      ...getSourceUrls(activeAnnotationSources),
      ...getSourceUrls(activeConservationSources),
    ])
  const primarySourceLink = primarySource && !isNoaaUrl(primarySource)
    ? getNamedSources([primarySource])[0] ?? { name: copy.primarySource, url: primarySource }
    : null

  const links: InsightLink[] = [
    creature.links.googleImages
      ? { name: copy.imageReferences, url: creature.links.googleImages }
      : { name: copy.imageReferences, status: 'placeholder' },
    ...(noaaSource ? [{ name: copy.noaa, url: noaaSource }] : []),
    creature.links.wikipedia
      ? { name: copy.wikipedia, url: creature.links.wikipedia }
      : { name: copy.wikipedia, status: 'placeholder' },
  ]

  if (primarySourceLink) links.push(primarySourceLink)

  links.push(...getNamedSources([
    ...activeAnnotationSources,
    ...activeConservationSources,
  ]))

  return dedupeLinks(links).filter(shouldShowOverviewLink)
}

function isNoaaUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith('noaa.gov')
  } catch {
    return false
  }
}

function findNoaaUrl(urls: string[]): string | undefined {
  return urls.find(isNoaaUrl)
}

function dedupeLinks(links: InsightLink[]): InsightLink[] {
  const seen = new Set<string>()

  return links.filter((link) => {
    const key = link.url ?? `placeholder:${link.name}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function shouldShowOverviewLink(link: InsightLink): boolean {
  return link.url !== undefined || link.name !== 'NOAA'
}

function getLocalizedOverviewLinkName(
  name: string,
  copy: {
    imageReferences: string
  },
): string {
  if (name === 'Google Images') return copy.imageReferences

  return name
}
