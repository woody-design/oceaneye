import type { DepthZone } from '../types/creature'

export const depthZones: DepthZone[] = [
  {
    id: 'sunlight',
    label: 'Sunlight Zone',
    translations: {
      zh: {
        label: '阳光层',
        description: '明亮的上层海洋，熟悉的珊瑚礁与蓝水生命从这里开始。',
      },
    },
    depthRangeMeters: { min: 0, max: 200 },
    description: 'Bright upper ocean where familiar reef and blue-water life begins the journey.',
  },
  {
    id: 'twilight',
    label: 'Twilight Zone',
    translations: {
      zh: {
        label: '暮光层',
        description: '昏暗的中层水域，弱光视觉、透明组织和生物发光成为生存工具。',
      },
    },
    depthRangeMeters: { min: 200, max: 1000 },
    description: 'Dim midwater where low-light vision, transparency, and bioluminescence become survival tools.',
  },
  {
    id: 'midnight',
    label: 'Midnight Zone',
    translations: {
      zh: {
        label: '午夜层',
        description: '黑暗的开放海洋，能量稀缺，许多动物携带自己的光。',
      },
    },
    depthRangeMeters: { min: 1000, max: 4000 },
    description: 'Dark open ocean where energy is scarce and many animals carry their own light.',
  },
  {
    id: 'abyssal',
    label: 'Abyssal Zone',
    translations: {
      zh: {
        label: '深渊层',
        description: '寒冷的海底平原，生命依赖从上方沉降而来的物质。',
      },
    },
    depthRangeMeters: { min: 4000, max: 6000 },
    description: 'Cold seafloor plains where life depends on what falls from above.',
  },
  {
    id: 'hadal',
    label: 'Hadal Zone',
    translations: {
      zh: {
        label: '超深渊层',
        description: '海沟世界，接近动物生命承受压力的边界。',
      },
    },
    depthRangeMeters: { min: 6000, max: null },
    description: 'Ocean trenches near the limits of pressure-adapted animal life.',
  },
]

export function getDepthZoneLabel(zone: DepthZone, locale: 'zh' | 'en'): string {
  return locale === 'zh' ? zone.translations?.zh?.label ?? zone.label : zone.label
}

export function getDepthZoneDescription(zone: DepthZone, locale: 'zh' | 'en'): string {
  return locale === 'zh' ? zone.translations?.zh?.description ?? zone.description : zone.description
}
