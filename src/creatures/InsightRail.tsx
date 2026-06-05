import { CircleGauge, Link, Ruler, WavesHorizontal, Weight } from 'lucide-react'
import type { Locale } from '../types/creature'
import type { InsightCard, InsightVital, InsightVitalId } from './creatureInsights'
import { uiCopy } from '../i18n/locale'
import './InsightRail.css'

type InsightRailProps = {
  id?: string
  cards: InsightCard[]
  activeCardId: string
  locale: Locale
  onSelectCard: (cardId: string) => void
}

export function InsightRail({ id, cards, activeCardId, locale, onSelectCard }: InsightRailProps) {
  const copy = uiCopy[locale]

  return (
    <aside id={id} className="insight-rail" aria-label={copy.creatureKnowledge}>
      <div className="insight-stack">
        {cards.map((card) => (
          <InsightCardItem
            key={card.id}
            card={card}
            isExpanded={card.id === activeCardId}
            locale={locale}
            onSelect={() => onSelectCard(card.id)}
          />
        ))}
      </div>
    </aside>
  )
}

type InsightCardItemProps = {
  card: InsightCard
  isExpanded: boolean
  locale: Locale
  onSelect: () => void
}

function InsightCardItem({ card, isExpanded, locale, onSelect }: InsightCardItemProps) {
  const copy = uiCopy[locale]
  const bodyId = `insight-card-${card.id}`

  return (
    <section className={isExpanded ? 'insight-card expanded' : 'insight-card'}>
      <button
        type="button"
        className="insight-card-header"
        onClick={onSelect}
        aria-expanded={isExpanded}
        aria-controls={bodyId}
      >
        <strong>{card.title}</strong>
      </button>
      <div id={bodyId} className="insight-card-body" hidden={!isExpanded}>
        {card.summary && <p className="insight-summary">{card.summary}</p>}
        {card.body && <p>{card.body}</p>}
        {card.vitals && <InsightVitals vitals={card.vitals} ariaLabel={copy.vitals} />}
        {card.details && (
          <dl className="insight-details">
            {card.details.map((detail) => (
              <div key={detail.label}>
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {card.chips && (
          <div className="insight-chip-list" aria-label={copy.lifeStrategies}>
            {card.chips.map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </div>
        )}
        {card.links && card.links.length > 0 && (
          <div className="insight-link-list" aria-label={copy.sources}>
            {card.links.map((link) => {
              if (!link.url) {
                return <span key={`placeholder:${link.name}`}>{link.name}</span>
              }

              return (
                <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
                  <Link size={14} />
                  {link.name}
                </a>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

type InsightVitalsProps = {
  vitals: InsightVital[]
  ariaLabel: string
}

function InsightVitals({ vitals, ariaLabel }: InsightVitalsProps) {
  return (
    <div className="insight-vitals" aria-label={ariaLabel}>
      {vitals.map((vital) => {
        const Icon = getVitalIcon(vital.id)
        const valueClassName = vital.status === 'unknown'
          ? 'insight-vital-value unknown'
          : 'insight-vital-value'

        return (
          <div key={vital.id} className="insight-vital">
            <Icon className="insight-vital-icon" size={12} strokeWidth={2} aria-hidden="true" />
            <div className="insight-vital-value-row">
              <span className={valueClassName}>{vital.value}</span>
              {vital.unit && <span className="insight-vital-unit">{vital.unit}</span>}
            </div>
            <span className="insight-vital-label">{vital.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function getVitalIcon(id: InsightVitalId) {
  switch (id) {
    case 'typical-depth':
      return WavesHorizontal
    case 'pressure':
      return CircleGauge
    case 'adult-length':
      return Ruler
    case 'adult-weight':
      return Weight
  }
}
