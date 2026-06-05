import type { Creature } from '../types/creature'

type CreatureJsonModule = {
  default: Creature
}

const creatureModules = import.meta.glob<CreatureJsonModule>(
  '../../content/creatures/*.json',
  { eager: true },
)

const initialCreatureId = 'yellow-boxfish'

export function loadCreatures(): Creature[] {
  return Object.values(creatureModules)
    .map((module) => module.default)
    .sort((a, b) => a.displayDepthMeters - b.displayDepthMeters)
}

export function findInitialCreature(creatures: Creature[]): Creature {
  const configuredInitialCreature = creatures.find((creature) => creature.id === initialCreatureId)
  const firstModelCandidate = creatures.find((creature) => creature.model.url)
  const firstPublishedCandidate = creatures.find(
    (creature) => creature.provenance.reviewStatus === 'source-backed',
  )
  return configuredInitialCreature ?? firstModelCandidate ?? firstPublishedCandidate ?? creatures[0]
}
