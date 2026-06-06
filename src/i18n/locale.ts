import type { Locale } from '../types/creature'

export const DEFAULT_LOCALE: Locale = 'en'
export const PRODUCT_LOCALES: Locale[] = ['en', 'zh']
export const SITE_ORIGIN = 'https://oceaneye.woodydesign.io'

export const uiCopy = {
  zh: {
    depthNavigator: '深度导航',
    creatureKnowledge: '观察笔记',
    zoneOverview: '水层概览',
    zoneOverviewAriaSuffix: '水层概览',
    zoneSources: '水层资料来源',
    knowledge: '知识',
    overview: '概览',
    reference: '参考来源',
    conservation: '保护现状',
    conservationPlaceholderSummary: '保护状态与人类影响信息仍在复核中。',
    references: '延伸阅读',
    sources: '来源',
    noaa: 'NOAA',
    habitat: '栖息地',
    scientificName: '学名',
    vitals: '基本数据',
    typicalDepth: '深度范围',
    pressure: '环境水压',
    adultLength: '成年体长',
    adultWeight: '成年体重',
    unknown: '未知',
    primarySource: '主要来源',
    imageReferences: '谷歌图片',
    wikipedia: 'Wikipedia',
    deeper: '更深',
    depthRangeUnderReview: '范围待复核',
    dragToRotate: '拖动旋转',
    panView: '右键或双指平移',
    chooseInsight: '选择右侧卡片观察',
    stageAriaSuffix: '3D 展示区',
    stageInteractionHints: [
      { action: '左键拖动', separator: ':', result: '旋转' },
      { action: '右键拖动', separator: ':', result: '移动视角' },
      { action: '滚轮', separator: ':', result: '缩放' },
    ],
    lifeStrategies: '生命策略',
    autoRotate: '自动旋转',
    pauseAutoRotate: '暂停自动旋转',
    resumeAutoRotate: '继续自动旋转',
    resetView: '重置视角',
    openSpotify: '在 Spotify 打开',
    openRightPanel: '打开右侧面板',
    closeRightPanel: '关闭右侧面板',
  },
  en: {
    depthNavigator: 'Depth navigator',
    creatureKnowledge: 'Observation notes',
    zoneOverview: 'Zone overview',
    zoneOverviewAriaSuffix: 'zone overview',
    zoneSources: 'Zone sources',
    knowledge: 'Knowledge',
    overview: 'Overview',
    reference: 'Reference',
    conservation: 'Conservation',
    conservationPlaceholderSummary: 'Conservation status and human pressure notes are under review.',
    references: 'Further reading',
    sources: 'Sources',
    noaa: 'NOAA',
    habitat: 'Habitat',
    scientificName: 'Scientific name',
    vitals: 'Vitals',
    typicalDepth: 'Depth range',
    pressure: 'Water pressure',
    adultLength: 'Adult length',
    adultWeight: 'Adult weight',
    unknown: 'Unknown',
    primarySource: 'Primary source',
    imageReferences: 'Google Images',
    wikipedia: 'Wikipedia',
    deeper: 'deeper',
    depthRangeUnderReview: 'Range under review',
    dragToRotate: 'Drag to rotate',
    panView: 'Right-drag or two-finger pan',
    chooseInsight: 'Choose a note to inspect',
    stageAriaSuffix: '3D stage',
    stageInteractionHints: [
      { action: 'Drag', separator: 'to', result: 'Rotate' },
      { action: 'Right mouse drag', separator: 'to', result: 'Move' },
      { action: 'Scroll', separator: 'to', result: 'Zoom' },
    ],
    lifeStrategies: 'life strategies',
    autoRotate: 'Auto Rotate',
    pauseAutoRotate: 'Pause Auto Rotate',
    resumeAutoRotate: 'Resume Auto Rotate',
    resetView: 'Reset',
    openSpotify: 'Open Spotify',
    openRightPanel: 'Open right panel',
    closeRightPanel: 'Close right panel',
  },
} as const

export function isLocale(value: string | null): value is Locale {
  return PRODUCT_LOCALES.includes(value as Locale)
}

export function getLocaleFromPathname(pathname: string): Locale | null {
  const firstSegment = pathname.split('/').filter(Boolean)[0] ?? null
  return isLocale(firstSegment) ? firstSegment : null
}

export function getCurrentLocale(): Locale | null {
  if (typeof window === 'undefined') return DEFAULT_LOCALE
  return getLocaleFromPathname(window.location.pathname)
}

export function getLocalizedUrl(locale: Locale): string {
  return `${SITE_ORIGIN}/${locale}/`
}

export function getDefaultLocaleRedirectPath(): string {
  return `/${DEFAULT_LOCALE}/`
}

export function syncLocaleHead(locale: Locale): void {
  if (typeof document === 'undefined') return

  document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
  upsertLink('canonical', getLocalizedUrl(locale))
  upsertAlternate('en', getLocalizedUrl('en'))
  upsertAlternate('zh', getLocalizedUrl('zh'))
  upsertAlternate('x-default', getLocalizedUrl(DEFAULT_LOCALE))
  upsertMetaProperty('og:url', getLocalizedUrl(locale))
}

function upsertLink(rel: string, href: string): void {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]:not([hreflang])`)

  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    document.head.appendChild(element)
  }

  element.href = href
}

function upsertAlternate(hreflang: string, href: string): void {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${hreflang}"]`)

  if (!element) {
    element = document.createElement('link')
    element.rel = 'alternate'
    element.hreflang = hreflang
    document.head.appendChild(element)
  }

  element.href = href
}

function upsertMetaProperty(property: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('property', property)
    document.head.appendChild(element)
  }

  element.content = content
}

export function formatDepth(depthMeters: number, locale: Locale): string {
  const value = `${depthMeters.toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US')} m`

  return locale === 'zh'
    ? value.replace('m', '米')
    : value
}
