import { describe, expect, it } from 'vitest'
import { formatDepth } from './locale'

describe('formatDepth', () => {
  it('formats English depths with meters', () => {
    expect(formatDepth(1200, 'en')).toBe('1,200 m')
  })

  it('formats Chinese depths with localized numerals and unit', () => {
    expect(formatDepth(1200, 'zh')).toBe('1,200 米')
  })
})
