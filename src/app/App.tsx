import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useGLTF } from '@react-three/drei'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { DepthNavigator } from '../depth/DepthNavigator'
import { depthZones } from '../depth/depthZones'
import { getDepthTheme } from '../depth/depthTheme'
import { getZoneStory } from '../depth/zoneStories'
import { ZoneOverviewStage } from '../depth/ZoneOverviewStage'
import { ZoneSourceRail } from '../depth/ZoneSourceRail'
import { CreatureStage } from '../creatures/CreatureStage'
import { InsightRail } from '../creatures/InsightRail'
import { EditorialRail } from '../editorial/EditorialRail'
import { EditorialStage } from '../editorial/EditorialStage'
import { getCreatureInsightCards, SUMMARY_INSIGHT_ID } from '../creatures/creatureInsights'
import { findInitialCreature, loadCreatures } from '../content/loadCreatures'
import type { ZoneId } from '../types/creature'
import { DEFAULT_LOCALE, getCurrentLocale, getDefaultLocaleRedirectPath, syncLocaleHead, uiCopy } from '../i18n/locale'
import { DEPTH_BACKGROUND_BASE_ZOOM, DepthBackground2D, hasDepthBackground2D } from '../environment/DepthBackground2D'
import './App.css'

type ViewMode =
  | { kind: 'creature' }
  | { kind: 'zone'; zoneId: ZoneId }
  | { kind: 'editorial' }

