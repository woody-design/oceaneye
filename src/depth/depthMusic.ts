import type { Creature, ZoneId } from '../types/creature'

export type DepthMusicTrack = {
  title: string
  artist: string
  url?: string
  isPlaceholder?: boolean
}

type MusicTrackId =
  | 'sunlight-wonderful-world'
  | 'longspine-bluette'
  | 'twilight-sleep-pt-1'
  | 'twilight-placeholder'
  | 'orca-departure'
  | 'manta-of-agnes'
  | 'manta-vladimirs-blues'
  | 'oarfish-lamenting-song'
  | 'midnight-placeholder'
  | 'midnight-dust'
  | 'abyssal-placeholder'
  | 'hadal-to-the-stars'
  | 'hadal-brahms-lullaby'

const musicTracks: Record<MusicTrackId, DepthMusicTrack> = {
  'sunlight-wonderful-world': {
    title: 'What A Wonderful World',
    artist: 'Jon Batiste',
    url: 'https://open.spotify.com/track/0HJJq2ZuBrLqdOOvMmSP38',
  },
  'longspine-bluette': {
    title: 'Bluette',
    artist: 'The Dave Brubeck Quartet',
    url: 'https://open.spotify.com/track/0io8Uq8AO7qiFaF3eaPXr2',
  },
  'twilight-sleep-pt-1': {
    title: 'Dream 1',
    artist: 'Max Richter',
    url: 'https://open.spotify.com/track/3FVy3aVs0TFzLv6FEiLqC2',
  },
  'twilight-placeholder': {
    title: 'Twilight companion track',
    artist: 'To be selected',
    isPlaceholder: true,
  },
  'orca-departure': {
    title: 'The Departure',
    artist: 'Max Richter',
    url: 'https://open.spotify.com/track/3KG9I4JXpDwNQOsotE3uLh',
  },
  'manta-of-agnes': {
    title: 'Of Agnes',
    artist: 'Max Richter',
    url: 'https://open.spotify.com/track/3vRhZ2fkbfm6vKIMVu6BH9',
  },
  'manta-vladimirs-blues': {
    title: "Vladimir's Blues",
    artist: 'Max Richter',
    url: 'https://open.spotify.com/track/1gVXTJVSekOTCH8hhibcqi',
  },
  'oarfish-lamenting-song': {
    title: 'A Lamenting Song',
    artist: 'Max Richter',
    url: 'https://open.spotify.com/track/0uGx3Wf2nqE68lgv2OJq4u',
  },
  'midnight-placeholder': {
    title: 'Midnight companion track',
    artist: 'To be selected',
    isPlaceholder: true,
  },
  'midnight-dust': {
    title: 'Dust',
    artist: 'Hans Zimmer',
    url: 'https://open.spotify.com/track/6NNW7XLQ5BecXtPumwkPd5',
  },
  'abyssal-placeholder': {
    title: 'Abyssal companion track',
    artist: 'To be selected',
    isPlaceholder: true,
  },
  'hadal-to-the-stars': {
    title: 'To the Stars',
    artist: 'Max Richter',
    url: 'https://open.spotify.com/track/2dtrlde3pzEhlaUOwTpEew',
  },
  'hadal-brahms-lullaby': {
    title: 'Brahms Lullaby',
    artist: 'Dave Brubeck',
    url: 'https://open.spotify.com/track/3yzWXzGFgVd5q4MlzKLzDB',
  },
}

const depthMusicTrackIds: Record<ZoneId, MusicTrackId> = {
  sunlight: 'sunlight-wonderful-world',
  twilight: 'manta-of-agnes',
  midnight: 'twilight-sleep-pt-1',
  abyssal: 'midnight-dust',
  hadal: 'hadal-brahms-lullaby',
}

const creatureMusicTrackIds: Record<string, MusicTrackId> = {
  'barreleye-fish': 'twilight-placeholder',
  'clownfish-anemone': 'sunlight-wonderful-world',
  'dumbo-octopus': 'twilight-sleep-pt-1',
  'giant-manta-ray': 'manta-vladimirs-blues',
  'giant-oarfish': 'oarfish-lamenting-song',
  'green-sea-turtle': 'sunlight-wonderful-world',
  'hadal-snailfish': 'hadal-brahms-lullaby',
  'longspine-seahorse': 'longspine-bluette',
  'ocean-sunfish': 'manta-of-agnes',
  orca: 'orca-departure',
  'sea-pig': 'midnight-dust',
  'tripod-fish': 'midnight-dust',
  'yellow-boxfish': 'sunlight-wonderful-world',
}

export function getDepthMusicTrack(zone: ZoneId): DepthMusicTrack {
  return musicTracks[depthMusicTrackIds[zone]]
}

export function getCreatureMusicTrack(creature: Pick<Creature, 'id' | 'zone'>): DepthMusicTrack {
  const trackId = creatureMusicTrackIds[creature.id] ?? depthMusicTrackIds[creature.zone]

  return musicTracks[trackId]
}
