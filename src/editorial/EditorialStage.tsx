import type { Locale } from '../types/creature'
import type { EditorialInlineContent } from './editorialContent'
import { getEditorialContent } from './editorialContent'
import '../creatures/CreatureStage.css'
import './Editorial.css'

type EditorialStageProps = {
  locale: Locale
}

export function EditorialStage({ locale }: EditorialStageProps) {
  const content = getEditorialContent(locale)

  return (
    <section className="creature-stage editorial-stage" tabIndex={0} aria-label={content.title}>
      <div className="editorial-copy">
        <div className="editorial-title-row">
          <h1>{content.title}</h1>
          <EditorialTitleLink
            href={content.githubLink.href}
            label={content.githubLink.label}
            note={content.githubLink.note}
          />
        </div>
        <p className="editorial-subtitle">{content.subtitle}</p>

        {content.sections.map((section) => (
          <section key={section.title} className="editorial-section">
            <h2>{section.title}</h2>
            {section.body?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.items && (
              <ul>
                {section.items.map((item) => (
                  <li key={getInlineContentKey(item)}>
                    <EditorialInlineContentView content={item} />
                  </li>
                ))}
              </ul>
            )}
            {section.links && (
              <div className="editorial-reference-links">
                {section.links.map((link, index) => (
                  <span key={link.href ?? link.label}>
                    {link.href ? (
                      <a href={link.href} target="_blank" rel="noreferrer">
                        {link.label}
                      </a>
                    ) : (
                      link.label
                    )}
                    {index < section.links!.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
      <div className="editorial-credit-line" aria-label={content.credit.ariaLabel}>
        {content.credit.parts.map((part, index) => {
          if (!part.href) {
            return <span key={`${part.text}:${index}`}>{part.text}</span>
          }

          return (
            <a key={`${part.text}:${index}`} href={part.href} target="_blank" rel="noreferrer">
              {part.text}
            </a>
          )
        })}
      </div>
    </section>
  )
}

function EditorialInlineContentView({ content }: { content: EditorialInlineContent }) {
  if (typeof content === 'string') return content

  return (
    <>
      {content.map((part, index) => {
        if (!part.href) {
          return <span key={`${part.text}:${index}`}>{part.text}</span>
        }

        return (
          <a key={`${part.text}:${index}`} href={part.href} target="_blank" rel="noreferrer">
            {part.text}
          </a>
        )
      })}
    </>
  )
}

function getInlineContentKey(content: EditorialInlineContent) {
  if (typeof content === 'string') return content
  return content.map((part) => part.text).join('')
}

function EditorialTitleLink({
  href,
  label,
  note,
}: {
  href?: string
  label: string
  note?: string
}) {
  if (!href) {
    return (
      <span className="editorial-title-link disabled" aria-disabled="true" title={note}>
        {label}
      </span>
    )
  }

  return (
    <a className="editorial-title-link" href={href} target="_blank" rel="noreferrer">
      {label}
    </a>
  )
}
