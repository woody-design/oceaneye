import { describe, expect, it } from 'vitest'
import { getNamedSources, getSourceName, getSourceUrls } from './sources'

describe('source helpers', () => {
  it('dedupes named sources by URL and respects explicit names', () => {
    expect(getNamedSources([
      'https://www.mbari.org/animal/example',
      { name: '  Field guide  ', url: 'https://example.com/guide' },
      'https://www.mbari.org/animal/example',
      { url: 'ftp://example.com/file' },
    ])).toEqual([
      { name: 'MBARI', url: 'https://www.mbari.org/animal/example' },
      { name: 'Field guide', url: 'https://example.com/guide' },
    ])
  })

  it('maps known hostnames to source labels', () => {
    expect(getSourceName('https://www.fisheries.noaa.gov/species/orca')).toBe('NOAA Fisheries')
    expect(getSourceName('https://fishbase.org/summary/example')).toBe('FishBase')
    expect(getSourceName('https://www.example.org/page')).toBe('example.org')
  })

  it('filters non-http source URLs', () => {
    expect(getSourceUrls([
      'https://example.com/a',
      'http://example.com/b',
      'mailto:team@example.com',
      '/relative/path',
      { url: 'ftp://example.com/file' },
      { url: 'https://example.com/c' },
    ])).toEqual([
      'https://example.com/a',
      'http://example.com/b',
      'https://example.com/c',
    ])
  })
})
