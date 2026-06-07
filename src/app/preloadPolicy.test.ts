import { describe, expect, it } from 'vitest'
import { shouldEagerPreloadAll } from './preloadPolicy'

describe('shouldEagerPreloadAll', () => {
  it('respects saveData', () => {
    expect(shouldEagerPreloadAll({ saveData: true, effectiveType: '4g' })).toBe(false)
  })

  it('blocks eager preload on 2g', () => {
    expect(shouldEagerPreloadAll({ effectiveType: '2g' })).toBe(false)
  })

  it('blocks eager preload on slow-2g', () => {
    expect(shouldEagerPreloadAll({ effectiveType: 'slow-2g' })).toBe(false)
  })

  it('blocks eager preload on 3g', () => {
    expect(shouldEagerPreloadAll({ effectiveType: '3g' })).toBe(false)
  })

  it('allows eager preload on 4g', () => {
    expect(shouldEagerPreloadAll({ effectiveType: '4g' })).toBe(true)
  })

  it('allows eager preload when the connection is unknown', () => {
    expect(shouldEagerPreloadAll()).toBe(true)
  })

  it('allows eager preload for an empty connection object', () => {
    expect(shouldEagerPreloadAll({})).toBe(true)
  })
})
