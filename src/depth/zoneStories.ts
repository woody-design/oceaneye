import type { Locale, ZoneId } from '../types/creature'
import type { NamedSource } from '../i18n/sources'

type ZoneStoryQuote = {
  text: string
  attribution: string
}

type ZoneStoryCopy = {
  title: string
  mechanism: string
  body: string
  backgroundMeaning: string
  quote: ZoneStoryQuote
}

type ZoneStoryRecord = ZoneStoryCopy & {
  id: ZoneId
  sources: NamedSource[]
  translations: {
    zh: ZoneStoryCopy
  }
}

export type ZoneStory = ZoneStoryCopy & {
  id: ZoneId
  sources: NamedSource[]
}

type ZoneStoryJsonModule = {
  default: ZoneStoryRecord
}

const zoneStoryModules = import.meta.glob<ZoneStoryJsonModule>(
  '../../content/zones/*.json',
  { eager: true },
)

const zoneStories = Object.fromEntries(
  Object.values(zoneStoryModules).map((module) => [module.default.id, module.default]),
) as Record<ZoneId, ZoneStoryRecord>

export function getZoneStory(zoneId: ZoneId, locale: Locale): ZoneStory {
  const story = zoneStories[zoneId]
  const copy = locale === 'zh' ? story.translations.zh : story

  return {
    id: story.id,
    title: copy.title,
    mechanism: copy.mechanism,
    body: copy.body,
    backgroundMeaning: copy.backgroundMeaning,
    quote: copy.quote,
    sources: story.sources,
  }
}
