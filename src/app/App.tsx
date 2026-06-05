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
import type { Locale, ZoneId } from '../types/creature'
import { getStoredLocale, storeLocale, uiCopy } from '../i18n/locale'
import { DEPTH_BACKGROUND_BASE_ZOOM, DepthBackground2D, hasDepthBackground2D } from '../environment/DepthBackground2D'
import './App.css'

export function App() {
  const creatures = useMemo(() => loadCreatures(), [])
  const [locale, setLocale] = useState<Locale>(getStoredLocale)
  const initialCreature = useMemo(() => findInitialCreature(creatures), [creatures])
  const [selectedCreatureId, setSelectedCreatureId] = useState(initialCreature.id)
  const [activeZoneOverviewId, setActiveZoneOverviewId] = useState<ZoneId | null>(null)
  const [isEditorialActive, setIsEditorialActive] = useState(false)
  const [depthBackgroundZoom, setDepthBackgroundZoom] = useState(DEPTH_BACKGROUND_BASE_ZOOM)
  const [entryReplayToken, setEntryReplayToken] = useState(0)
  const [isRightRailOpen, setIsRightRailOpen] = useState(false)
  const selectedCreature = creatures.find((creature) => creature.id === selectedCreatureId) ?? initialCreature
  const insightCards = useMemo(() => getCreatureInsightCards(selectedCreature, locale), [selectedCreature, locale])
  const [activeInsightId, setActiveInsightId] = useState(SUMMARY_INSIGHT_ID)
  const activeInsight = insightCards.find((card) => card.id === activeInsightId) ?? insightCards[0]
  const activeZoneOverview = activeZoneOverviewId
    ? depthZones.find((zone) => zone.id === activeZoneOverviewId) ?? null
    : null
  const activeZoneId = isEditorialActive ? 'sunlight' : activeZoneOverview?.id ?? selectedCreature.zone
  const activeZoneStory = !isEditorialActive && activeZoneOverview ? getZoneStory(activeZoneOverview.id, locale) : null
  const theme = getDepthTheme(activeZoneId)
  const copy = uiCopy[locale]
  const rightRailId = 'oceaneye-right-rail'

  useEffect(() => {
    setActiveInsightId(SUMMARY_INSIGHT_ID)
    setActiveZoneOverviewId(null)
    setDepthBackgroundZoom(DEPTH_BACKGROUND_BASE_ZOOM)
  }, [selectedCreature.id])

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
    storeLocale(locale)
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
    creatures.forEach((creature) => {
      if (creature.model.url) useGLTF.preload(creature.model.url)
    })
  }, [creatures])

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
    const isCurrentCreature = creatureId === selectedCreature.id && !activeZoneOverviewId && !isEditorialActive

    if (isCurrentCreature && activeInsightId === SUMMARY_INSIGHT_ID) {
      setEntryReplayToken((token) => token + 1)
      setDepthBackgroundZoom(DEPTH_BACKGROUND_BASE_ZOOM)
      return
    }

    setSelectedCreatureId(creatureId)
    setActiveInsightId(SUMMARY_INSIGHT_ID)
    setActiveZoneOverviewId(null)
    setIsEditorialActive(false)
    setDepthBackgroundZoom(DEPTH_BACKGROUND_BASE_ZOOM)
  }

  function handleSelectZone(zoneId: ZoneId) {
    setActiveInsightId(SUMMARY_INSIGHT_ID)
    setIsEditorialActive(false)
    setDepthBackgroundZoom(DEPTH_BACKGROUND_BASE_ZOOM)
    setActiveZoneOverviewId(zoneId)
  }

  function handleSelectEditorial() {
    setActiveInsightId(SUMMARY_INSIGHT_ID)
    setActiveZoneOverviewId(null)
    setIsEditorialActive(true)
    setDepthBackgroundZoom(DEPTH_BACKGROUND_BASE_ZOOM)
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
        locale={locale}
        onLocaleChange={setLocale}
      />
      {isEditorialActive ? (
        <EditorialStage locale={locale} />
      ) : activeZoneOverview && activeZoneStory ? (
        <ZoneOverviewStage
          zone={activeZoneOverview}
          story={activeZoneStory}
          locale={locale}
        />
      ) : (
        <CreatureStage
          creature={selectedCreature}
          activeInsightId={activeInsight?.id}
          activeViewPresetId={activeInsight?.viewPresetId}
          entryReplayToken={entryReplayToken}
          theme={theme}
          locale={locale}
          onDepthBackgroundZoomChange={hasDepthBackground2D(selectedCreature.zone) ? setDepthBackgroundZoom : undefined}
          onResetView={() => {
            setActiveInsightId(SUMMARY_INSIGHT_ID)
            setDepthBackgroundZoom(DEPTH_BACKGROUND_BASE_ZOOM)
          }}
        />
      )}
      {isEditorialActive ? (
        <EditorialRail id={rightRailId} locale={locale} />
      ) : activeZoneStory ? (
        <ZoneSourceRail
          id={rightRailId}
          story={activeZoneStory}
          locale={locale}
        />
      ) : (
        <InsightRail
          id={rightRailId}
          cards={insightCards}
          activeCardId={activeInsight?.id ?? SUMMARY_INSIGHT_ID}
          locale={locale}
          onSelectCard={setActiveInsightId}
        />
      )}
    </main>
  )
}
