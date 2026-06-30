import * as ElementPlusIcons from '@element-plus/icons-vue'
import type { Component } from 'vue'

const iconMap = ElementPlusIcons as Record<string, Component>

export function resolveIcon(name?: string): Component {
  if (!name) return iconMap.Menu
  return iconMap[name] || iconMap.Menu
}

export const iconOptions = Object.keys(ElementPlusIcons).sort()
