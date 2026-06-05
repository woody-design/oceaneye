import { Link } from 'lucide-react'
import type { Locale } from '../types/creature'
import { uiCopy } from '../i18n/locale'
import type { ZoneStory } from './zoneStories'
import '../creatures/InsightRail.css'
import './ZoneSourceRail.css'

type ZoneSourceRailProps = {
  id?: string
  story: ZoneStory
  locale: Locale
}

export function ZoneSourceRail({
  id,
  story,
  locale,
}: ZoneSourceRailProps) {
  const copy = uiCopy[locale]

  return (
    <aside id={id} className="insight-rail zone-source-rail" aria-label={copy.zoneSources}>
      <div className="zone-source-panel">
        <div className="zone-source-heading">
          <strong>{copy.reference}</strong>
        </div>
        <div className="zone-source-links" aria-label={copy.sources}>
          {story.sources.map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
              <Link size={14} />
              {source.name}
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}
