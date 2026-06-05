export type NamedSource = {
  name: string
  url: string
}

export type SourceLinkInput = string | {
  name?: string
  url?: string
}

export function getNamedSources(sourceLinks: SourceLinkInput[] = []): NamedSource[] {
  const seen = new Set<string>()

  return sourceLinks.flatMap((sourceLink) => {
    const url = getSourceUrl(sourceLink)
    if (!url) return []
    if (seen.has(url)) return []
    seen.add(url)

    return {
      name: getSourceLabel(sourceLink, url),
      url,
    }
  })
}

export function getSourceUrls(sourceLinks: SourceLinkInput[] = []): string[] {
  return sourceLinks.flatMap((sourceLink) => {
    const url = getSourceUrl(sourceLink)
    return url ? [url] : []
  })
}

function getSourceUrl(sourceLink: SourceLinkInput): string | null {
  const url = typeof sourceLink === 'string' ? sourceLink : sourceLink.url
  if (!url || !/^https?:\/\//.test(url)) return null
  return url
}

function getSourceLabel(sourceLink: SourceLinkInput, url: string): string {
  if (typeof sourceLink !== 'string' && sourceLink.name?.trim()) {
    return sourceLink.name.trim()
  }

  return getSourceName(url)
}

export function getSourceName(url: string): string {
  const hostname = getHostname(url)

  if (hostname.endsWith('mbari.org')) return 'MBARI'
  if (hostname.endsWith('fisheries.noaa.gov')) return 'NOAA Fisheries'
  if (hostname.endsWith('oceantoday.noaa.gov')) return 'NOAA Ocean Today'
  if (hostname.endsWith('montereybayaquarium.org')) return 'Monterey Bay Aquarium'
  if (hostname.endsWith('animaldiversity.org')) return 'Animal Diversity Web'
  if (hostname.endsWith('fishbase.se') || hostname.endsWith('fishbase.org')) return 'FishBase'
  if (hostname.endsWith('australian.museum')) return 'Australian Museum'
  if (hostname.endsWith('marinespecies.org')) return 'WoRMS'
  if (hostname.endsWith('noaa.gov')) return 'NOAA'
  if (hostname.endsWith('floridamuseum.ufl.edu')) return 'Florida Museum'
  if (hostname.endsWith('pubmed.ncbi.nlm.nih.gov')) return 'PubMed'
  if (hostname.endsWith('fishesofaustralia.net.au')) return 'Fishes of Australia'
  if (hostname.endsWith('frontiersin.org')) return 'Frontiers'
  if (hostname.endsWith('ocean.si.edu')) return 'Smithsonian Ocean'
  if (hostname.endsWith('traffic.org')) return 'Project Seahorse / TRAFFIC'
  if (hostname.endsWith('iucn-seahorse.org')) return 'IUCN Seahorse Specialist Group'
  if (hostname.endsWith('wikipedia.org')) return 'Wikipedia'

  return hostname.replace(/^www\./, '') || 'Source'
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}
