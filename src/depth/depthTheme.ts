import type { ZoneId } from '../types/creature'

export type DepthTheme = {
  id: ZoneId
  waterColor: string
  fogColor: string
  panelTint: string
  accent: string
  ambientLight: number
  keyLight: number
  fogDensity: number
  particleOpacity: number
  particleDensity: number
  bioluminescenceDensity: number
}

export const depthThemes: Record<ZoneId, DepthTheme> = {
  sunlight: {
    id: 'sunlight',
    waterColor: '#2fb7c7',
    fogColor: '#a7f0e8',
    panelTint: 'rgba(7, 39, 46, 0.54)',
    accent: '#e7fbff',
    ambientLight: 1.15,
    keyLight: 2.1,
    fogDensity: 0.018,
    particleOpacity: 0.28,
    particleDensity: 36,
    bioluminescenceDensity: 0,
  },
  twilight: {
    id: 'twilight',
    waterColor: '#0f5f82',
    fogColor: '#143d60',
    panelTint: 'rgba(4, 20, 35, 0.68)',
    accent: '#6fe0ff',
    ambientLight: 0.58,
    keyLight: 1.1,
    fogDensity: 0.036,
    particleOpacity: 0.36,
    particleDensity: 54,
    bioluminescenceDensity: 10,
  },
  midnight: {
    id: 'midnight',
    waterColor: '#06192b',
    fogColor: '#06111f',
    panelTint: 'rgba(3, 10, 20, 0.76)',
    accent: '#8cf4ff',
    ambientLight: 0.28,
    keyLight: 0.72,
    fogDensity: 0.046,
    particleOpacity: 0.44,
    particleDensity: 64,
    bioluminescenceDensity: 18,
  },
  abyssal: {
    id: 'abyssal',
    waterColor: '#030914',
    fogColor: '#02060d',
    panelTint: 'rgba(2, 7, 14, 0.82)',
    accent: '#f0a7b7',
    ambientLight: 0.18,
    keyLight: 0.62,
    fogDensity: 0.052,
    particleOpacity: 0.5,
    particleDensity: 72,
    bioluminescenceDensity: 8,
  },
  hadal: {
    id: 'hadal',
    waterColor: '#01040a',
    fogColor: '#010307',
    panelTint: 'rgba(1, 4, 9, 0.88)',
    accent: '#e7f0ff',
    ambientLight: 0.12,
    keyLight: 0.48,
    fogDensity: 0.06,
    particleOpacity: 0.42,
    particleDensity: 58,
    bioluminescenceDensity: 4,
  },
}

export function getDepthTheme(zone: ZoneId): DepthTheme {
  return depthThemes[zone]
}
