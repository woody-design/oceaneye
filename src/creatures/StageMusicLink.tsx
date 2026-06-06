import { Music } from 'lucide-react'
import type { DepthMusicTrack } from '../depth/depthMusic'
import type { Locale } from '../types/creature'
import { uiCopy } from '../i18n/locale'

type StageMusicLinkProps = {
  track: DepthMusicTrack
  locale: Locale
}

export function StageMusicLink({ track, locale }: StageMusicLinkProps) {
  const copy = uiCopy[locale]
  const label = `${copy.openSpotify}: ${track.title} · ${track.artist}`
  const content = (
    <>
      <span className="stage-music-symbol" aria-hidden="true">
        <Music size={12} strokeWidth={2.4} />
      </span>
      <span className="stage-music-text">{track.title} · {track.artist}</span>
    </>
  )

  if (!track.url) {
    return (
      <span
        className="stage-music-link stage-music-link-placeholder"
        aria-label={label}
      >
        {content}
      </span>
    )
  }

  return (
    <a
      className="stage-music-link"
      href={track.url}
      target="_blank"
      rel="noreferrer"
      onPointerDown={(event) => event.stopPropagation()}
      aria-label={label}
    >
      {content}
    </a>
  )
}
