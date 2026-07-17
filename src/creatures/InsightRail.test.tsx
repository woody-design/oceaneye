// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { InsightCard } from './creatureInsights'
import { InsightRail } from './InsightRail'
import insightRailCss from './InsightRail.css?inline'

const cards: InsightCard[] = [
  {
    id: 'summary',
    kind: 'summary',
    eyebrow: 'Overview',
    title: 'Overview',
    summary: 'Summary content',
    links: [{ name: 'Overview source', url: 'https://example.com/overview' }],
  },
  {
    id: 'knowledge:body',
    kind: 'knowledge',
    eyebrow: 'Knowledge',
    title: 'Body structure',
    summary: 'Body structure content',
    links: [{ name: 'Body source', url: 'https://example.com/body' }],
  },
]

function ControlledInsightRail() {
  const [activeCardId, setActiveCardId] = useState(cards[0].id)

  return (
    <InsightRail
      cards={cards}
      activeCardId={activeCardId}
      locale="en"
      onSelectCard={setActiveCardId}
    />
  )
}

describe('InsightRail', () => {
  let styleElement: HTMLStyleElement

  beforeAll(() => {
    styleElement = document.createElement('style')
    styleElement.textContent = insightRailCss
    document.head.appendChild(styleElement)
  })

  afterAll(() => {
    styleElement.remove()
  })

  it('keeps the hidden override in the authored stylesheet', () => {
    expect(insightRailCss).toMatch(
      /\.insight-card-body\[hidden\]\s*\{[^}]*display:\s*none;/,
    )
  })

  it('keeps collapsed card content hidden while switching the expanded card', async () => {
    const user = userEvent.setup()
    render(<ControlledInsightRail />)

    const overviewButton = screen.getByRole('button', { name: 'Overview' })
    const bodyButton = screen.getByRole('button', { name: 'Body structure' })
    const overviewBody = document.getElementById('insight-card-summary')
    const bodyBody = document.getElementById('insight-card-knowledge:body')

    expect(overviewButton).toHaveAttribute('aria-expanded', 'true')
    expect(overviewBody).not.toHaveAttribute('hidden')
    expect(getComputedStyle(overviewBody!).display).toBe('grid')
    expect(bodyButton).toHaveAttribute('aria-expanded', 'false')
    expect(bodyBody).toHaveAttribute('hidden')
    expect(getComputedStyle(bodyBody!).display).toBe('none')

    await user.click(bodyButton)

    expect(overviewButton).toHaveAttribute('aria-expanded', 'false')
    expect(overviewBody).toHaveAttribute('hidden')
    expect(getComputedStyle(overviewBody!).display).toBe('none')
    expect(bodyButton).toHaveAttribute('aria-expanded', 'true')
    expect(bodyBody).not.toHaveAttribute('hidden')
    expect(getComputedStyle(bodyBody!).display).toBe('grid')
  })
})
