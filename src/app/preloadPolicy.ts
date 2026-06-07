export type NetworkConnectionLike = {
  saveData?: boolean
  effectiveType?: string
}

const constrainedEffectiveTypes = new Set(['slow-2g', '2g', '3g'])

export function shouldEagerPreloadAll(connection?: NetworkConnectionLike | null): boolean {
  if (connection?.saveData === true) return false

  return !constrainedEffectiveTypes.has(connection?.effectiveType ?? '')
}