export function App() {
  const creatures = useMemo(() => loadCreatures(), [])
  const locale = getCurrentLocale()
  const resolvedLocale = locale ?? DEFAULT_LOCALE
  const initialCreature = useMemo(() => findInitialCreature(creatures), [creatures])
  const [selectedCreatureId, setSelectedCreatureId] = useState(initialCreature.id)
  const [viewMode, setViewMode] = useState<ViewMode>({ kind: 'creature' })
  const [depthBackgroundZoom, setDepthBackgroundZoom] = useState(DEPTH_BACKGROUND_BASE_ZOOM)
  const [entryReplayToken, setEntryReplayToken] = useState(0)
  const [isRightRailOpen, setIsRightRailOpen] = useState(false)
  const selectedCreature = creatures.find((creature) => creature.id === selectedCreatureId) ?? initialCreature
  const insightCards = useMemo(() => getCreatureInsightCards(selectedCreature, resolvedLocale), [selectedCreature, resolvedLocale])
  const [activeInsightId, setActiveInsightId] = useState(SUMMARY_INSIGHT_ID)
  const activeInsight = insightCards.find((card) => card.id === activeInsightId) ?? insightCards[0]
  const activeZoneOverviewId = viewMode.kind === 'zone' ? viewMode.zoneId : null
  const isEditorialActive = viewMode.kind === 'editorial'
  const activeZoneOverview = activeZoneOverviewId
    ? depthZones.find((zone) => zone.id === activeZoneOverviewId) ?? null
    : null
  const activeZoneId = isEditorialActive ? 'sunlight' : activeZoneOverview?.id ?? selectedCreature.zone
  const activeZoneStory = activeZoneOverview ? getZoneStory(activeZoneOverview.id, resolvedLocale) : null
  const theme = getDepthTheme(activeZoneId)
  const copy = uiCopy[resolvedLocale]
  const rightRailId = 'oceaneye-right-rail'

  useEffect(() => {
    if (locale) return
    window.location.replace(getDefaultLocaleRedirectPath())
  }, [locale])

  useEffect(() => {
    setActiveInsightId(SUMMARY_INSIGHT_ID)
    setViewMode({ kind: 'creature' })
    setDepthBackgroundZoom(DEPTH_BACKGROUND_BASE_ZOOM)
  }, [selectedCreature.id])

  useEffect(() => {
    if (!locale) return
    syncLocaleHead(locale)
  }, [locale])

  useEffect(() => {
    if (!activeZoneOverviewId) return
    if (!window.matchMedia('(max-width: 760px)').matches) return

    const frameId = window.requestAnimationFrame(() => {
      document.querySelector('.zone-overview-stage')?.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
      })
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [activeZoneOverviewId])

  useEffect(() => {
    const initialModelUrl = initialCreature.model.url
    if (initialModelUrl) useGLTF.preload(initialModelUrl)

    const remainingModelUrls = creatures
      .map((creature) => creature.model.url)
      .filter((url): url is string => Boolean(url && url !== initialModelUrl))

    if (remainingModelUrls.length === 0) return undefined

    let cancelled = false
    const preloadRemainingModels = () => {
      if (cancelled) return
      remainingModelUrls.forEach((url) => useGLTF.preload(url))
    }
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (idleWindow.requestIdleCallback) {
      const idleHandle = idleWindow.requestIdleCallback(preloadRemainingModels, { timeout: 2500 })

      return () => {
        cancelled = true
        idleWindow.cancelIdleCallback?.(idleHandle)
      }
    }

    const timeoutHandle = window.setTimeout(preloadRemainingModels, 1200)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutHandle)
    }
  }, [creatures, initialCreature.model.url])

  useEffect(() => {
    if (!isRightRailOpen) return undefined

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsRightRailOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRightRailOpen])

  const style = {
    '--water-color': theme.waterColor,
    '--fog-color': theme.fogColor,
    '--accent': theme.accent,
  } as CSSProperties

  function handleSelectCreature(creatureId: string) {
    const isCurrentCreature = creatureId === selectedCreature.id && viewMode.kind === 'creature'

    if (isCurrentCreature && activeInsightId === SUMMARY_INSIGHT_ID) {
      setEntryReplayToken((token) => token + 1)
      setDepthBackgroundZoom(DEPTH_BACKGROUND_BASE_ZOOM)
      return
    }

    setSelectedCreatureId(creatureId)
    setActiveInsightId(SUMMARY_INSIGHT_ID)
    setViewMode({ kind: 'creature' })
    setDepthBackgroundZoom(DEPTH_BACKGROUND_BASE_ZOOM)
  }

  function handleSelectZone(zoneId: ZoneId) {
    setActiveInsightId(SUMMARY_INSIGHT_ID)
    setDepthBackgroundZoom(DEPTH_BACKGROUND_BASE_ZOOM)
    setViewMode({ kind: 'zone', zoneId })
  }

  function handleSelectEditorial() {
    setActiveInsightId(SUMMARY_INSIGHT_ID)
    setDepthBackgroundZoom(DEPTH_BACKGROUND_BASE_ZOOM)
    setViewMode({ kind: 'editorial' })
  }

  return (
    <main
      className={`app-shell zone-${activeZoneId}${activeZoneOverview ? ' zone-overview-active' : ''}${isRightRailOpen ? ' right-rail-open' : ''}`}
      style={style}
    >
      <DepthBackground2D zone={activeZoneId} zoom={depthBackgroundZoom} />
      <div className="ocean-backdrop" aria-hidden="true" />
      <button
        type="button"
        className="right-rail-toggle"
        onClick={() => setIsRightRailOpen((isOpen) => !isOpen)}
        aria-controls={rightRailId}
        aria-expanded={isRightRailOpen}
        aria-label={isRightRailOpen ? copy.closeRightPanel : copy.openRightPanel}
        title={isRightRailOpen ? copy.closeRightPanel : copy.openRightPanel}
      >
        {isRightRailOpen ? (
          <PanelRightClose size={18} strokeWidth={2.2} aria-hidden="true" />
        ) : (
          <PanelRightOpen size={18} strokeWidth={2.2} aria-hidden="true" />
        )}
      </button>
      <DepthNavigator
        creatures={creatures}
        selectedCreatureId={selectedCreature.id}
        activeZoneOverviewId={activeZoneOverviewId}
        isEditorialActive={isEditorialActive}
        onSelectCreature={handleSelectCreature}
        onSelectZone={handleSelectZone}
        onSelectEditorial={handleSelectEditorial}
        locale={resolvedLocale}
      />
      {isEditorialActive ? (
        <EditorialStage locale={resolvedLocale} />
      ) : activeZoneOverview && activeZoneStory ? (
        <ZoneOverviewStage
          zone={activeZoneOverview}
          story={activeZoneStory}
          locale={resolvedLocale}
        />
      ) : (
        <CreatureStage
          creature={selectedCreature}
          activeInsightId={activeInsight?.id}
          activeViewPresetId={activeInsight?.viewPresetId}
          entryReplayToken={entryReplayToken}
          theme={theme}
          locale={resolvedLocale}
          onDepthBackgroundZoomChange={hasDepthBackground2D(selectedCreature.zone) ? setDepthBackgroundZoom : undefined}
          onResetView={() => {
            setActiveInsightId(SUMMARY_INSIGHT_ID)
            setDepthBackgroundZoom(DEPTH_BACKGROUND_BASE_ZOOM)
          }}
        />
      )}
      {isEditorialActive ? (
        <EditorialRail id={rightRailId} locale={resolvedLocale} />
      ) : activeZoneStory ? (
        <ZoneSourceRail
          id={rightRailId}
          story={activeZoneStory}
          locale={resolvedLocale}
        />
      ) : (
        <InsightRail
          id={rightRailId}
          cards={insightCards}
          activeCardId={activeInsight?.id ?? SUMMARY_INSIGHT_ID}
          locale={resolvedLocale}
          onSelectCard={setActiveInsightId}
        />
      )}
    </main>
  )
}
