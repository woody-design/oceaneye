import { describe, expect, it } from 'vitest'
import { getCreatureInsightCards } from './creatureInsights'
import { createAnnotation, createCreature } from '../test/creatureFixture'

describe('creature insight cards', () => {
  it('dedupes explicit overview links and filters empty NOAA placeholders', () => {
    const cards = getCreatureInsightCards(createCreature({
      overviewLinks: [
        { name: 'NOAA', status: 'placeholder' },
        { name: 'Google Images', url: 'https://images.google.com/search?q=test' },
        { name: 'Google Images', url: 'https://images.google.com/search?q=test' },
        { name: 'Field note', status: 'placeholder' },
      ],
    }), 'en')

    expect(cards[0].links).toEqual([
      { name: 'Google Images', url: 'https://images.google.com/search?q=test' },
      { name: 'Field note', status: 'placeholder' },
    ])
  })

  it('resolves NOAA from annotation sources and dedupes repeated URLs', () => {
    const noaaUrl = 'https://www.fisheries.noaa.gov/species/test-creature'
    const primarySource = 'https://www.mbari.org/animal/test-creature'
    const cards = getCreatureInsightCards(createCreature({
      links: {
        primarySource,
        googleImages: 'https://images.google.com/search?q=test',
      },
      annotations: [
        createAnnotation({
          sourceUrls: [noaaUrl, primarySource],
        }),
      ],
    }), 'en')
    const summaryLinks = cards[0].links ?? []

    expect(summaryLinks.find((link) => link.name === 'NOAA')?.url).toBe(noaaUrl)
    expect(summaryLinks.filter((link) => link.url === primarySource)).toHaveLength(1)
  })

  it('composes summary, knowledge, and conservation cards', () => {
    const cards = getCreatureInsightCards(createCreature({
      scientificName: 'Testus compositus',
      habitat: 'A quiet slope',
      summary: 'A summary worth keeping.',
      lifeStrategy: ['waits', 'glows'],
      vitals: {
        typicalDepth: '900-1,100 m',
        adultLength: '2 m',
      },
      annotations: [
        createAnnotation({
          id: 'eye',
          title: 'Eye structure',
          shortText: 'A short eye note.',
          body: 'A longer eye note.',
          sourceUrls: ['https://ocean.si.edu/example'],
        }),
        createAnnotation({
          id: 'hidden',
          enabled: false,
        }),
      ],
      conservation: {
        title: 'Least Concern',
        summary: 'Population appears stable.',
        body: 'No major pressure is documented in this fixture.',
        sourceUrls: ['https://www.iucn-seahorse.org/example'],
      },
    }), 'en')

    expect(cards.map((card) => card.kind)).toEqual(['summary', 'knowledge', 'conservation'])
    expect(cards[0]).toMatchObject({
      id: 'summary',
      title: 'Overview',
      summary: 'A summary worth keeping.',
      chips: ['waits', 'glows'],
    })
    expect(cards[0].details).toEqual([
      { label: 'Scientific name', value: 'Testus compositus' },
      { label: 'Habitat', value: 'A quiet slope' },
    ])
    expect(cards[1]).toMatchObject({
      id: 'knowledge:eye',
      title: 'Eye structure',
      summary: 'A short eye note.',
      body: 'A longer eye note.',
      viewPresetId: 'eye',
    })
    expect(cards[2]).toMatchObject({
      id: 'conservation',
      title: 'Least Concern',
      summary: 'Population appears stable.',
      body: 'No major pressure is documented in this fixture.',
    })
  })
})
