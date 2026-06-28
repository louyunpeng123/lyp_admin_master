import type { Component } from 'vue'

export interface MenuItem {
  path: string
  title: string
  icon: Component
  children?: MenuItem[]
}
