import { Link } from 'lucide-react'
import type { Locale } from '../types/creature'
import type { EditorialLink } from './editorialContent'
import { getEditorialContent } from './editorialContent'
import '../creatures/InsightRail.css'
import '../depth/ZoneSourceRail.css'
import './Editorial.css'

type EditorialRailProps = {
  id?: string
  locale: Locale
}

export function EditorialRail({ id, locale }: EditorialRailProps) {
  const content = getEditorialContent(locale)

  return (
    <aside id={id} className="insight-rail editorial-rail" aria-label={content.railLabel}>
      <div className="zone-source-panel editorial-link-panel">
        <section className="editorial-link-group editorial-quote-group">
          <strong>{content.quote.title}</strong>
          <p>{content.quote.body}</p>
        </section>

        <div className="editorial-link-group">
          <strong>{content.personalLinks.title}</strong>
          <div className="editorial-link-list">
            {content.personalLinks.links.map((link) => (
              <EditorialLinkItem key={link.label} link={link} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}

function EditorialLinkItem({ link }: { link: EditorialLink }) {
  if (!link.href) {
    return (
      <span className="editorial-link-placeholder">
        {link.label}
        {link.note && <small>{link.note}</small>}
      </span>
    )
  }

  if (link.href.startsWith('mailto:')) {
    return (
      <a href={link.href}>
        <Link size={14} />
        {link.label}
      </a>
    )
  }

  return (
    <a href={link.href} target="_blank" rel="noreferrer">
      <Link size={14} />
      {link.label}
    </a>
  )
}
