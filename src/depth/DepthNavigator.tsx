import type { Creature, Locale, ZoneId } from '../types/creature'
import { getCreatureText } from '../i18n/creatureText'
import { formatDepth, uiCopy } from '../i18n/locale'
import { getEditorialContent } from '../editorial/editorialContent'
import { depthZones, getDepthZoneLabel } from './depthZones'
import './DepthNavigator.css'

type DepthNavigatorProps = {
  creatures: Creature[]
  selectedCreatureId: string
  activeZoneOverviewId: ZoneId | null
  isEditorialActive: boolean
  onSelectCreature: (creatureId: string) => void
  onSelectZone: (zoneId: ZoneId) => void
  onSelectEditorial: () => void
  locale: Locale
  onLocaleChange: (locale: Locale) => void
}

export function DepthNavigator({
  creatures,
  selectedCreatureId,
  activeZoneOverviewId,
  isEditorialActive,
  onSelectCreature,
  onSelectZone,
  onSelectEditorial,
  locale,
  onLocaleChange,
}: DepthNavigatorProps) {
  const copy = uiCopy[locale]
  const editorial = getEditorialContent(locale)
  const selectedCreature = creatures.find((creature) => creature.id === selectedCreatureId) ?? creatures[0]

  return (
    <aside className="depth-navigator" aria-label={copy.depthNavigator}>
      <div className="depth-track" aria-hidden="true" />
      <div className="zone-list">
        {depthZones.map((zone) => {
          const zoneCreatures = creatures.filter((creature) => creature.zone === zone.id)
          const isZoneOverviewActive = activeZoneOverviewId === zone.id
          const isSelectedCreatureZone = !isEditorialActive && !activeZoneOverviewId && selectedCreature?.zone === zone.id
          return (
            <section
              className={[
                'zone-group',
                isZoneOverviewActive ? 'overview-active' : '',
                isSelectedCreatureZone ? 'creature-zone-active' : '',
              ].filter(Boolean).join(' ')}
              key={zone.id}
            >
              <span
                className="zone-disclosure"
                aria-hidden="true"
              />
              <button
                type="button"
                className="zone-meta"
                onClick={() => onSelectZone(zone.id)}
                aria-pressed={isZoneOverviewActive}
              >
                <span>{getDepthZoneLabel(zone, locale)}</span>
                <small>
                  {formatDepth(zone.depthRangeMeters.min, locale)}
                  {' - '}
                  {zone.depthRangeMeters.max === null ? copy.deeper : formatDepth(zone.depthRangeMeters.max, locale)}
                </small>
              </button>
              {zoneCreatures.length > 0 && (
                <div className="creature-buttons">
                  {zoneCreatures.map((creature) => {
                    const creatureText = getCreatureText(creature, locale)
                    return (
                      <button
                        key={creature.id}
                        type="button"
                        className={
                          !isEditorialActive && !activeZoneOverviewId && creature.id === selectedCreatureId
                            ? 'creature-button active'
                            : 'creature-button'
                        }
                        onClick={() => onSelectCreature(creature.id)}
                      >
                        <span className="creature-name">{creatureText.commonName}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          )
        })}
      </div>
      <div className="navigator-footer">
        <div className="locale-toggle" aria-label={copy.languageLabel}>
          <button
            type="button"
            className={locale === 'en' ? 'active' : ''}
            onClick={() => onLocaleChange('en')}
            aria-pressed={locale === 'en'}
          >
            EN
          </button>
          <button
            type="button"
            className={locale === 'zh' ? 'active' : ''}
            onClick={() => onLocaleChange('zh')}
            aria-pressed={locale === 'zh'}
          >
            中
          </button>
        </div>
        <button
          type="button"
          className={isEditorialActive ? 'editorial-nav-link active' : 'editorial-nav-link'}
          onClick={onSelectEditorial}
          aria-pressed={isEditorialActive}
        >
          {editorial.navLabel}
        </button>
      </div>
    </aside>
  )
}
