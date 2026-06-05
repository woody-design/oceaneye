import type { PointerEvent } from 'react'
import type { DepthZone, Locale } from '../types/creature'
import { getDepthMusicTrack } from './depthMusic'
import { formatDepth, uiCopy } from '../i18n/locale'
import { StageMusicLink } from '../creatures/StageMusicLink'
import type { ZoneStory } from './zoneStories'
import '../creatures/CreatureStage.css'

type ZoneOverviewStageProps = {
  zone: DepthZone
  story: ZoneStory
  locale: Locale
}

export function ZoneOverviewStage({ zone, story, locale }: ZoneOverviewStageProps) {
  const copy = uiCopy[locale]
  const zoneRange = formatZoneRange(zone, locale)
  const musicTrack = getDepthMusicTrack(zone.id)

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    const target = event.target
    if (target instanceof Element && target.closest('.stage-music-link')) return
    event.currentTarget.focus({ preventScroll: true })
  }

  return (
    <section
      className="creature-stage zone-overview-stage"
      tabIndex={0}
      aria-label={`${story.title} ${copy.zoneOverviewAriaSuffix}`}
      onPointerDownCapture={handlePointerDown}
    >
      <div className="zone-overview-copy">
        <span className="zone-overview-kicker">
          <span className="science-value">{zoneRange}</span>
        </span>
        <h1>{story.title}</h1>
        <p>{story.body}</p>
        <figure className="zone-overview-quote">
          <blockquote>{story.quote.text}</blockquote>
          <figcaption>{story.quote.attribution}</figcaption>
        </figure>
      </div>
      {musicTrack ? <StageMusicLink track={musicTrack} locale={locale} /> : null}
    </section>
  )
}

function formatZoneRange(zone: DepthZone, locale: Locale): string {
  const minDepthMeters = zone.depthRangeMeters.min
  const minDepth = formatDepth(minDepthMeters, locale)
  const minFeet = formatFeet(minDepthMeters, locale)

  if (zone.depthRangeMeters.max === null) {
    return locale === 'zh'
      ? `${minDepth}+（${minFeet}+）`
      : `${minDepth}+ (${minFeet}+)`
  }

  const maxDepth = formatDepth(zone.depthRangeMeters.max, locale)
  const maxFeet = formatFeet(zone.depthRangeMeters.max, locale)

  return `${minDepth} - ${maxDepth} (${minFeet} - ${maxFeet})`
}

function formatFeet(depthMeters: number, locale: Locale): string {
  const depthFeet = Math.round(depthMeters * 3.28084)
  const formatted = depthFeet.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')

  return locale === 'zh'
    ? `${formatted} 英尺`
    : `${formatted} ft`
}
