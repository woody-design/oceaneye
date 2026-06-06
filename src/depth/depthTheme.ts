import type { ZoneId } from '../types/creature'

export type DepthTheme = {
  id: ZoneId
  waterColor: string
  fogColor: string
  accent: string
  ambientLight: number
  keyLight: number
  particleOpacity: number
  particleDensity: number
  bioluminescenceDensity: number
}

export const depthThemes: Record<ZoneId, DepthTheme> = {
  sunlight: {
    id: 'sunlight',
    waterColor: '#2fb7c7',
    fogColor: '#a7f0e8',
    accent: '#e7fbff',
    ambientLight: 1.15,
    keyLight: 2.1,
    particleOpacity: 0.28,
    particleDensity: 36,
    bioluminescenceDensity: 0,
  },
  twilight: {
    id: 'twilight',
    waterColor: '#0f5f82',
    fogColor: '#143d60',
    accent: '#6fe0ff',
    ambientLight: 0.58,
    keyLight: 1.1,
    particleOpacity: 0.36,
    particleDensity: 54,
    bioluminescenceDensity: 10,
  },
  midnight: {
    id: 'midnight',
    waterColor: '#06192b',
    fogColor: '#06111f',
    accent: '#8cf4ff',
    ambientLight: 0.28,
    keyLight: 0.72,
    particleOpacity: 0.44,
    particleDensity: 64,
    bioluminescenceDensity: 18,
  },
  abyssal: {
    id: 'abyssal',
    waterColor: '#030914',
    fogColor: '#02060d',
    accent: '#f0a7b7',
    ambientLight: 0.18,
    keyLight: 0.62,
    particleOpacity: 0.5,
    particleDensity: 72,
    bioluminescenceDensity: 8,
  },
  hadal: {
    id: 'hadal',
    waterColor: '#01040a',
    fogColor: '#010307',
    accent: '#e7f0ff',
    ambientLight: 0.12,
    keyLight: 0.48,
    particleOpacity: 0.42,
    particleDensity: 58,
    bioluminescenceDensity: 4,
  },
}

export function getDepthTheme(zone: ZoneId): DepthTheme {
  return depthThemes[zone]
}
